
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
import Shop from './pages/Shop'
import SearchResults from './pages/SearchResults'
import Cart from './pages/Cart'
import About from './pages/About'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import { useProducts } from './hooks/useProducts'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Product from './pages/Product'
import Category from './pages/Category'

function App() {
  //this use auth runs on the mounting of app
  useAuth();
  useProducts();

  return (
    <>
      <Toaster />
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/categories" element={<Categories />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/shop' element={<Shop />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/blog' element={<Blog />} />
          <Route path='/category/:slug' element={<Category />} />
          <Route path='/product/:id' element={<Product />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path='/cart' element={<Cart />} />
            <Route path='/checkout' element={<div>Checkout Page - To be implemented</div>} />
          </Route>
          
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App
