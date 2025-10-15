import axios from "axios";
import { selector } from "recoil";
import type { Product } from "../atoms/productAtom";

export const productsQuery = selector<Product[]>({
  key: 'productsQuery',
  get: async () => {
    const response = await axios.get('http://localhost:5000/api/v1/products');
    return response.data.data || [];
  },
});