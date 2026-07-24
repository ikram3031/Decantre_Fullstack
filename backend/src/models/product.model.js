import mongoose, { Schema, model } from "mongoose";

const { models } = mongoose;

const productVariantSchema = new Schema(
  {
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const namedSlugSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const productImageSchema = new Schema(
  {
    externalId: { type: String, trim: true },
    url: { type: String, trim: true },
    storageKey: { type: String, trim: true },
    altText: { type: String, trim: true },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    brand: { type: namedSlugSchema, required: false },
    thumbnail: { type: productImageSchema, required: false },
    categories: { type: [namedSlugSchema], default: [] },
    variants: { type: [productVariantSchema], default: [] },
    stockStatus: { type: String, required: true, default: "instock", trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (typeof ret._id === "object" && ret._id !== null && "toString" in ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret._id;
        return ret;
      },
    },
  },
);

productSchema.index({ name: "text", description: "text", "brand.name": "text" });

export const ProductModel = models.Product || model("Product", productSchema);
