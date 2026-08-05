export const effectivePrice = (price: number, offerPrice: number | null) =>
  offerPrice != null && offerPrice > 0 && offerPrice < price ? offerPrice : price;

export const formatBDT = (amount: number) => `৳${amount.toLocaleString("en-BD")}`;
