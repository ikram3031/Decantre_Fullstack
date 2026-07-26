import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import { OrderModel } from "../src/models/order.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const wpDbDir = path.join(projectRoot, "wp_db");

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "perfume-store";
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI must be defined in .env");
}

const CSV_PATTERNS = {
  orders: "wp_wc_orders",
  addresses: "wp_wc_order_addresses",
  items: "wp_woocommerce_order_items",
  itemmeta: "wp_woocommerce_order_itemmeta",
};

const findCsvFile = (pattern) => {
  const files = fs.readdirSync(wpDbDir);
  const file = files.find((name) => name.includes(pattern) && name.endsWith(".csv"));
  if (!file) {
    throw new Error(`Cannot locate CSV file matching pattern: ${pattern} in ${wpDbDir}`);
  }
  return path.join(wpDbDir, file);
};

const parseCsv = (csvPath) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(csvPath)
      .pipe(csvParser({ mapHeaders: ({ header }) => header.trim() }))
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
};

const normalizeText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const parseSize = (name, metaSize) => {
  if (metaSize) {
    return normalizeText(metaSize).replace(/\s+/g, " ");
  }
  if (!name) return "";
  const match = name.match(/(\d{1,3}(?:\.\d+)?\s*(?:ml|ML|Ml))/);
  return match ? match[0].toUpperCase().replace(/\s+/g, "") : "";
};

const parseConcentration = (name, metaConcentration) => {
  if (metaConcentration) return normalizeText(metaConcentration).toUpperCase();
  if (!name) return "";
  const keys = ["EXTRAIT", "PARFUM", "EDP", "EDT", "ELIXIR", "INTENSE", "ABSOLU", "PURE", "POUR HOMME", "EAU DE PARFUM", "EAU DE TOILETTE"];
  const upperName = name.toUpperCase();
  const found = keys.find((key) => upperName.includes(key));
  return found ? found : "";
};

const mapStatus = (wpStatus) => {
  const status = String(wpStatus || "").toLowerCase();
  if (status.includes("completed")) return "completed";
  if (status.includes("processing") || status.includes("on-hold")) return "processing";
  if (status.includes("cancelled") || status.includes("refunded") || status.includes("failed")) return "cancelled";
  return "received";
};

const parseOrderNumbers = (orderId) => {
  const numericId = normalizeText(orderId);
  return numericId ? `WP${numericId}` : `WP-${Date.now()}`;
};

const buildItems = (orderItems, itemMetaRows) => {
  const metaByItemId = new Map();
  for (const row of itemMetaRows) {
    const itemId = normalizeText(row.order_item_id);
    if (!itemId) continue;
    if (!metaByItemId.has(itemId)) metaByItemId.set(itemId, []);
    metaByItemId.get(itemId).push(row);
  }

  const lineItems = [];
  for (const row of orderItems) {
    const orderItemType = normalizeText(row.order_item_type).toLowerCase();
    if (orderItemType !== "line_item") continue;

    const orderItemId = normalizeText(row.order_item_id);
    const itemMeta = metaByItemId.get(orderItemId) || [];
    const productName = normalizeText(row.order_item_name);
    const qty = Number(itemMeta.find((meta) => meta.meta_key === "_qty")?.meta_value || "1");
    const lineTotal = Number(itemMeta.find((meta) => meta.meta_key === "_line_total")?.meta_value || "0");
    const sizeMeta = itemMeta.find((meta) => /decant-size/i.test(meta.meta_key))?.meta_value;
    const concentrationMeta = itemMeta.find((meta) => /concentration/i.test(meta.meta_key))?.meta_value;
    const size = parseSize(productName, sizeMeta);
    const concentration = parseConcentration(productName, concentrationMeta);
    const unitPrice = qty > 0 ? lineTotal / qty : lineTotal;

    lineItems.push({
      name: productName || "Unknown product",
      quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      size: size || "",
      concentration: concentration || "",
    });
  }

  return lineItems;
};

const buildShippingAndTotals = (orderId, orderRows, orderItems, itemMetaRows) => {
  const orderRow = orderRows.find((row) => normalizeText(row.id) === normalizeText(orderId));
  const totalAmount = Number(orderRow?.total_amount || orderRow?.total || 0);
  const taxAmount = Number(orderRow?.tax_amount || 0);

  const shippingItemIds = orderItems
    .filter((row) => normalizeText(row.order_item_type).toLowerCase() === "shipping")
    .map((row) => normalizeText(row.order_item_id));

  let shippingFee = 0;
  for (const itemId of shippingItemIds) {
    const metas = itemMetaRows.filter((row) => normalizeText(row.order_item_id) === itemId);
    for (const meta of metas) {
      if (normalizeText(meta.meta_key).toLowerCase() === "cost") {
        shippingFee += Number(meta.meta_value || 0);
      }
    }
  }

  // If shipping fee is missing, leave 0 and rely on totals.
  const subtotal = Math.max(
    0,
    totalAmount - shippingFee - taxAmount
  );

  return { subtotal, shippingFee, tax: taxAmount, total: totalAmount };
};

const parseAddressRows = (addressRows) => {
  const byOrder = new Map();
  for (const row of addressRows) {
    const orderId = normalizeText(row.order_id);
    if (!orderId) continue;
    if (!byOrder.has(orderId)) byOrder.set(orderId, {});
    const current = byOrder.get(orderId);
    const type = normalizeText(row.address_type).toLowerCase();
    const addressData = {
      firstName: normalizeText(row.first_name),
      lastName: normalizeText(row.last_name),
      company: normalizeText(row.company),
      address1: normalizeText(row.address_1),
      address2: normalizeText(row.address_2),
      city: normalizeText(row.city),
      state: normalizeText(row.state),
      postcode: normalizeText(row.postcode),
      country: normalizeText(row.country),
      email: normalizeText(row.email),
      phone: normalizeText(row.phone),
    };
    current[type] = addressData;
  }
  return byOrder;
};

const buildCustomer = (billingRow, orderRow) => {
  const firstName = normalizeText(billingRow?.firstName || "");
  const lastName = normalizeText(billingRow?.lastName || "");
  const fullName = `${firstName} ${lastName}`.trim() || normalizeText(orderRow?.billing_email || orderRow?.billing_email || "Guest");
  const address = [billingRow?.address1, billingRow?.address2].filter(Boolean).join(" ").trim();
  const district = billingRow?.city || billingRow?.state || "";

  return {
    fullName,
    phone: billingRow?.phone || "",
    email: billingRow?.email || normalizeText(orderRow?.billing_email || orderRow?.email || ""),
    address: address || "",
    city: billingRow?.city || "",
    thana: billingRow?.state || "",
    district: district || "",
    zip: billingRow?.postcode || "",
    giftWrap: false,
  };
};

const buildShippingAddress = (shippingRow) => {
  if (!shippingRow) return {};
  return {
    fullName: `${shippingRow.firstName || ""} ${shippingRow.lastName || ""}`.trim(),
    company: shippingRow.company || "",
    address1: shippingRow.address1 || "",
    address2: shippingRow.address2 || "",
    city: shippingRow.city || "",
    state: shippingRow.state || "",
    postcode: shippingRow.postcode || "",
    country: shippingRow.country || "",
    email: shippingRow.email || "",
    phone: shippingRow.phone || "",
  };
};

const main = async () => {
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
  console.log("Connected to MongoDB.");

  const files = {
    orders: findCsvFile(CSV_PATTERNS.orders),
    addresses: findCsvFile(CSV_PATTERNS.addresses),
    items: findCsvFile(CSV_PATTERNS.items),
    itemmeta: findCsvFile(CSV_PATTERNS.itemmeta),
  };

  console.log("Reading WP CSV files:");
  console.log(`  orders: ${files.orders}`);
  console.log(`  addresses: ${files.addresses}`);
  console.log(`  items: ${files.items}`);
  console.log(`  itemmeta: ${files.itemmeta}`);

  const [ordersRows, addressRows, itemRows, itemMetaRows] = await Promise.all([
    parseCsv(files.orders),
    parseCsv(files.addresses),
    parseCsv(files.items),
    parseCsv(files.itemmeta),
  ]);

  console.log(`Parsed ${ordersRows.length} orders, ${addressRows.length} addresses, ${itemRows.length} order items, ${itemMetaRows.length} item meta rows.`);

  console.log("Clearing existing Order collection...");
  await OrderModel.deleteMany({});
  console.log("Existing orders removed.");

  const addressByOrder = parseAddressRows(addressRows);
  const orderItemRowsByOrder = itemRows.reduce((map, row) => {
    const orderId = normalizeText(row.order_id);
    if (!orderId) return map;
    if (!map.has(orderId)) map.set(orderId, []);
    map.get(orderId).push(row);
    return map;
  }, new Map());

  const ordersToInsert = [];
  for (const orderRow of ordersRows) {
    const wpOrderId = normalizeText(orderRow.id);
    if (!wpOrderId) continue;

    const orderItems = orderItemRowsByOrder.get(wpOrderId) || [];
    const lineItems = buildItems(orderItems, itemMetaRows);
    const billing = addressByOrder.get(wpOrderId)?.billing || {};
    const shipping = addressByOrder.get(wpOrderId)?.shipping || {};
    const totals = buildShippingAndTotals(wpOrderId, ordersRows, orderItems, itemMetaRows);

    const orderDoc = {
      orderNumber: parseOrderNumbers(wpOrderId),
      status: mapStatus(orderRow.status),
      customer: buildCustomer(billing, orderRow),
      paymentMethod: normalizeText(orderRow.payment_method_title || orderRow.payment_method || ""),
      shippingAddress: buildShippingAddress(shipping),
      items: lineItems,
      totals,
      createdAt: orderRow.date_created_gmt ? new Date(orderRow.date_created_gmt) : undefined,
      updatedAt: orderRow.date_updated_gmt ? new Date(orderRow.date_updated_gmt) : undefined,
    };

    ordersToInsert.push(orderDoc);
  }

  console.log(`Importing ${ordersToInsert.length} orders into MongoDB...`);
  if (ordersToInsert.length > 0) {
    await OrderModel.insertMany(ordersToInsert, { ordered: false });
  }

  console.log("Migration complete.");
  await mongoose.disconnect();
  console.log("MongoDB disconnected.");
};

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
