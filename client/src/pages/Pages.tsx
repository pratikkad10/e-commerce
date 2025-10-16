import { Link } from 'react-router-dom'
import { ShoppingBag, Info, Mail, BookOpen, ShieldCheck, FileText, HelpCircle, Truck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const Pages = () => {
  const pageLinks = [
    {
      title: 'About Us',
      description: 'Learn about our story and mission',
      icon: Info,
      link: '/about'
    },
    {
      title: 'Shop',
      description: 'Browse our complete product catalog',
      icon: ShoppingBag,
      link: '/shop'
    },
    {
      title: 'Blog',
      description: 'Read our latest articles and updates',
      icon: BookOpen,
      link: '/blog'
    },
    {
      title: 'Contact',
      description: 'Get in touch with our team',
      icon: Mail,
      link: '/contact'
    },
    {
      title: 'Privacy Policy',
      description: 'How we protect your data',
      icon: ShieldCheck,
      link: '/privacy'
    },
    {
      title: 'Terms & Conditions',
      description: 'Our terms of service',
      icon: FileText,
      link: '/terms'
    },
    {
      title: 'Shipping Info',
      description: 'Delivery and shipping details',
      icon: Truck,
      link: '/shipping'
    },
    {
      title: 'FAQ',
      description: 'Frequently asked questions',
      icon: HelpCircle,
      link: '/faq'
    }
  ]

  return (
    <div className="min-h-screen px-4 mt-16   md:py-20 lg:mt-0">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground/90 mb-4">
            Explore Our Pages
          </h1>
          <p className="text-lg text-muted-foreground">
            Find everything you need to know about our store
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pageLinks.map((page) => {
            const Icon = page.icon
            return (
              <Link key={page.link} to={page.link}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{page.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription>{page.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Pages
