import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import { OrderModel } from "../src/models/order.model.js";
import { MemberModel } from "../src/models/member.model.js";
import { PaymentModel } from "../src/models/payment.model.js";
import { ProductModel } from "../src/models/product.model.js";

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
  const triedDirs = [];
  const lcPattern = pattern.toLowerCase();

  const candidateDirs = [
    wpDbDir,
    projectRoot,
    path.join(projectRoot, "..", "wp_db"),
    __dirname,
    process.cwd(),
  ];

  for (const dir of candidateDirs) {
    if (!dir || triedDirs.includes(dir)) continue;
    triedDirs.push(dir);
    try {
      if (!fs.existsSync(dir)) continue;
      const stat = fs.statSync(dir);
      if (!stat.isDirectory()) continue;
      const files = fs.readdirSync(dir);
      const file = files.find((name) => {
        const n = name.toLowerCase();
        return n.includes(lcPattern) && (n.endsWith(".csv") || n.endsWith(".json"));
      });
      if (file) return path.join(dir, file);
    } catch (err) {
      // ignore and try next
    }
  }

  // Shallow recursive search under projectRoot (depth-limited)
  const matches = [];
  const walk = (dir, depth = 0) => {
    if (depth > 3) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
      return;
    }
    for (const ent of entries) {
      const childPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(childPath, depth + 1);
      } else if (ent.isFile()) {
        const name = ent.name.toLowerCase();
        if (name.includes(lcPattern) && name.endsWith(".csv")) {
          matches.push(childPath);
          if (matches.length >= 1) return;
        }
      }
    }
  };
  walk(projectRoot, 0);
  if (matches.length > 0) return matches[0];

  // If not found, return null so callers can gracefully handle missing files
  return null;
};

// parseCsv(csvPath): read a CSV file and return array of rows
// Uses `csv-parser` to stream and collect rows into memory
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

// parseJson(jsonPath): read a JSON export and return an array of rows
const parseJson = (jsonPath) => {
  const raw = fs.readFileSync(jsonPath, "utf-8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse JSON file ${jsonPath}: ${err.message}`);
  }

  if (Array.isArray(parsed)) {
    // some exports wrap tables as [{ type: 'table', name: 'wp_wc_orders', data: [...] }, ...]
    const table = parsed.find((p) => p && Array.isArray(p.data));
    if (table) return table.data;
    return parsed;
  }
  if (parsed && Array.isArray(parsed.data)) return parsed.data;
  if (parsed && Array.isArray(parsed.rows)) return parsed.rows;
  return [];
};

// loadDataFile(path): pick CSV or JSON parser based on file extension
const loadDataFile = async (filePath) => {
  if (!filePath) return [];
  const lc = filePath.toLowerCase();
  if (lc.endsWith(".csv")) return await parseCsv(filePath);
  if (lc.endsWith(".json")) return parseJson(filePath);
  throw new Error(`Unsupported file type for ${filePath}`);
};

// normalizeText(value): safely convert values to trimmed string
// Returns empty string for null/undefined
const normalizeText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

// parseSize(name, metaSize): extract perfumebottle size (e.g., 50ml) from product name
// or use explicit meta value when provided
const parseSize = (name, metaSize) => {
  if (metaSize) {
    return normalizeText(metaSize).replace(/\s+/g, " ");
  }
  if (!name) return "";
  const match = name.match(/(\d{1,3}(?:\.\d+)?\s*(?:ml|ML|Ml))/);
  return match ? match[0].toUpperCase().replace(/\s+/g, "") : "";
};

// parseConcentration(name, metaConcentration): infer concentration (EDP/EDT/etc.)
// from name or use meta when available
const parseConcentration = (name, metaConcentration) => {
  if (metaConcentration) return normalizeText(metaConcentration).toUpperCase();
  if (!name) return "";
  const keys = ["EXTRAIT", "PARFUM", "EDP", "EDT", "ELIXIR", "INTENSE", "ABSOLU", "PURE", "POUR HOMME", "EAU DE PARFUM", "EAU DE TOILETTE"];
  const upperName = name.toUpperCase();
  const found = keys.find((key) => upperName.includes(key));
  return found ? found : "";
};

// mapStatus(wpStatus): map WooCommerce order status text to internal enum
const mapStatus = (wpStatus) => {
  const status = String(wpStatus || "").toLowerCase();
  if (status.includes("completed")) return "completed";
  if (status.includes("processing") || status.includes("on-hold")) return "processing";
  if (status.includes("cancelled") || status.includes("refunded") || status.includes("failed")) return "cancelled";
  return "received";
};

// parseOrderNumbers(orderId): normalize WP order ID to our `orderNumber` string
const parseOrderNumbers = (orderId) => {
  const numericId = normalizeText(orderId);
  return numericId ? `WP${numericId}` : `WP-${Date.now()}`;
};

// buildItems(orderItems, itemMetaRows): construct array of line items for an order
// - groups item meta by order_item_id
// - extracts quantity, unit price, size and concentration
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
    const productIdMeta = normalizeText(itemMeta.find((meta) => meta.meta_key === "_product_id")?.meta_value || itemMeta.find((meta) => meta.meta_key === "product_id")?.meta_value || "");
    const size = parseSize(productName, sizeMeta);
    const concentration = parseConcentration(productName, concentrationMeta);
    const unitPrice = qty > 0 ? lineTotal / qty : lineTotal;

    lineItems.push({
      name: productName || "Unknown product",
      quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      size: size || "",
      concentration: concentration || "",
      productDid: productIdMeta || "",
    });
  }

  return lineItems;
};

// buildShippingAndTotals(orderId, ...): compute subtotal, shippingFee, tax and total
// - reads totals from the main order row and shipping item meta
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

// parseAddressRows(addressRows): convert flat address rows CSV into a Map by orderId
// Each map entry contains `billing` and/or `shipping` subobjects with normalized fields
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

// buildCustomer(billingRow, orderRow): create the `customer` object used in Order documents
// Prefers normalized billingRow fields, falls back to order row email when necessary
const buildCustomer = (billingRow, orderRow) => {
  const firstName = normalizeText(billingRow?.firstName || "");
  const lastName = normalizeText(billingRow?.lastName || "");
  const fullName = `${firstName} ${lastName}`.trim() || normalizeText(orderRow?.billing_email || orderRow?.billing_email || "Guest");
  const address = [billingRow?.address1, billingRow?.address2].filter(Boolean).join(" ").trim();
  const district = billingRow?.city || billingRow?.state || "";

  const phoneFallback = normalizeText(orderRow?.billing_phone || orderRow?.phone || orderRow?.billing_email || orderRow?.email || "unknown");
  return {
    fullName,
    phone: normalizeText(billingRow?.phone || phoneFallback || "unknown"),
    email: billingRow?.email || normalizeText(orderRow?.billing_email || orderRow?.email || ""),
    address: address || "",
    city: billingRow?.city || "",
    thana: billingRow?.state || "",
    district: district || "",
    zip: billingRow?.postcode || "",
    giftWrap: false,
  };
};

// buildShippingAddress(shippingRow): normalize shippingRow into the Order.shippingAddress shape
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

const isPaidPaymentMethod = (paymentMethod) => {
  const method = normalizeText(paymentMethod).toLowerCase();
  return /(?:^|\s)(cod|cash|full|paid)(?:\s|$)/i.test(method) || method.includes("cash") || method.includes("full");
};

const buildPaymentRecord = (order) => {
  const totalAmount = Number(order.totals?.total || 0);
  const shouldBePaid = order.status === "completed" || isPaidPaymentMethod(order.paymentMethod);
  const paidAmount = shouldBePaid ? totalAmount : 0;
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const status = shouldBePaid ? "paid" : paidAmount > 0 ? "partial" : "pending";

  return {
    orderId: order._id,
    paymentMethod: order.paymentMethod,
    paymentPhone: order.customer?.phone || "",
    totalAmount,
    paidAmount,
    pendingAmount,
    amount: paidAmount,
    status,
    createdBy: order.createdBy || null,
  };
};

const recalcMemberTotals = async (memberId) => {
  const orders = await OrderModel.find({ member: memberId }).select("status paymentMethod totals.total").lean();
  let totalOrderAmount = 0;
  let totalPaidAmount = 0;
  let totalPendingAmount = 0;

  for (const order of orders) {
    const amount = Number(order.totals?.total || 0);
    totalOrderAmount += amount;
    const orderIsPaid = order.status === "completed" || isPaidPaymentMethod(order.paymentMethod);
    if (orderIsPaid) {
      totalPaidAmount += amount;
    } else {
      totalPendingAmount += amount;
    }
  }

  await MemberModel.updateOne(
    { _id: memberId },
    { $set: { totalOrderAmount, totalPaidAmount, totalPendingAmount } },
  );
  console.log(`Updated totals for member ${memberId}: order=${totalOrderAmount}, paid=${totalPaidAmount}, pending=${totalPendingAmount}`);
};

const main = async () => {
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
  console.log("Connected to MongoDB.");
  console.log(`  mongoose readyState=${mongoose.connection.readyState}`);
  console.log(`  database=${mongoose.connection.db.databaseName}`);
  console.log(`  order collection=${OrderModel.collection.name}`);

  const files = {
    orders: findCsvFile(CSV_PATTERNS.orders),
    addresses: findCsvFile(CSV_PATTERNS.addresses),
    items: findCsvFile(CSV_PATTERNS.items),
    itemmeta: findCsvFile(CSV_PATTERNS.itemmeta),
  };

  console.log("Reading WP data files (CSV or JSON):");
  console.log(`  orders: ${files.orders || "(not found)"}`);
  console.log(`  addresses: ${files.addresses || "(not found)"}`);
  console.log(`  items: ${files.items || "(not found)"}`);
  console.log(`  itemmeta: ${files.itemmeta || "(not found)"}`);

  const [ordersRows, addressRows, itemRows, itemMetaRows] = await Promise.all([
    loadDataFile(files.orders),
    loadDataFile(files.addresses),
    loadDataFile(files.items),
    loadDataFile(files.itemmeta),
  ]);

  if (!ordersRows || ordersRows.length === 0) {
    throw new Error(`No orders data found. Ensure you have a wp_wc_orders.csv or wp_wc_orders.json in wp_db`);
  }

  const productLookupPath = findCsvFile("wp_wc_order_product_lookup");
  let productLookupRows = [];
  if (productLookupPath) {
    try {
      productLookupRows = await loadDataFile(productLookupPath);
      console.log(`Loaded ${productLookupRows.length} rows from product lookup`);
    } catch (err) {
      console.warn("Could not read product lookup file:", err.message || err);
    }
  }

  const operationalDataPath = findCsvFile("wp_wc_order_operational_data");
  let operationalDataRows = [];
  if (operationalDataPath) {
    try {
      operationalDataRows = await loadDataFile(operationalDataPath);
      console.log(`Loaded ${operationalDataRows.length} rows from operational data`);
    } catch (err) {
      console.warn("Could not read operational data file:", err.message || err);
    }
  }

  const operationalDataByOrder = operationalDataRows.reduce((map, row) => {
    const orderId = normalizeText(row.order_id || row.orderId || row.id);
    if (!orderId) return map;
    if (!map.has(orderId)) map.set(orderId, row);
    return map;
  }, new Map());

  const productLookupByOrder = productLookupRows.reduce((map, row) => {
    const orderId = normalizeText(row.order_id || row.order_id_text || row.order_id);
    if (!orderId) return map;
    if (!map.has(orderId)) map.set(orderId, []);
    map.get(orderId).push(row);
    return map;
  }, new Map());

  const postsFile = findCsvFile("wp_posts");
  let postTitleById = {};
  if (postsFile) {
    try {
      const postsRows = await loadDataFile(postsFile);
      for (const p of postsRows) {
        const id = normalizeText(p.ID || p.id || p.ID_text || "");
        const type = (p.post_type || p.post_type_text || "").toString();
        if (!id) continue;
        if (type === "product" || type === "product_variation") {
          postTitleById[id] = normalizeText(p.post_title || p.post_title_text || "");
        }
      }
      console.log(`Loaded ${Object.keys(postTitleById).length} product titles from wp_posts`);
    } catch (err) {
      console.warn("Could not read wp_posts file:", err.message || err);
    }
  }

  console.log(`Parsed ${ordersRows.length} orders, ${addressRows.length} addresses, ${itemRows.length} order items, ${itemMetaRows.length} item meta rows.`);
  console.log(`Loaded product lookup rows: ${productLookupRows.length}, orders with lookup entries: ${productLookupByOrder.size}`);
  console.log(`Loaded product titles from wp_posts: ${Object.keys(postTitleById).length}`);

  const addressByOrder = parseAddressRows(addressRows);
  const orderItemRowsByOrder = itemRows.reduce((map, row) => {
    const orderId = normalizeText(row.order_id);
    if (!orderId) return map;
    if (!map.has(orderId)) map.set(orderId, []);
    map.get(orderId).push(row);
    return map;
  }, new Map());

  const ordersToInsert = [];
  const maxOrders = 1000;
  // Try to parse order meta JSON (if present) to look for member `did` values
  const orderMetaJsonPath = path.join(wpDbDir, "wp_wc_orders_meta.json");
  let orderMetaMap = {};
  if (fs.existsSync(orderMetaJsonPath)) {
    try {
      const rawOrderMeta = fs.readFileSync(orderMetaJsonPath, "utf-8");
      const parsedOrderMeta = JSON.parse(rawOrderMeta);
      const metaTable = parsedOrderMeta.find((p) => p.type === "table" && (p.name === "wp_wc_orders_meta" || p.name === "wp_wc_order_meta" || p.name === "wp_postmeta"));
      const metaRows = metaTable && Array.isArray(metaTable.data) ? metaTable.data : parsedOrderMeta.data || [];
      for (const m of metaRows) {
        const orderId = normalizeText(m.order_id || m.post_id || m.post_parent || m.ID || m.meta_id);
        const key = (m.meta_key || m.meta_key_name || "").toString();
        const value = (m.meta_value || m.meta_value_text || "").toString();
        if (!orderId) continue;
        if (!orderMetaMap[orderId]) orderMetaMap[orderId] = {};
        if (!orderMetaMap[orderId][key]) orderMetaMap[orderId][key] = [];
        orderMetaMap[orderId][key].push(value);
      }
      console.log(`Loaded order meta for ${Object.keys(orderMetaMap).length} orders`);
    } catch (err) {
      console.warn('Could not parse order meta JSON:', err.message || err);
    }
  }
  for (const orderRow of ordersRows) {
    const wpOrderId = normalizeText(orderRow.id);
    if (!wpOrderId) continue;

    console.log(`Processing order ${wpOrderId} - status=${orderRow.status || "(no-status)"} - email=${orderRow.billing_email || orderRow.email || "(no-email)"}`);

    const orderItems = orderItemRowsByOrder.get(wpOrderId) || [];
    let lineItems = buildItems(orderItems, itemMetaRows);

    // If no line items from standard tables, try to build from product lookup table
    if ((!lineItems || lineItems.length === 0) && productLookupByOrder.has(wpOrderId)) {
      const lookupRows = productLookupByOrder.get(wpOrderId) || [];
      lineItems = [];
      for (const lr of lookupRows) {
        const pid = normalizeText(lr.product_id || lr.product_id_text || "");
        const qty = Number(lr.product_qty || lr.product_qty_text || lr.product_qty || 1) || 1;
        const gross = Number(lr.product_gross_revenue || lr.product_gross_revenue_text || lr.product_gross_revenue || 0) || 0;
        const unitPrice = qty > 0 ? gross / qty : gross;
        const prodName = postTitleById[pid] || `WP Product ${pid}`;

        // attempt to match existing product by name (case-insensitive)
        let matchedProduct = null;
        try {
          const escapedName = prodName.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
          const regex = new RegExp(`^${escapedName}$`, "i");
          matchedProduct = await ProductModel.findOne({ name: regex }).lean();
        } catch (err) {
          // ignore match errors
        }

        const itemObj = {
          name: prodName,
          quantity: qty,
          unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
          productDid: matchedProduct ? matchedProduct.did : "",
        };
        if (matchedProduct) console.log(`  Matched product for order ${wpOrderId}: ${prodName} -> ${matchedProduct.did}`);
        lineItems.push(itemObj);
      }
    }

    const billing = addressByOrder.get(wpOrderId)?.billing || {};
    const shipping = addressByOrder.get(wpOrderId)?.shipping || {};
    const totals = buildShippingAndTotals(wpOrderId, ordersRows, orderItems, itemMetaRows);

    if (!normalizeText(orderRow.payment_method_title || orderRow.payment_method)) {
      console.warn(`  Warning: order ${wpOrderId} has no payment method; defaulting to Unknown`);
    }

    const mappedStatus = mapStatus(orderRow.status);
    if (mappedStatus === "cancelled") {
      console.log(`Skipping cancelled order ${wpOrderId} (status=${orderRow.status || "unknown"})`);
      continue;
    }

    const operationalData = operationalDataByOrder.get(wpOrderId) || {};
    const shippingTotalAmount = Number(operationalData.shipping_total_amount || operationalData.shipping_total || 0);
    const discountTotalAmount = Number(operationalData.discount_total_amount || operationalData.discount_total || 0);

    const orderDoc = {
      orderNumber: parseOrderNumbers(wpOrderId),
      status: mappedStatus,
      customer: buildCustomer(billing, orderRow),
      // will try to link to existing member by email below
      paymentMethod: normalizeText(orderRow.payment_method_title || orderRow.payment_method || "Unknown"),
      shippingAddress: buildShippingAddress(shipping),
      shippingTotalAmount,
      discountTotalAmount,
      items: lineItems,
      totals,
      createdAt: orderRow.date_created_gmt ? new Date(orderRow.date_created_gmt) : undefined,
      updatedAt: orderRow.date_updated_gmt ? new Date(orderRow.date_updated_gmt) : undefined,
    };

    // Attempt to find a matching Member by DID from order meta first
    try {
      const metaForOrder = orderMetaMap[wpOrderId] || {};
      let matchedMember = null;

      // Search meta values for a possible DID (exact match)
      for (const values of Object.values(metaForOrder)) {
        for (const v of values) {
          const maybe = (v || "").toString().trim();
          if (!maybe) continue;
          const memberByDid = await MemberModel.findOne({ did: maybe }).lean();
          if (memberByDid) {
            matchedMember = memberByDid;
            break;
          }
        }
        if (matchedMember) break;
      }

      // Fallback: lookup by billing email
      if (!matchedMember) {
        const customerEmail = orderDoc.customer?.email?.toString().trim().toLowerCase();
        if (customerEmail) {
          matchedMember = await MemberModel.findOne({ email: customerEmail }).lean();
        }
      }

      if (matchedMember) {
        orderDoc.member = matchedMember._id;
        if (matchedMember.phone) orderDoc.customer.phone = matchedMember.phone;
        if (matchedMember.name) orderDoc.customer.fullName = matchedMember.name;
        console.log(`  Matched member ${matchedMember._id} (email=${matchedMember.email || ""} did=${matchedMember.did || ""})`);
      } else {
        console.log("  No matching member found for this order (will import as guest)");
      }
    } catch (err) {
      console.warn(`Member lookup failed for order ${wpOrderId}:`, err.message || err);
    }

    if ((!lineItems || lineItems.length === 0)) {
      console.warn(`  Warning: order ${wpOrderId} has 0 line items; creating fallback placeholder item`);
      const fallbackPrice = Number(orderRow.total_amount || orderRow.total || 0) || 0;
      lineItems = [{
        name: `Order ${wpOrderId} placeholder item`,
        quantity: 1,
        unitPrice: fallbackPrice,
        size: "",
        concentration: "",
      }];
      orderDoc.items = lineItems;
    }
    ordersToInsert.push(orderDoc);
    console.log(`  Queued order ${orderDoc.orderNumber} (items=${lineItems.length}, total=${totals.total})`);
    if (ordersToInsert.length >= maxOrders) {
      console.log(`Reached max order limit of ${maxOrders}; stopping after ${ordersToInsert.length} orders.`);
      break;
    }
  }

  console.log(`Importing ${ordersToInsert.length} orders into MongoDB...`);
  if (ordersToInsert.length > 0) {
    try {
      const existingOrderNumbers = ordersToInsert.map((o) => o.orderNumber);
      const existingOrders = await OrderModel.find({ orderNumber: { $in: existingOrderNumbers } }).lean();
      const existingOrderByNumber = new Map(existingOrders.map((order) => [order.orderNumber, order]));

      const newOrders = [];
      const updatedOrders = [];
      for (const orderDoc of ordersToInsert) {
        const existing = existingOrderByNumber.get(orderDoc.orderNumber);
        if (existing) {
          const updatedOrder = await OrderModel.findOneAndUpdate(
            { orderNumber: orderDoc.orderNumber },
            { $set: orderDoc },
            { new: true, runValidators: true },
          ).lean();
          if (updatedOrder) {
            updatedOrders.push(updatedOrder);
          }
        } else {
          newOrders.push(orderDoc);
        }
      }

      let inserted = [];
      if (newOrders.length > 0) {
        inserted = await OrderModel.insertMany(newOrders, { ordered: false });
      }

      const processedOrders = [...inserted, ...updatedOrders];
      console.log(`Processed ${processedOrders.length} orders (${inserted.length} inserted, ${updatedOrders.length} updated).`);
      if (processedOrders.length > 0) {
        console.log(`Sample processed orders: ${processedOrders.slice(0,3).map((d) => d.orderNumber).join(", ")}`);
      }

      const memberOrderMap = new Map();
      for (const orderRecord of processedOrders) {
        if (orderRecord.member) {
          const memberId = orderRecord.member.toString();
          if (!memberOrderMap.has(memberId)) memberOrderMap.set(memberId, []);
          memberOrderMap.get(memberId).push({
            did: orderRecord.did,
            value: orderRecord.totals?.total ?? 0,
          });
        }
      }
      for (const [memberId, orderRefs] of memberOrderMap.entries()) {
        await MemberModel.updateOne(
          { _id: memberId },
          { $addToSet: { orders: { $each: orderRefs } } },
        );
      }
      if (memberOrderMap.size > 0) {
        console.log(`Updated ${memberOrderMap.size} member(s) with order references.`);
      }

      const paymentWrites = [];
      for (const orderRecord of processedOrders) {
        paymentWrites.push({
          updateOne: {
            filter: { orderId: orderRecord._id },
            update: { $set: buildPaymentRecord(orderRecord) },
            upsert: true,
          },
        });
      }

      if (paymentWrites.length > 0) {
        console.log(`Syncing ${paymentWrites.length} payment records to Payment collection...`);
        const paymentResult = await PaymentModel.bulkWrite(paymentWrites, { ordered: false });
        const insertedCount = paymentResult.upsertedCount ?? paymentResult.nUpserted ?? 0;
        const modifiedCount = paymentResult.modifiedCount ?? paymentResult.nModified ?? 0;
        console.log(`Synced ${paymentWrites.length} payment records (upserted=${insertedCount}, modified=${modifiedCount}).`);
      } else {
        console.log("No payment records to sync for imported orders.");
      }

      for (const memberId of memberOrderMap.keys()) {
        await recalcMemberTotals(memberId);
      }
    } catch (err) {
      console.error("Error inserting orders:", err);
      if (err && err.writeErrors) {
        for (const we of err.writeErrors) {
          console.error("  insert error:", we.errmsg || we.toString(), we.err?.op || we.getOperation?.());
        }
      }
    }
  }

  console.log("Migration complete.");
  const orderCount = await OrderModel.countDocuments();
  console.log(`Order collection count after insert: ${orderCount}`);
  await mongoose.disconnect();
  console.log("MongoDB disconnected.");
};

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
