
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { Toaster } from './components/ui/sonner'
import Layout from './layout/Layout'
import Categories from './pages/Categories'
import { Landing } from './pages/Landing'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import NotFound from './pages/NotFound'
import { useAuth } from './hooks/useAuth'

function App() {
  useAuth();

  return (
    <>
    <Toaster />
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/categories" element={<Categories />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Layout>      
    </>
  )
}

export default App
