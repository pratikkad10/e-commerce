import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { productsAtom } from '@/store/atoms/productAtom';
import { getProducts } from '@/services/api';

export const useProducts = () => {
  const setProducts = useSetRecoilState(productsAtom);

  useEffect(() => {
    getProducts()
      .then(res => setProducts(res.data.data.products))
      .catch(() => setProducts([]));
  }, [setProducts]);
};
