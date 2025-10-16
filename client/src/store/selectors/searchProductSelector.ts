import { selectorFamily } from 'recoil';
import { productsAtom } from '../atoms/productAtom';

export const searchProductsSelector = selectorFamily({
  key: 'searchProducts',
  get: (query: string) => ({ get }) => {
    const products = get(productsAtom);
    if (!Array.isArray(products)) return [];
    if (!query) return products;
    
    const lowerQuery = query.toLowerCase().trim();
    
    const matchesWord = (text: string, query: string) => {
      const words = text.toLowerCase().split(/\s+/);
      return words.some(word => word === query || word.startsWith(query));
    };
    
    return products.filter(p => {
    
      if (!lowerQuery.includes(' ')) {
        return (
          matchesWord(p.name, lowerQuery) ||
          matchesWord(p.description || '', lowerQuery) ||
          matchesWord(p.shortDescription || '', lowerQuery) ||
          matchesWord(p.category?.name || '', lowerQuery) ||
          matchesWord(p.brand?.name || '', lowerQuery) ||
          p.tags?.some(tag => tag.toLowerCase() === lowerQuery) ||
          p.sku?.toLowerCase().includes(lowerQuery) ||
          p.seo?.metaKeywords?.some(keyword => keyword.toLowerCase() === lowerQuery)
        );
      }
      
      return (
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.shortDescription?.toLowerCase().includes(lowerQuery) ||
        p.category?.name.toLowerCase().includes(lowerQuery) ||
        p.brand?.name.toLowerCase().includes(lowerQuery) ||
        p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        p.sku?.toLowerCase().includes(lowerQuery) ||
        p.seo?.metaKeywords?.some(keyword => keyword.toLowerCase().includes(lowerQuery))
      );
    });
  },
});
