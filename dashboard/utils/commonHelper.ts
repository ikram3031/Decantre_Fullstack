import type { HrefType } from "@/types";

export type hrefType = HrefType;

export function formatCurrency(amount: number, currency: string = "৳"): string {
  return `${currency}${amount.toFixed(2)}`;
}