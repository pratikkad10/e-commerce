import { selectorFamily } from 'recoil';
import { productsAtom } from '../atoms/productAtom';

export const productByIdSelector = selectorFamily({
  key: 'productById',
  get: (productId: string) => ({ get }) => {
    const products = get(productsAtom);
    return products.find(product => product._id === productId);
  },
});
