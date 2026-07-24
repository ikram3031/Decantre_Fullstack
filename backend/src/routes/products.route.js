import { Router } from "express";
import { Types } from "mongoose";
import { ProductModel } from "../models/product.model.js";
import { buildProductImageUrl } from "../utils/imageUrl.js";

const productsRouter = Router();

function toProductJson(product) {
  const id = product._id?.toString?.() ?? product.id;
  const { _id, __v, ...rest } = product;

  return {
    ...rest,
    id,
    stock_status: product.stockStatus,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };
}

productsRouter.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "10", 10)));
    const q = req.query.q || "";
    const sortByParam = req.query.sortBy || "createdAt";
    const orderParam = (req.query.order || "desc").toLowerCase();

    const sortFieldMap = {
      name: "name",
      brand: "brand.name",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    };
    const sortField = sortFieldMap[sortByParam] || "createdAt";
    const sortOrder = orderParam === "asc" ? 1 : -1;

    const offset = (page - 1) * limit;

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { "brand.name": { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const [total, data] = await Promise.all([
      ProductModel.countDocuments(filter),
      ProductModel.find(filter).sort({ [sortField]: sortOrder }).skip(offset).limit(limit).lean(),
    ]);

    res.json({
      data: data.map((product) => toProductJson(product)),
      totalRows: total,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Autocomplete / live-search endpoint: returns minimal fields for suggestions
productsRouter.get("/search", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      res.json({ data: [] });
      return;
    }

    const regex = { $regex: q, $options: "i" };

    const data = await ProductModel.find({ name: regex }).limit(12).lean();

    const results = data.map((p) => {
      const category = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0].name : null;
      const imageUrl = buildProductImageUrl(p.thumbnail?.url);

      return {
        id: p._id?.toString?.() ?? p.id,
        name: p.name,
        category,
        image: imageUrl,
      };
    });

    res.json({ data: results });
  } catch (err) {
    next(err);
  }
});

productsRouter.get("/:identifier", async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const filter = Types.ObjectId.isValid(identifier)
      ? { $or: [{ _id: identifier }, { slug: identifier }] }
      : { slug: identifier };

    const product = await ProductModel.findOne(filter).lean();

    if (!product) {
      res.status(404).json({ status: "error", message: "Product not found" });
      return;
    }

    res.json({ data: toProductJson(product) });
  } catch (err) {
    next(err);
  }
});

export default productsRouter;
