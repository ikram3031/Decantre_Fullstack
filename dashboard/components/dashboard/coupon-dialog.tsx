'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Search, Info } from 'lucide-react';
import type { Coupon } from '@/types';

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couponToEdit?: Coupon | null;
}

const toDateTimeLocalString = (isoString?: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function CouponDialog({ open, onOpenChange, couponToEdit }: CouponDialogProps) {
  const isEdit = !!couponToEdit;
  const queryClient = useQueryClient();

  // Basic coupon fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [active, setActive] = useState(true);

  // Usage Limit fields
  const [isUnlimited, setIsUnlimited] = useState(true);
  const [usageLimit, setUsageLimit] = useState('');

  // Restrictions selection fields
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // DB entities list for selection
  const [productsList, setProductsList] = useState<{ id: string; name: string }[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);
  const [brandsList, setBrandsList] = useState<{ id: string; name: string }[]>([]);

  // Search filter keywords
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products, categories, brands for selection
  useEffect(() => {
    if (!open) return;

    const fetchEntities = async () => {
      setIsLoadingEntities(true);
      try {
        // Fetch categories
        const catRes = await apiClient.get('/api/v1/categories');
        const cats = Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || [];
        setCategoriesList(cats.map((c: any) => ({ id: c._id || c.id, name: c.name })));

        // Fetch brands
        const brandRes = await apiClient.get('/api/v1/brands', { params: { limit: 1000 } });
        const brands = Array.isArray(brandRes.data) ? brandRes.data : brandRes.data?.data || [];
        setBrandsList(brands.map((b: any) => ({ id: b._id || b.id, name: b.name })));

        // Fetch products
        const prodRes = await apiClient.get('/api/v1/products', { params: { limit: 200 } });
        const prods = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data || [];
        setProductsList(prods.map((p: any) => ({ id: p._id || p.id, name: p.name })));
      } catch (err) {
        console.error('Failed to load selection entities', err);
        toast.error('Failed to load products/categories list.');
      } finally {
        setIsLoadingEntities(false);
      }
    };

    fetchEntities();
  }, [open]);

  // Set form state when coupon to edit changes
  useEffect(() => {
    if (open) {
      if (couponToEdit) {
        setCode(couponToEdit.code);
        setDiscountType(couponToEdit.discountType);
        setDiscountValue(String(couponToEdit.discountValue));
        setMinOrderAmount(String(couponToEdit.minOrderAmount ?? 0));
        setValidFrom(toDateTimeLocalString(couponToEdit.validFrom));
        setValidTo(toDateTimeLocalString(couponToEdit.validTo));
        setActive(couponToEdit.active);

        const limitVal = couponToEdit.usageLimit;
        if (limitVal !== undefined && limitVal !== null) {
          setIsUnlimited(false);
          setUsageLimit(String(limitVal));
        } else {
          setIsUnlimited(true);
          setUsageLimit('');
        }

        const mapToIds = (items?: any[]) => {
          if (!items) return [];
          return items.map((item) => (typeof item === 'object' ? item._id || item.id : item)).filter(Boolean);
        };

        setSelectedProducts(mapToIds(couponToEdit.applicableProducts));
        setSelectedCategories(mapToIds(couponToEdit.applicableCategories));
        setSelectedBrands(mapToIds(couponToEdit.applicableBrands));
      } else {
        // Reset form
        setCode('');
        setDiscountType('percentage');
        setDiscountValue('');
        setMinOrderAmount('0');
        setValidFrom('');
        setValidTo('');
        setActive(true);
        setIsUnlimited(true);
        setUsageLimit('');
        setSelectedProducts([]);
        setSelectedCategories([]);
        setSelectedBrands([]);
        setProductSearch('');
        setCategorySearch('');
        setBrandSearch('');
      }
    }
  }, [open, couponToEdit]);

  const handleToggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error('Coupon code is required.');
      return;
    }

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      toast.error('Discount value must be a positive number.');
      return;
    }

    if (discountType === 'percentage' && val > 100) {
      toast.error('Percentage discount cannot exceed 100%.');
      return;
    }

    const minAmount = parseFloat(minOrderAmount);
    if (isNaN(minAmount) || minAmount < 0) {
      toast.error('Minimum order amount cannot be negative.');
      return;
    }

    if (validFrom && validTo && new Date(validTo) < new Date(validFrom)) {
      toast.error('Valid to date cannot be earlier than valid from date.');
      return;
    }

    let limitNum: number | null = null;
    if (!isUnlimited) {
      const l = parseInt(usageLimit, 10);
      if (isNaN(l) || l <= 0) {
        toast.error('Usage limit must be a positive number if set.');
        return;
      }
      limitNum = l;
    }

    setIsSubmitting(true);
    try {
      const body = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: val,
        minOrderAmount: minAmount,
        validFrom: validFrom ? new Date(validFrom).toISOString() : null,
        validTo: validTo ? new Date(validTo).toISOString() : null,
        active,
        usageLimit: limitNum,
        applicableProducts: selectedProducts,
        applicableCategories: selectedCategories,
        applicableBrands: selectedBrands,
      };

      if (isEdit && couponToEdit) {
        await apiClient.put(`/api/v1/coupons/${couponToEdit.id}`, body);
        toast.success(`Coupon "${body.code}" updated successfully.`);
      } else {
        await apiClient.post('/api/v1/coupons', body);
        toast.success(`Coupon "${body.code}" created successfully.`);
      }

      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to save coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter lists
  const filteredProducts = productsList.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );
  const filteredCategories = categoriesList.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const filteredBrands = brandsList.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the settings for this discount code.'
              : 'Add a new promotion code to reward your customers.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Coupon Code */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Coupon Code
              </label>
              <Input
                placeholder="e.g. SAVE20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Discount Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Discount Type
              </label>
              <Select
                value={discountType}
                onValueChange={(v: any) => setDiscountType(v)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Discount Value */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Discount Value {discountType === 'percentage' ? '(%)' : '(৳)'}
              </label>
              <Input
                type="number"
                step="any"
                placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Min Order Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Min Order Amount (৳)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 500"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Valid From */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Valid From
              </label>
              <Input
                type="datetime-local"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Valid To */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Valid To
              </label>
              <Input
                type="datetime-local"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-border/60 py-4 items-center">
            {/* Active Status */}
            <div className="flex items-center justify-between pr-4 border-r">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Active Status
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Disable to make coupon inactive immediately.
                </span>
              </div>
              <Switch checked={active} onCheckedChange={setActive} disabled={isSubmitting} />
            </div>

            {/* Usage Limit */}
            <div className="flex items-center justify-between pl-4">
              <div className="flex-1 space-y-1 mr-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Usage Limit
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground">Unlimited</span>
                    <Switch
                      checked={isUnlimited}
                      onCheckedChange={(checked) => {
                        setIsUnlimited(checked);
                        if (checked) setUsageLimit('');
                      }}
                      disabled={isSubmitting}
                      size="sm"
                    />
                  </div>
                </div>
                <Input
                  type="number"
                  placeholder="Max times applicable..."
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  disabled={isUnlimited || isSubmitting}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* ADVANCED RESTRICTIONS */}
          <div className="space-y-4 pt-1">
            <h4 className="text-sm font-bold tracking-tight border-b pb-2 flex items-center gap-2 text-primary">
              <Info className="h-4 w-4 text-amber-500" />
              Advanced Restrictions (Optional)
            </h4>
            <p className="text-xs text-muted-foreground -mt-2">
              If restrictions are selected, this coupon will only apply to orders containing those specific brands, categories, or products.
            </p>

            {isLoadingEntities ? (
              <div className="py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <span className="animate-pulse">Loading restriction options...</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {/* Category Restrictions */}
                <div className="space-y-2 border rounded-lg p-3 bg-muted/10">
                  <span className="text-xs font-bold block uppercase tracking-wider text-muted-foreground border-b pb-1">
                    Categories ({selectedCategories.length})
                  </span>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground/60" />
                    <Input
                      placeholder="Search categories..."
                      className="pl-7 h-7 text-xs"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                  </div>
                  <div className="h-32 overflow-y-auto border rounded bg-background p-1 space-y-1">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 px-1.5 py-1 text-xs hover:bg-muted/50 rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={() => handleToggleCategory(cat.id)}
                            className="rounded border-border"
                          />
                          <span className="truncate">{cat.name}</span>
                        </label>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground p-2 block text-center">No categories found</span>
                    )}
                  </div>
                </div>

                {/* Brand Restrictions */}
                <div className="space-y-2 border rounded-lg p-3 bg-muted/10">
                  <span className="text-xs font-bold block uppercase tracking-wider text-muted-foreground border-b pb-1">
                    Brands ({selectedBrands.length})
                  </span>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground/60" />
                    <Input
                      placeholder="Search brands..."
                      className="pl-7 h-7 text-xs"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                    />
                  </div>
                  <div className="h-32 overflow-y-auto border rounded bg-background p-1 space-y-1">
                    {filteredBrands.length > 0 ? (
                      filteredBrands.map((brand) => (
                        <label
                          key={brand.id}
                          className="flex items-center gap-2 px-1.5 py-1 text-xs hover:bg-muted/50 rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.id)}
                            onChange={() => handleToggleBrand(brand.id)}
                            className="rounded border-border"
                          />
                          <span className="truncate">{brand.name}</span>
                        </label>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground p-2 block text-center">No brands found</span>
                    )}
                  </div>
                </div>

                {/* Product Restrictions */}
                <div className="space-y-2 border rounded-lg p-3 bg-muted/10">
                  <span className="text-xs font-bold block uppercase tracking-wider text-muted-foreground border-b pb-1">
                    Products ({selectedProducts.length})
                  </span>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground/60" />
                    <Input
                      placeholder="Search products..."
                      className="pl-7 h-7 text-xs"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                  <div className="h-32 overflow-y-auto border rounded bg-background p-1 space-y-1">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((prod) => (
                        <label
                          key={prod.id}
                          className="flex items-center gap-2 px-1.5 py-1 text-xs hover:bg-muted/50 rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(prod.id)}
                            onChange={() => handleToggleProduct(prod.id)}
                            className="rounded border-border"
                          />
                          <span className="truncate" title={prod.name}>{prod.name}</span>
                        </label>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground p-2 block text-center">No products found</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
