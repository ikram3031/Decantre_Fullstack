import { Types } from "mongoose";
import { ProductModel } from "../models/product.model.js";

const DEFAULT_LIMIT = 10;
const SORT_FIELD_MAP = {
  name: "name",
  price: "price",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  stockStatus: "stockStatus",
};

const normalizeValue = (value) => {
  if (typeof value === "string") {
    return value.trim();
  }

  return value;
};

export const serializeProduct = (product) => {
  const source = product?.toObject ? product.toObject() : product;
  const { _id, __v, ...rest } = source || {};
  const id = source?._id?.toString?.() ?? source?.id ?? null;

  return {
    ...rest,
    id,
    stock_status: source?.stockStatus ?? null,
    created_at: source?.createdAt ?? null,
    updated_at: source?.updatedAt ?? null,
    image_url: source?.imageUrl ?? null,
    thumbnail_url: source?.thumbnailUrl ?? null,
  };
};

export const buildProductFilter = (input = {}) => {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const explicitFilter = source.filter && typeof source.filter === "object" && !Array.isArray(source.filter)
    ? source.filter
    : {};

  const filter = {};

  Object.entries(explicitFilter).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) {
      return;
    }

    if (key !== "q") {
      filter[key] = value;
    }
  });

  Object.entries(source).forEach(([key, value]) => {
    if (["q", "search", "keyword", "skip", "limit", "sortBy", "sortby", "order", "filter"].includes(key)) {
      return;
    }

    if (value === "" || value === null || value === undefined) {
      return;
    }

    filter[key] = value;
  });

  const q = normalizeValue(source.q ?? source.search ?? source.keyword);
  if (q) {
    const searchClause = [
      { name: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];

    if (filter.$or) {
      filter.$or = [...filter.$or, ...searchClause];
    } else {
      filter.$or = searchClause;
    }
  }

  const stockStatus = normalizeValue(source.stockStatus ?? source.status);
  if (stockStatus) {
    filter.stockStatus = stockStatus;
  }

  const type = normalizeValue(source.type);
  if (type) {
    filter.type = type;
  }

  const slug = normalizeValue(source.slug);
  if (slug) {
    filter.slug = slug;
  }

  return filter;
};

export const buildProductSort = (sortBy = "createdAt", order = "desc") => {
  const field = SORT_FIELD_MAP[normalizeValue(sortBy)] || "createdAt";
  const direction = normalizeValue(order).toLowerCase() === "asc" ? 1 : -1;

  return { [field]: direction };
};

export const parsePagination = (input = {}) => {
  const skip = Math.max(0, parseInt(normalizeValue(input.skip ?? input.offset ?? 0), 10) || 0);
  const limit = Math.min(100, Math.max(1, parseInt(normalizeValue(input.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));

  return { skip, limit };
};

export const listProducts = async (req, res, next) => {
  try {
    const method = (req.method || "GET").toUpperCase();

    // Pagination and sorting come from either query (GET) or body (POST)
    const paginationSource = method === "POST" ? req.body || {} : req.query || {};
    const { skip, limit } = parsePagination(paginationSource);
    const sort = buildProductSort(paginationSource.sortBy ?? paginationSource.sortby, paginationSource.order);

    // Build filter: GET only supports free-text `q` search; POST accepts full filters in body
    let filter = {};
    if (method === "GET") {
      const q = (req.query.q || "").trim();
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: "i" } },
          { slug: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ];
      }
    } else {
      // POST: accept richer filters (category, brand, tags, season, name, slug, did, etc.)
      filter = buildProductFilter(req.body || {});
    }

    const [total, rows] = await Promise.all([
      ProductModel.countDocuments(filter),
      ProductModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    ]);

    res.json({
      data: rows.map(serializeProduct),
      totalRows: total,
      meta: {
        total,
        skip,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const identifier = req.params.identifier;
    const filter = Types.ObjectId.isValid(identifier)
      ? { $or: [{ _id: identifier }, { slug: identifier }] }
      : { slug: identifier };

    const product = await ProductModel.findOne(filter).lean();

    if (!product) {
      res.status(404).json({ status: "error", message: "Product not found" });
      return;
    }

    res.json({ data: serializeProduct(product) });
  } catch (err) {
    next(err);
  }
};
