import { useState } from 'react'
import { Menu, User2, X, LogIn, UserPlus, LogOut, MoreHorizontal, Home, ShoppingBag, InfoIcon, FileText, File, Contact } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { userAtom } from '@/store/atoms/userAtom'
import { logoutUser } from '@/services/api'
import { toast } from 'sonner'
import Cart from './Cart'
import DarkToggle from './DarkToggle'
import Link from './Link'
import LogoText from './LogoText'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import Search from './Search'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const user = useRecoilValue(userAtom)
  
  const setUser = useSetRecoilState(userAtom)

  const handleLogout = () => {
    logoutUser()
      .then(() => {
        localStorage.removeItem('token')
        setUser(null)
        toast.success('Logged out successfully')
        navigate('/')
      })
      .catch(() => {
        toast.error('Logout failed')
      })
  }

  

   const mainLinks = [
    { linkName: "Home", link: "/" },
    { linkName: "Categories", link: "/categories" },
    { linkName: "Shop", link: "/shop" },
  ]

  const moreLinks = [
    { linkName: "About", link: "/about" },
    { linkName: "Blog", link: "/blog" },
    { linkName: "Pages", link: "/pages" },
    { linkName: "Contact", link: "/contact" },
  ]

  const links = [
    { linkName: "Home", link: "/", icon: <Home /> },
    { linkName: "Categories", link: "/categories", icon: <Menu /> },
    { linkName: "Shop", link: "/shop", icon: <ShoppingBag /> },
    { linkName: "About", link: "/about", icon: <InfoIcon /> },
    { linkName: "Blog", link: "/blog", icon: <FileText /> },
    { linkName: "Pages", link: "/pages", icon: <File /> },
    { linkName: "Contact", link: "/contact", icon: <Contact /> },
    { linkName: "Profile", link: "/profile", icon: <User2 /> },
  ]

  // const shop = [
  //   { linkName: "Men", link: "/men" },
  //   { linkName: "Women", link: "/women" },
  //   { linkName: "Kids", link: "/kids" },
  //   { linkName: "Electronics", link: "/electronics" },
  //   { linkName: "Home & Kitchen", link: "/home-kitchen" },
  //   { linkName: "Beauty", link: "/beauty" },
  //   { linkName: "Sports", link: "/sports" },
  // ]

  return (
    <nav className='flex justify-between items-center px-4 md:px-6 py-4 bg-transparent fixed top-0 left-0 right-0 z-50'>
      <LogoText />

<div className="hidden lg:block flex-1 max-w-xl mx-auto">

        <Search />
      </div>

      <div className="hidden lg:flex items-center gap-6">
        {mainLinks.map((item) => (
          <Link key={item.link} linkName={item.linkName} link={item.link} />
        ))}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {moreLinks.map((item) => (
              <DropdownMenuItem key={item.link} onClick={() => navigate(item.link)}>
                {item.linkName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <DarkToggle />
        <Cart />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User2 className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user ? (
              <>
                <DropdownMenuItem disabled>
                  <User2 className="mr-2 h-4 w-4" />
                  {user.fullName}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => navigate('/login')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/signup')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex md:hidden items-center gap-2">
        <DarkToggle />
        <Cart />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User2 className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user ? (
              <>
                <DropdownMenuItem disabled>
                  <User2 className="mr-2 h-4 w-4" />
                  {user.fullName}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => navigate('/login')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/signup')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background text-foreground border-b border-border md:hidden">
          <div className="flex flex-col p-4 gap-4">
              <Search />
            
            {links.map((item) => (
              <Link
                key={item.link}
                linkName={item.linkName}
                link={item.link}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
