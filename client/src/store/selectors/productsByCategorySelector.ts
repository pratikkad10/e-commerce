
import { selectorFamily } from "recoil";
import { productsAtom } from "../atoms/productAtom";

export const productsByCategorySelector = selectorFamily({
  key: 'productsByCategory',
  get: (category: string) => ({get}) => {
    const products = get(productsAtom);
    return products.filter(p => p.category?.slug === category || p.category?._id === category);
  },
});
