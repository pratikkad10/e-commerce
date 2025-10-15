import { selectorFamily } from 'recoil';
import { productsQuery } from './productQuery';

export const searchProductsSelector = selectorFamily({
  key: 'searchProducts',
  get: (query: string) => ({ get }) => {
    const products = get(productsQuery);
    if (!Array.isArray(products)) return [];
    if (!query) return products;
    
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  },
});
