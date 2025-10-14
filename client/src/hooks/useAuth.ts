import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { userAtom } from '@/store/atoms/userAtom';
import { getProfile } from '@/services/api';

export const useAuth = () => {
  const setUser = useSetRecoilState(userAtom);

  useEffect(() => {
    getProfile()
      .then((response) => {
        setUser(response.data.data?.user || null);
      })
      .catch(() => {
        setUser(null);
      });
  }, [setUser]);
};
