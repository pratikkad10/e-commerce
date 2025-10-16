import { selector } from "recoil";
import { getProducts } from "@/services/api";
import type { Product } from "../atoms/productAtom";

export const productsQuery = selector<Product[]>({
  key: 'productsQuery',
  get: async () => {
    const response = await getProducts();
    return response.data.data || [];
  },
});