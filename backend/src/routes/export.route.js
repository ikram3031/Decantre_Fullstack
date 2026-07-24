import { Router } from "express";
import { getMySQLPool } from "../database/mysql.js";
import fs from "fs/promises";
import path from "path";

const router = Router();

router.get("/products/mysql", async (req, res, next) => {
  try {
    const pool = getMySQLPool();

    const [rows] = await pool.query("SELECT * FROM products");

    const outDir = path.join(process.cwd(), "data");
    await fs.mkdir(outDir, { recursive: true });

    const outPath = path.join(outDir, "products_from_mysql.json");
    await fs.writeFile(outPath, JSON.stringify(rows, null, 2), "utf8");

    res.json({ status: "ok", count: Array.isArray(rows) ? rows.length : 0, file: outPath });
  } catch (err) {
    next(err);
  }
});

export default router;
