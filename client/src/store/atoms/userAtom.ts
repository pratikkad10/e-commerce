import { atom } from 'recoil';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isEmailVerified: boolean;
  phone?: string;
  storeName?: string;
  cartItemCount?: number;
  role: 'customer' | 'seller' | 'admin';
};

export const userAtom = atom<User | null>({
  key: 'user',
  default: null,
});
