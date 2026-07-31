/**
 * import-wp-users-to-members.js
 *
 * Reads WordPress export JSON (phpMyAdmin export format) and imports users
 * into the application's `Member` collection as customers.
 *
 * Usage:
 *   node scripts/import-wp-users-to-members.js [--file=../wp_db/wp_users.json] [--dry-run] [--overwrite]
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import crypto from "crypto";
import { MemberModel } from "../src/models/member.model.js";
import { hashPassword } from "../src/utils/password.js";

// Parse CLI arguments and options for the importer
// --file=PATH   : path to wp_users.json export (default ../wp_db/wp_users.json)
// --dry-run     : do not write to DB, only print what would be imported
// --overwrite   : upsert and overwrite existing members
// --roles=...   : comma-separated allowed WP roles to import (e.g. subscriber,customer)
// --include-admins : ignore role filtering and include all users
const argv = process.argv.slice(2);
const opts = {
  file: argv.find((a) => a.startsWith("--file="))?.split("=")[1] || path.join("..", "wp_db", "wp_users.json"),
  dryRun: argv.includes("--dry-run"),
  overwrite: argv.includes("--overwrite"),
  roles: argv.find((a) => a.startsWith("--roles="))?.split("=")[1], // comma-separated allowed roles
  includeAdmins: argv.includes("--include-admins"),
};

// main(): orchestrates the import flow
// - finds the WP JSON file
// - parses wp_users and optional wp_usermeta, wp_wc_orders_meta, wp_wc_order_addresses
// - connects to MongoDB and upserts Member documents
async function main() {
  const mongodbUri = process.env.MONGODB_URI;
  const mongodbDbName = process.env.MONGODB_DB_NAME || "perfume-store";
  if (!mongodbUri) throw new Error("MONGODB_URI must be set in environment");

  // Choose the WP users JSON file by checking multiple likely locations
  // (so the script can be executed from `backend` or project root).
  const candidates = [
    path.resolve(process.cwd(), opts.file), // explicit or default ../wp_db/wp_users.json
    path.resolve(process.cwd(), "wp_db", "wp_users.json"), // backend/wp_db/wp_users.json
    path.resolve(process.cwd(), "..", "wp_db", "wp_users.json"), // project-root/wp_db/wp_users.json
  ];

  const filePath = candidates.find((p) => fs.existsSync(p));
  if (!filePath) {
    throw new Error(`WP users file not found; tried: ${candidates.join(", ")}`);
  }

  // Read and parse the WP `wp_users` export table from the JSON file
  console.log(`Reading WP users from: ${filePath}`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);

  const table = parsed.find((p) => p.type === "table" && p.name === "wp_users");
  if (!table || !Array.isArray(table.data)) {
    throw new Error("Could not find wp_users table data in the provided JSON");
  }

  const users = table.data;
  console.log(`Found ${users.length} WP users in export`);

  // If available, read `wp_usermeta.json` to map WP user IDs to roles
  // Roles help us skip admin/editor users when importing customers.
  const usersDir = path.dirname(filePath);
  const usermetaPath = path.join(usersDir, "wp_usermeta.json");
  let rolesMap = {}; // map user_id -> role (string)
  if (fs.existsSync(usermetaPath)) {
    try {
      const rawMeta = fs.readFileSync(usermetaPath, "utf-8");
      const parsedMeta = JSON.parse(rawMeta);
      const metaTable = parsedMeta.find((p) => p.type === "table" && p.name === "wp_usermeta");
      const metaRows = metaTable && Array.isArray(metaTable.data) ? metaTable.data : parsedMeta.data || [];
      for (const m of metaRows) {
        const userId = (m.user_id || m.user_id === 0 ? m.user_id : m.ID || m.umeta_id) + "";
        const key = (m.meta_key || m.meta_key_name || "").toString();
        const value = (m.meta_value || m.meta_value_text || "").toString().toLowerCase();
        if (key.includes("capabil") || key === "wp_capabilities") {
          // crude detection: look for common role names in serialized value
          if (value.includes("administrator")) rolesMap[userId] = "administrator";
          else if (value.includes("editor")) rolesMap[userId] = "editor";
          else if (value.includes("shop_manager")) rolesMap[userId] = "shop_manager";
          else if (value.includes("customer")) rolesMap[userId] = "customer";
          else if (value.includes("subscriber")) rolesMap[userId] = "subscriber";
          else rolesMap[userId] = "unknown";
        }
      }
      console.log(`Found roles for ${Object.keys(rolesMap).length} users from wp_usermeta.json`);
    } catch (err) {
      console.warn("Could not parse wp_usermeta.json; continuing without role filtering", err.message || err);
    }
  }

  // Parse `wp_wc_orders_meta.json` to extract order-level meta (billing email, phone, customer_user, etc.)
  // We'll use this to populate member billing/shipping fields when available.
  const orderMetaPath = path.join(usersDir, "wp_wc_orders_meta.json");
  const orderMetaMap = {}; // orderId -> { meta_key: meta_value }
  if (fs.existsSync(orderMetaPath)) {
    try {
      const rawOrderMeta = fs.readFileSync(orderMetaPath, "utf-8");
      const parsedOrderMeta = JSON.parse(rawOrderMeta);
      const metaTable = parsedOrderMeta.find((p) => p.type === "table" && (p.name === "wp_wc_orders_meta" || p.name === "wp_wc_order_meta" || p.name === "wp_postmeta"));
      const metaRows = metaTable && Array.isArray(metaTable.data) ? metaTable.data : parsedOrderMeta.data || [];
      for (const m of metaRows) {
        const orderId = (m.order_id || m.post_id || m.ID || m.meta_id || m.order_id_text) + "";
        const key = (m.meta_key || m.meta_key_name || "").toString();
        const value = (m.meta_value || m.meta_value_text || "").toString();
        if (!orderId) continue;
        if (!orderMetaMap[orderId]) orderMetaMap[orderId] = {};
        orderMetaMap[orderId][key] = value;
      }
      console.log(`Parsed order meta for ${Object.keys(orderMetaMap).length} orders`);
    } catch (err) {
      console.warn("Could not parse wp_wc_orders_meta.json; continuing without order meta", err.message || err);
    }
  }

  // Parse `wp_wc_order_addresses.json` for structured billing/shipping rows when present
  // This supplements meta-based extraction and provides richer address fields.
  const orderAddressesPath = path.join(usersDir, "wp_wc_order_addresses.json");
  const orderAddressMap = {}; // orderId -> [{...}, ...]
  if (fs.existsSync(orderAddressesPath)) {
    try {
      const rawAddr = fs.readFileSync(orderAddressesPath, "utf-8");
      const parsedAddr = JSON.parse(rawAddr);
      const addrTable = parsedAddr.find((p) => p.type === "table" && p.name && p.name.includes("order_addresses"));
      const addrRows = addrTable && Array.isArray(addrTable.data) ? addrTable.data : parsedAddr.data || [];
      for (const a of addrRows) {
        const orderId = (a.order_id || a.orderId || a.ID) + "";
        if (!orderId) continue;
        if (!orderAddressMap[orderId]) orderAddressMap[orderId] = [];
        orderAddressMap[orderId].push(a);
      }
      console.log(`Parsed order addresses for ${Object.keys(orderAddressMap).length} orders`);
    } catch (err) {
      console.warn("Could not parse wp_wc_order_addresses.json; continuing without order addresses", err.message || err);
    }
  }

  // Connect to MongoDB using env MONGODB_URI and MONGODB_DB_NAME
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongodbUri, { dbName: mongodbDbName });

  try {
    let imported = 0;
    let skipped = 0;
    const allowedRoles = opts.roles ? opts.roles.split(",").map((r) => r.trim().toLowerCase()).filter(Boolean) : ["subscriber", "customer"];
    for (const u of users) {
      const email = (u.user_email || "").toString().trim().toLowerCase();
      if (!email) {
        skipped++;
        continue;
      }

      const name = (u.display_name || u.user_login || "").toString().trim();

      // Determine WP role (if available) and skip if not allowed
      const wpId = (u.ID || u.id || "") + "";
      const role = rolesMap[wpId];
      if (Object.keys(rolesMap).length > 0 && !opts.includeAdmins) {
        // if role info exists, only import allowed roles
        if (!role || !allowedRoles.includes(role)) {
          skipped++;
          continue;
        }
      }

      // Try to find order(s) associated with this user to extract billing info
      let billingPhone = "";
      let billingObj = null;
      let shippingObj = null;
      // Find orders where orderMetaMap[orderId]['_billing_email'] matches email OR orderMetaMap[orderId]['_customer_user'] equals wpId
      for (const [orderId, meta] of Object.entries(orderMetaMap)) {
        if (!meta) continue;
        const billingEmail = (meta._billing_email || meta.billing_email || "").toString().trim().toLowerCase();
        const customerUser = (meta._customer_user || meta.customer_user || "").toString();
        if (billingEmail === email || (customerUser && customerUser === wpId)) {
          // extract phone and billing fields
          billingPhone = billingPhone || (meta._billing_phone || meta.billing_phone || meta._billing_phone_text || "").toString().trim();
          if (!billingObj) {
            billingObj = {
              first_name: meta._billing_first_name || meta.billing_first_name || "",
              last_name: meta._billing_last_name || meta.billing_last_name || "",
              address_1: meta._billing_address_1 || "",
              address_2: meta._billing_address_2 || "",
              city: meta._billing_city || "",
              state: meta._billing_state || "",
              postcode: meta._billing_postcode || "",
              country: meta._billing_country || "",
              email: billingEmail || email,
              phone: billingPhone || "",
            };
          }
          if (!shippingObj) {
            shippingObj = {
              first_name: meta._shipping_first_name || "",
              last_name: meta._shipping_last_name || "",
              address_1: meta._shipping_address_1 || "",
              address_2: meta._shipping_address_2 || "",
              city: meta._shipping_city || "",
              state: meta._shipping_state || "",
              postcode: meta._shipping_postcode || "",
              country: meta._shipping_country || "",
            };
          }
        }
      }

      // supplement from orderAddressMap if present
      if ((!billingPhone || !billingObj) && Object.keys(orderAddressMap).length > 0) {
        for (const [orderId, addrList] of Object.entries(orderAddressMap)) {
          for (const a of addrList) {
            const addrEmail = (a.email || a.billing_email || "").toString().trim().toLowerCase();
            const addrUserId = (a.user_id || a.customer_id || a.customer_user || "") + "";
            if (addrEmail === email || (addrUserId && addrUserId === wpId)) {
              // use available fields
              billingPhone = billingPhone || (a.phone || a.billing_phone || "").toString().trim();
              if (!billingObj) billingObj = { raw: a.address || a.full_address || JSON.stringify(a) };
              if (!shippingObj) shippingObj = { raw: a.shipping_address || "" };
            }
          }
        }
      }

      // If not overwriting and member exists, skip
      const existing = await MemberModel.findOne({ email }).lean();
      if (existing && !opts.overwrite) {
        skipped++;
        continue;
      }

      // Use a fixed initial password (hardcoded as requested) and hash it
      const plainPassword = "123456";
      const passwordHash = await hashPassword(plainPassword);

      const createdById = "6a66456aa17ef604fb3bd978";
      const memberData = {
        name: name || email.split("@")[0],
        email,
        phone: billingPhone || "",
        passwordHash,
        role: "Customer",
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: u.user_registered ? new Date(u.user_registered) : new Date(),
        createdBy: new mongoose.Types.ObjectId(createdById),
        passwordReset: false,
        billingAddress: billingObj || {},
        shippingAddress: shippingObj || {},
      };

      if (opts.dryRun) {
        console.log("DRY-RUN: would import", { email, name });
        imported++;
        continue;
      }

      if (opts.overwrite) {
        await MemberModel.updateOne({ email }, { $set: memberData }, { upsert: true });
      } else {
        await MemberModel.updateOne({ email }, { $setOnInsert: memberData }, { upsert: true });
      }

      imported++;
    }

    console.log(`Imported: ${imported}, Skipped: ${skipped}`);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
