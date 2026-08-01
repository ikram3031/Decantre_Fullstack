import { Types } from "mongoose";
import { ProductModel } from "../models/product.model.js";
import { CategoryModel } from "../models/category.model.js";
import { BrandModel } from "../models/brand.model.js";
import { UserModel } from "../models/user.model.js";

const DEFAULT_LIMIT = 10;
const SORT_FIELD_MAP = {
  name: "name",
  price: "price",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  stockStatus: "stockStatus",
};

const PLACEHOLDER_IMAGE_URL = "/uploads/product_placeholder.webp";

const normalizeValue = (value) => {
  if (typeof value === "string") {
    return value.trim();
  }

  return value;
};

const isPlaceholderImageUrl = (value) => typeof value === "string" && value.trim() === PLACEHOLDER_IMAGE_URL;

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

export const buildProductFilter = async (input = {}) => {
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
    if (["q", "search", "keyword", "skip", "limit", "sortBy", "sortby", "order", "filter", "category", "categories", "brand", "brands"].includes(key)) {
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

  const categoryInput = source.category ?? source.categories;
  if (categoryInput) {
    const categoryValues = Array.isArray(categoryInput) ? categoryInput : [categoryInput];
    const resolved = [];

    for (const categoryValue of categoryValues) {
      if (categoryValue === "" || categoryValue === null || categoryValue === undefined) {
        continue;
      }

      if (Types.ObjectId.isValid(categoryValue)) {
        resolved.push(categoryValue);
        continue;
      }

      const normalizedCategory = normalizeValue(categoryValue);
      if (!normalizedCategory) continue;

      const categoryQuery = /^[0-9a-fA-F]{16}$/.test(normalizedCategory)
        ? { did: normalizedCategory }
        : { slug: normalizedCategory };

      const categoryDoc = await CategoryModel.findOne(categoryQuery).lean();
      if (categoryDoc?._id) {
        resolved.push(categoryDoc._id);
      }
    }

    if (resolved.length > 0) {
      filter.categories = { $in: resolved };
    }
  }

  const brandInput = source.brand ?? source.brands;
  if (brandInput) {
    const brandValues = Array.isArray(brandInput) ? brandInput : [brandInput];
    const resolved = [];

    for (const brandValue of brandValues) {
      if (brandValue === "" || brandValue === null || brandValue === undefined) {
        continue;
      }

      const normalizedBrand = normalizeValue(brandValue);
      if (!normalizedBrand) continue;

      if (/^[0-9a-fA-F]{16}$/.test(normalizedBrand)) {
        resolved.push(normalizedBrand);
        continue;
      }

      const brandQuery = /^[0-9a-fA-F]{24}$/.test(normalizedBrand)
        ? { _id: normalizedBrand }
        : { slug: normalizedBrand };

      const brandDoc = await BrandModel.findOne(brandQuery).lean();
      if (brandDoc?.did) {
        resolved.push(brandDoc.did);
      }
    }

    if (resolved.length > 0) {
      filter.brand = { $in: resolved };
    }
  }

  const type = normalizeValue(source.type);
  if (type) {
    filter.type = type;
  }

  const slug = normalizeValue(source.slug);
  if (slug) {
    filter.slug = slug;
  }

  const did = normalizeValue(source.did);
  if (did) {
    filter.did = did;
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
      filter = await buildProductFilter(req.body || {});
    }

    const filteredQuery = {
      ...filter,
      imageUrl: { $ne: PLACEHOLDER_IMAGE_URL },
    };

    const [total, rows] = await Promise.all([
      ProductModel.countDocuments(filteredQuery),
      ProductModel.find(filteredQuery).sort(sort).skip(skip).limit(limit).lean(),
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

    if (!product || isPlaceholderImageUrl(product.imageUrl)) {
      res.status(404).json({ status: "error", message: "Product not found" });
      return;
    }

    res.json({ data: serializeProduct(product) });
  } catch (err) {
    next(err);
  }
};

export const checkSlugExists = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      res.json({ exists: false });
      return;
    }
    const product = await ProductModel.findOne({ slug: slug.trim() }).lean();
    res.json({ exists: !!product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const body = req.body || {};
    
    // Resolve createdBy
    let userId = req.user?.userId || req.user?.id;
    if (!userId) {
      const fallbackUser = await UserModel.findOne({ role: { $in: ["Owner", "Admin"] } }).lean();
      if (fallbackUser) {
        userId = fallbackUser._id;
      } else {
        const anyUser = await UserModel.findOne().lean();
        if (anyUser) userId = anyUser._id;
      }
    }
    
    if (!userId) {
      res.status(400).json({ status: "error", message: "User is required to create a product" });
      return;
    }

    // Resolve Categories: convert array of IDs or slugs
    let categoryIds = [];
    if (body.categories || body.category) {
      const catInput = body.categories || body.category;
      const catArray = Array.isArray(catInput) ? catInput : [catInput];
      for (const cat of catArray) {
        if (!cat) continue;
        if (Types.ObjectId.isValid(cat)) {
          categoryIds.push(cat);
        } else {
          const found = await CategoryModel.findOne({ slug: cat }).lean();
          if (found) categoryIds.push(found._id);
        }
      }
    }

    // Resolve Brand: convert to parent/sub brand dids
    let brandDids = [];
    if (body.brand || body.brands) {
      const brandInput = body.brand || body.brands;
      const brandArray = Array.isArray(brandInput) ? brandInput : [brandInput];
      for (const br of brandArray) {
        if (!br) continue;
        if (/^[0-9a-fA-F]{16}$/.test(br)) {
          brandDids.push(br);
        } else {
          const found = await BrandModel.findOne({ slug: br }).lean();
          if (found) brandDids.push(found.did);
        }
      }
    }

    // Handle image_url vs imageUrl
    const imageUrl = body.imageUrl || body.image_url || PLACEHOLDER_IMAGE_URL;

    const productData = {
      name: body.name,
      slug: body.slug,
      description: body.description || body.name, // default to name if empty
      type: body.type || "simple",
      imageUrl,
      thumbnailUrl: body.thumbnailUrl || body.thumbnail_url || imageUrl,
      season: body.season || "All-Season",
      tags: Array.isArray(body.tags) ? body.tags : [],
      notes: Array.isArray(body.notes) ? body.notes : [],
      categories: categoryIds,
      brand: brandDids,
      stockStatus: body.stockStatus || body.stock_status || "instock",
      createdBy: userId,
    };

    if (body.type === "variant") {
      productData.variants = Array.isArray(body.variants) ? body.variants.map((v, i) => ({
        size: v.size,
        price: Number(v.price),
        offerPrice: v.offerPrice !== undefined && v.offerPrice !== null ? Number(v.offerPrice) : null,
        stockQuantity: v.stockQuantity !== undefined ? Number(v.stockQuantity) : 0,
        sku: v.sku || "",
        sortOrder: v.sortOrder !== undefined ? Number(v.sortOrder) : i,
      })) : [];
    } else {
      productData.price = Number(body.price || 0);
      productData.offerPrice = body.offerPrice !== undefined && body.offerPrice !== null ? Number(body.offerPrice) : null;
      productData.stockQuantity = body.stockQuantity !== undefined ? Number(body.stockQuantity) : 0;
      productData.sku = body.sku || "";
    }

    if (body.metaData) {
      productData.metaData = {
        metaTitle: body.metaData.metaTitle || "",
        metaDescription: body.metaData.metaDescription || "",
        keywords: Array.isArray(body.metaData.keywords) ? body.metaData.keywords : [],
        ogImage: body.metaData.ogImage || "",
      };
    }

    const newProduct = await ProductModel.create(productData);
    res.status(201).json({ status: "success", data: serializeProduct(newProduct) });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const filter = Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const product = await ProductModel.findOne(filter);
    if (!product) {
      res.status(404).json({ status: "error", message: "Product not found" });
      return;
    }

    // Resolve updatedBy
    let userId = req.user?.userId || req.user?.id;
    if (!userId) {
      const fallbackUser = await UserModel.findOne({ role: { $in: ["Owner", "Admin"] } }).lean();
      if (fallbackUser) userId = fallbackUser._id;
    }

    // Update fields
    if (body.name !== undefined) product.name = body.name;
    if (body.slug !== undefined) product.slug = body.slug;
    if (body.description !== undefined) product.description = body.description;
    if (body.type !== undefined) product.type = body.type;
    if (body.imageUrl !== undefined) product.imageUrl = body.imageUrl;
    if (body.image_url !== undefined) product.imageUrl = body.image_url;
    if (body.thumbnailUrl !== undefined) product.thumbnailUrl = body.thumbnailUrl;
    if (body.thumbnail_url !== undefined) product.thumbnailUrl = body.thumbnail_url;
    if (body.season !== undefined) product.season = body.season;
    if (body.tags !== undefined) product.tags = body.tags;
    if (body.notes !== undefined) product.notes = body.notes;
    if (body.stockStatus !== undefined) product.stockStatus = body.stockStatus;
    if (body.stock_status !== undefined) product.stockStatus = body.stock_status;
    
    if (userId) {
      product.updatedBy = userId;
    }

    if (body.categories !== undefined || body.category !== undefined) {
      const catInput = body.categories !== undefined ? body.categories : body.category;
      const catArray = Array.isArray(catInput) ? catInput : [catInput];
      let categoryIds = [];
      for (const cat of catArray) {
        if (!cat) continue;
        if (Types.ObjectId.isValid(cat)) {
          categoryIds.push(cat);
        } else {
          const found = await CategoryModel.findOne({ slug: cat }).lean();
          if (found) categoryIds.push(found._id);
        }
      }
      product.categories = categoryIds;
    }

    if (body.brand !== undefined || body.brands !== undefined) {
      const brandInput = body.brand !== undefined ? body.brand : body.brands;
      const brandArray = Array.isArray(brandInput) ? brandInput : [brandInput];
      let brandDids = [];
      for (const br of brandArray) {
        if (!br) continue;
        if (/^[0-9a-fA-F]{16}$/.test(br)) {
          brandDids.push(br);
        } else {
          const found = await BrandModel.findOne({ slug: br }).lean();
          if (found) brandDids.push(found.did);
        }
      }
      product.brand = brandDids;
    }

    if (product.type === "variant") {
      if (body.variants !== undefined) {
        product.variants = Array.isArray(body.variants) ? body.variants.map((v, i) => ({
          size: v.size,
          price: Number(v.price),
          offerPrice: v.offerPrice !== undefined && v.offerPrice !== null ? Number(v.offerPrice) : null,
          stockQuantity: v.stockQuantity !== undefined ? Number(v.stockQuantity) : 0,
          sku: v.sku || "",
          sortOrder: v.sortOrder !== undefined ? Number(v.sortOrder) : i,
        })) : [];
      }
      // Clean simple product fields
      product.price = undefined;
      product.offerPrice = undefined;
      product.stockQuantity = undefined;
      product.sku = undefined;
    } else {
      if (body.price !== undefined) product.price = Number(body.price);
      if (body.offerPrice !== undefined) product.offerPrice = body.offerPrice !== null ? Number(body.offerPrice) : null;
      if (body.stockQuantity !== undefined) product.stockQuantity = Number(body.stockQuantity);
      if (body.sku !== undefined) product.sku = body.sku;
      // Clean variant product fields
      product.variants = undefined;
    }

    if (body.metaData !== undefined) {
      product.metaData = {
        metaTitle: body.metaData.metaTitle || "",
        metaDescription: body.metaData.metaDescription || "",
        keywords: Array.isArray(body.metaData.keywords) ? body.metaData.keywords : [],
        ogImage: body.metaData.ogImage || "",
      };
    }

    await product.save();
    res.json({ status: "success", data: serializeProduct(product) });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const result = await ProductModel.deleteOne(filter);
    if (result.deletedCount === 0) {
      res.status(404).json({ status: "error", message: "Product not found" });
      return;
    }
    res.json({ status: "success", message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};
