'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts, Product, ProductVariant } from '@/hooks/use-products';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  Package,
  X,
  Layers,
  Tag,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku: string;
  size: string;
}

// ─── Price helpers ────────────────────────────────────────────────────────────

const effectivePrice = (price: number, offerPrice: number | null) =>
  offerPrice != null && offerPrice > 0 && offerPrice < price ? offerPrice : price;

const formatBDT = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

// ─── Product Add Dialog ───────────────────────────────────────────────────────

interface ProductDialogProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

function ProductAddDialog({ product, onClose, onAddToCart }: ProductDialogProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isVariant = product.type === 'variant' && product.variants.length > 0;

  // For simple products, price is on the product itself
  const simplePrice = effectivePrice(product.price, product.offerPrice);
  const variantPrice = selectedVariant
    ? effectivePrice(selectedVariant.price, selectedVariant.offerPrice)
    : null;

  const displayPrice = isVariant ? variantPrice : simplePrice;
  const lineTotal = displayPrice != null ? displayPrice * quantity : null;

  const isOutOfStock = isVariant
    ? selectedVariant != null && selectedVariant.stockQuantity === 0
    : product.stock === 0;

  const canAdd = isVariant
    ? selectedVariant !== null && !isOutOfStock
    : !isOutOfStock;

  const handleAdd = () => {
    if (!canAdd || displayPrice === null) return;

    const cartKey = isVariant
      ? `${product.id}__${selectedVariant!.size}`
      : product.id;

    onAddToCart({
      id: cartKey,
      name: isVariant ? `${product.name} (${selectedVariant!.size})` : product.name,
      price: displayPrice,
      quantity,
      image: product.image,
      sku: isVariant ? (selectedVariant!.sku || product.sku) : product.sku,
      size: isVariant ? selectedVariant!.size : '',
    });

    // Reset
    setSelectedVariant(null);
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog open={product !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold leading-snug pr-6">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isVariant ? 'Select a size / variation to add to cart' : 'Confirm quantity to add'}
          </DialogDescription>
        </DialogHeader>

        {/* Product thumbnail + meta */}
        <div className="flex items-start gap-3 -mt-1">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-xs text-muted-foreground">{product.sku}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 gap-1"
              >
                {isVariant ? (
                  <><Layers className="h-2.5 w-2.5" /> Variable</>
                ) : (
                  <><Tag className="h-2.5 w-2.5" /> Simple</>
                )}
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {product.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* ── Simple product ── */}
        {!isVariant && (
          <div className="bg-muted/50 rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                {formatBDT(simplePrice)}
              </p>
              {product.offerPrice != null && product.offerPrice < product.price && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatBDT(product.price)}
                </p>
              )}
            </div>
            <Badge
              variant={product.stock > 0 ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </Badge>
          </div>
        )}

        {/* ── Variant selector ── */}
        {isVariant && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Select Size / Variation
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[...product.variants]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((v) => {
                  const vPrice = effectivePrice(v.price, v.offerPrice);
                  const isSelected = selectedVariant?.size === v.size;
                  const oos = v.stockQuantity === 0;

                  return (
                    <button
                      key={v.size}
                      disabled={oos}
                      onClick={() => setSelectedVariant(isSelected ? null : v)}
                      className={`
                        w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm transition-all
                        ${oos
                          ? 'opacity-40 cursor-not-allowed bg-muted/30 border-border'
                          : isSelected
                            ? 'border-primary bg-primary/8 ring-1 ring-primary/30'
                            : 'border-border bg-background hover:border-primary/60 hover:bg-primary/5'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {/* Selection indicator */}
                        <span className={`
                          h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'}
                        `}>
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="font-medium">{v.size}</span>
                        {oos && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{formatBDT(vPrice)}</p>
                        {v.offerPrice != null && v.offerPrice < v.price && (
                          <p className="text-[10px] text-muted-foreground line-through">
                            {formatBDT(v.price)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── Quantity + Summary ── */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Quantity</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Line total */}
          {lineTotal !== null && (
            <div className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="text-base font-bold text-primary">{formatBDT(lineTotal)}</p>
            </div>
          )}
        </div>

        <DialogFooter showCloseButton>
          <Button
            disabled={!canAdd}
            onClick={handleAdd}
            className="gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NewInStoreOrderPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const { data: products = [], isLoading: productsLoading } = useProducts({
    search: searchQuery || undefined,
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [dialogProduct, setDialogProduct] = useState<Product | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Cart ─────────────────────────────────────────────────────────────────

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + item.quantity } : c
        );
      }
      return [...prev, item];
    });
    toast.success(`${item.name} added to cart`);
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty. Add at least one product.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        orderType: 'instore',
        paymentMethod: 'cash',
        fullName: customerName.trim() || 'In-Store Customer',
        phone: customerPhone.trim() || '01000000000',
        email: 'instore@decantre.com',
        address: 'In-Store',
        city: 'Dhaka',
        thana: 'Dhaka',
        district: 'Dhaka',
        zip: '1000',
        giftWrap: false,
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          size: item.size,
          concentration: '',
        })),
        subtotal,
        shippingFee: 0,
        tax: 0,
        total: subtotal,
        createdBy: 'staff',
      };

      await apiClient.post('/api/v1/orders', payload);
      toast.success('In-store order created successfully!');
      router.push('/dashboard/orders');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.join(', ') ||
        'Failed to create order.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 space-y-0 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New In-Store Order</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Walk-in counter sale — order ID prefixed with{' '}
            <span className="font-mono font-semibold text-primary">S</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Product Catalogue ──────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Product Catalogue
            </h3>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Product Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1">
                {products.map((product) => {
                  const inCart = cart.filter((c) => c.id.startsWith(product.id));
                  const cartQty = inCart.reduce((s, c) => s + c.quantity, 0);
                  const isOutOfStock = product.status === 'Out of Stock';
                  const isVariant = product.type === 'variant';
                  const displayPrice = isVariant
                    ? Math.min(...(product.variants.map((v) => effectivePrice(v.price, v.offerPrice))))
                    : effectivePrice(product.price, product.offerPrice);

                  return (
                    <div
                      key={product.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl border bg-background transition-all
                        ${isOutOfStock ? 'opacity-50' : 'hover:border-primary/40 hover:shadow-sm'}
                        ${cartQty > 0 ? 'border-primary/50 bg-primary/3' : 'border-border'}
                      `}
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight truncate">{product.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{product.sku}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-sm font-semibold text-primary">
                            {isVariant ? `from ${formatBDT(displayPrice)}` : formatBDT(displayPrice)}
                          </span>
                          {isVariant && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 gap-0.5">
                              <Layers className="h-2.5 w-2.5" /> {product.variants.length} sizes
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Add button */}
                      <div className="flex flex-col items-center gap-1">
                        {cartQty > 0 && (
                          <span className="text-[10px] font-semibold text-primary">×{cartQty}</span>
                        )}
                        <button
                          disabled={isOutOfStock}
                          onClick={() => !isOutOfStock && setDialogProduct(product)}
                          className={`
                            h-8 w-8 rounded-lg flex items-center justify-center transition-all
                            ${isOutOfStock
                              ? 'bg-muted cursor-not-allowed text-muted-foreground'
                              : 'bg-primary text-primary-foreground hover:bg-primary/80 active:scale-95 shadow-sm'
                            }
                          `}
                          title={isOutOfStock ? 'Out of Stock' : 'Add to cart'}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Cart + Checkout ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Info */}
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-base mb-3">Customer Info (Optional)</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Customer Name</label>
                <Input
                  placeholder="Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                <Input
                  placeholder="01XXXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Cart
              {cart.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {cart.reduce((s, c) => s + c.quantity, 0)} items
                </Badge>
              )}
            </h3>

            {cart.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No items added yet</p>
                <p className="text-xs mt-1">Click + on a product to add it</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBDT(item.price)} × {item.quantity} ={' '}
                        <span className="font-semibold text-foreground">
                          {formatBDT(item.price * item.quantity)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="h-6 w-6 rounded flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border space-y-1.5">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatBDT(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatBDT(subtotal)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-muted/50 border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Payment:</span> Cash (In-Store)
              <br />
              Order number prefix:{' '}
              <span className="font-mono font-semibold text-primary">S</span>{' '}
              (e.g. <span className="font-mono text-primary">S2607001</span>)
            </p>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleSubmit}
            disabled={isSubmitting || cart.length === 0}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Creating Order...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirm &amp; Create Order
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Product Variation Dialog ─────────────────────────────────────────── */}
      <ProductAddDialog
        product={dialogProduct}
        onClose={() => setDialogProduct(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
}
