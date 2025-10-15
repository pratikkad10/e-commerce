import { selector } from 'recoil';
import { productsAtom } from '../atoms/productAtom';
import { 
  categoryFilterAtom, 
  priceRangeFilterAtom, 
  brandFilterAtom, 
  ratingFilterAtom, 
  sortByAtom,
  inStockOnlyAtom 
} from '../atoms/filterAtom';

export const filteredProductsSelector = selector({
  key: 'filteredProducts',
  get: ({ get }) => {
    const products = get(productsAtom);
    const categoryFilter = get(categoryFilterAtom);
    const priceRangeFilter = get(priceRangeFilterAtom);
    const brandFilter = get(brandFilterAtom);
    const ratingFilter = get(ratingFilterAtom);
    const sortBy = get(sortByAtom);
    const inStockOnly = get(inStockOnlyAtom);

    let filtered = products.filter(product => {
      // Category filter
      if (categoryFilter !== 'all' && product.category?.name !== categoryFilter) {
        return false;
      }

      // Brand filter
      if (brandFilter !== 'all' && product.brand?.name !== brandFilter) {
        return false;
      }

      // Price filter
      if (priceRangeFilter === 'under500' && product.price >= 500) return false;
      if (priceRangeFilter === '500-1000' && (product.price < 500 || product.price > 1000)) return false;
      if (priceRangeFilter === '1000-5000' && (product.price < 1000 || product.price > 5000)) return false;
      if (priceRangeFilter === 'above5000' && product.price <= 5000) return false;

      // Rating filter
      if (ratingFilter > 0 && (product.averageRating || 0) < ratingFilter) {
        return false;
      }

      // Stock filter
      if (inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === 'newest') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  },
});

export const categoriesSelector = selector({
  key: 'categories',
  get: ({ get }) => {
    const products = get(productsAtom);
    const cats = products.map(p => p.category?.name).filter(Boolean);
    return ['all', ...Array.from(new Set(cats))];
  },
});

export const brandsSelector = selector({
  key: 'brands',
  get: ({ get }) => {
    const products = get(productsAtom);
    const brands = products.map(p => p.brand?.name).filter(Boolean);
    return ['all', ...Array.from(new Set(brands))];
  },
});
