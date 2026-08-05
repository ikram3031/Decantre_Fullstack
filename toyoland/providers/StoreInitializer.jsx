"use client";

import { useEffect } from "react";
import { useAppStore } from "@/core/store/useAppStore";

export function StoreInitializer({ children }) {
  const initStore = useAppStore((state) => state.initStore);
  const fetchProducts = useAppStore((state) => state.fetchProducts);
  const fetchCategories = useAppStore((state) => state.fetchCategories);

  useEffect(() => {
    initStore();
    fetchProducts();
    fetchCategories();
  }, [initStore, fetchProducts, fetchCategories]);

  return <>{children}</>;
}
