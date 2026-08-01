"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Layers,
  Package,
  UploadCloud,
  FileImage,
  X,
  ArrowLeft,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useCategories,
  useBrands,
  type CategoryCacheEntry,
  type BrandCacheEntry,
} from "@/lib/category-cache";
import Image from "next/image";

interface VariantRow {
  size: string;
  price: string;
  offerPrice: string;
  stockQuantity: string;
  sku: string;
}

const emptyVariant = (): VariantRow => ({
  size: "",
  price: "",
  offerPrice: "",
  stockQuantity: "0",
  sku: "",
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";

export default function NewProductPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Basic fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");

  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Type toggle
  const [productType, setProductType] = useState<"simple" | "variant">(
    "simple",
  );

  // Simple product fields
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [sku, setSku] = useState("");

  // Variant product fields
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()]);

  // Category & Brand
  const [categorySlug, setCategorySlug] = useState("");
  const [brandSlug, setBrandSlug] = useState("");

  // Season
  const [season, setSeason] = useState("All-Season");

  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (!slugManual) {
        setSlug(slugify(value));
      }
    },
    [slugManual],
  );

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof VariantRow,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", "product");

    try {
      const response = await apiClient.post<{ data: { imageUrl: string } }>(
        "/api/v1/images/upload?type=product",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const path = response.data?.data?.imageUrl;
      if (path) {
        setUploadedImageUrl(path);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Image URL not found in response");
      }
    } catch (err: unknown) {
      toast.error("Failed to upload image. Please try again.");
      setImagePreview("");
      setUploadedImageUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedImage = () => {
    setImagePreview("");
    setUploadedImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Product slug is required.");
      return;
    }

    if (productType === "simple") {
      if (!price || Number(price) <= 0) {
        toast.error("Price must be greater than 0.");
        return;
      }
    } else {
      const validVariants = variants.filter((v) => v.size.trim() && v.price);
      if (validVariants.length === 0) {
        toast.error("At least one variant with size and price is required.");
        return;
      }
    }

    setIsCreating(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || name.trim(),
        type: productType,
        imageUrl: uploadedImageUrl || undefined,
        season,
      };

      if (categorySlug) body.category = categorySlug;
      if (brandSlug) body.brand = brandSlug;

      if (productType === "simple") {
        body.price = parseFloat(price);
        body.offerPrice = offerPrice ? parseFloat(offerPrice) : null;
        body.stockQuantity = parseInt(stockQuantity || "0", 10);
        body.sku = sku.trim();
        body.stockStatus =
          parseInt(stockQuantity || "0", 10) > 0 ? "instock" : "outofstock";
      } else {
        body.variants = variants
          .filter((v) => v.size.trim() && v.price)
          .map((v, i) => ({
            size: v.size.trim(),
            price: parseFloat(v.price),
            offerPrice: v.offerPrice ? parseFloat(v.offerPrice) : null,
            stockQuantity: parseInt(v.stockQuantity || "0", 10),
            sku: v.sku.trim(),
            sortOrder: i,
          }));

        const totalStock = variants.reduce(
          (sum, v) => sum + parseInt(v.stockQuantity || "0", 10),
          0,
        );
        body.stockStatus = totalStock > 0 ? "instock" : "outofstock";
      }

      await apiClient.post("/api/v1/products", body);
      toast.success("Product created successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/dashboard/products");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create product.";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const getFullPreviewUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/dashboard/products")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to products
          </button>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Add New Product
          </h2>
          <p className="text-sm text-muted-foreground">
            Create a simple or variant product for your catalog with rich
            details.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6"
      >
        {/* Left Form Area */}
        <div className="space-y-6">
          {/* Basic Information Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              Basic Information
            </h3>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Product Name</label>
              <Input
                required
                placeholder="e.g. Oud Imperial Perfume"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold">Slug</label>
                <button
                  type="button"
                  className="text-[10px] text-muted-foreground underline"
                  onClick={() => setSlugManual(!slugManual)}
                >
                  {slugManual ? "Auto-generate" : "Edit manually"}
                </button>
              </div>
              <Input
                required
                placeholder="oud-imperial-perfume"
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlug(e.target.value);
                }}
                disabled={!slugManual}
                className={!slugManual ? "opacity-60" : ""}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Description</label>
              <RichTextEditor
                placeholder="Write a description for this product..."
                value={description}
                onChange={(val) => setDescription(val)}
              />
            </div>
          </div>

          {/* Pricing & Stock (Simple) or Variants Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-semibold">Inventory & Pricing</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Variant Mode
                </span>
                <Switch
                  checked={productType === "variant"}
                  onCheckedChange={(checked) =>
                    setProductType(checked ? "variant" : "simple")
                  }
                />
              </div>
            </div>

            {/* ─── Simple Product Fields ─── */}
            {productType === "simple" && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Price (৳)</label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      placeholder="99.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">
                      Offer Price (৳)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Optional"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">
                      Stock Quantity
                    </label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">SKU</label>
                    <Input
                      placeholder="OIP-001"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── Variant Product Fields ─── */}
            {productType === "variant" && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Define product sizes and individual configurations.
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={addVariant}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Size Variant
                  </Button>
                </div>

                <div className="space-y-3">
                  {variants.map((v, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1.5fr_1.5fr_1.5fr_1.5fr_auto] gap-3 items-end rounded-lg border border-border/80 p-3 bg-muted/20"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Size
                        </label>
                        <Input
                          required
                          placeholder="e.g. 2ml"
                          value={v.size}
                          onChange={(e) =>
                            updateVariant(i, "size", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Price (৳)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          required
                          placeholder="199"
                          value={v.price}
                          onChange={(e) =>
                            updateVariant(i, "price", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Offer Price
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Optional"
                          value={v.offerPrice}
                          onChange={(e) =>
                            updateVariant(i, "offerPrice", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Stock
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={v.stockQuantity}
                          onChange={(e) =>
                            updateVariant(i, "stockQuantity", e.target.value)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive self-end"
                        onClick={() => removeVariant(i)}
                        disabled={variants.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Meta/Image Area */}
        <div className="space-y-6">
          {/* Image Uploader Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              Product Image
            </h3>

            <div className="space-y-3">
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer hover:bg-muted/10 transition-all flex flex-col items-center justify-center min-h-[160px]"
                >
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                  <span className="text-xs font-medium text-foreground block">
                    Upload Image
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    PNG, JPG, WEBP up to 10MB
                  </span>
                </div>
              ) : (
                <div className="relative rounded-xl border overflow-hidden bg-muted/10 group min-h-[160px] flex items-center justify-center">
                  <Image
                    src={
                      imagePreview.startsWith("blob:")
                        ? imagePreview
                        : getFullPreviewUrl(imagePreview)
                    }
                    alt="Uploaded Product Preview"
                    width={240}
                    height={240}
                    className="object-contain max-h-[180px] w-full"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        Uploading...
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeUploadedImage}
                    className="absolute top-2 right-2 bg-background/90 border rounded-full p-1.5 shadow-sm opacity-90 hover:opacity-100 hover:text-destructive transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Classification / Organization Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              Organization
            </h3>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Category
              </label>
              <Select
                value={categorySlug || "__none__"}
                onValueChange={(val) =>
                  setCategorySlug(val === "__none__" || !val ? "" : val)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {categories.map((cat: CategoryCacheEntry) => (
                    <SelectItem key={cat.did} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Brand
              </label>
              <Select
                value={brandSlug || "__none__"}
                onValueChange={(val) =>
                  setBrandSlug(val === "__none__" || !val ? "" : val)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {brands.map((b: BrandCacheEntry) => (
                    <SelectItem key={b.did} value={b.slug}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Season */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Season
              </label>
              <Select
                value={season}
                onValueChange={(val) => setSeason(val ?? "All-Season")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All-Season">All Season</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                  <SelectItem value="Winter">Winter</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Autumn">Autumn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isCreating || isUploading}
            >
              {isCreating ? "Creating Product..." : "Save Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard/products")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
