import { atom } from 'recoil';

export const errorAtom = atom<string | null>({
  key: 'error',
  default: null,
});
