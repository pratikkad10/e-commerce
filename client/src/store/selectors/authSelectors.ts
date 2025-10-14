import { selector } from 'recoil';
import { userAtom } from '../atoms/userAtom';

export const isLoggedInSelector = selector({
  key: 'isLoggedIn',
  get: ({ get }) => {
    const user = get(userAtom);
    return user !== null;
  },
});
