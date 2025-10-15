import { atom } from 'recoil';

export const categoryFilterAtom = atom<string>({
  key: 'categoryFilter',
  default: 'all',
});

export const priceRangeFilterAtom = atom<string>({
  key: 'priceRangeFilter',
  default: 'all',
});

export const brandFilterAtom = atom<string>({
  key: 'brandFilter',
  default: 'all',
});

export const ratingFilterAtom = atom<number>({
  key: 'ratingFilter',
  default: 0,
});

export const sortByAtom = atom<string>({
  key: 'sortBy',
  default: 'default',
});

export const inStockOnlyAtom = atom<boolean>({
  key: 'inStockOnly',
  default: false,
});
