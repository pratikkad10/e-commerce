import { Navigate, Outlet } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { userAtom } from '@/store/atoms/userAtom'

const ProtectedRoute = () => {
  const user = useRecoilValue(userAtom)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
