import { Calendar, User } from "lucide-react"

const Blog = () => {
  const blogs = [
    {
      id: 1,
      title: "Top 10 Shopping Tips for 2025",
      excerpt: "Discover the best strategies to save money and find quality products online.",
      author: "Admin",
      date: "Jan 15, 2025",
      image: "https://via.placeholder.com/400x250/4A5568/FFFFFF?text=Shopping+Tips"
    },
    {
      id: 2,
      title: "How to Choose the Right Electronics",
      excerpt: "A comprehensive guide to selecting the perfect gadgets for your needs.",
      author: "Tech Team",
      date: "Jan 12, 2025",
      image: "https://via.placeholder.com/400x250/6366F1/FFFFFF?text=Electronics"
    },
    {
      id: 3,
      title: "Fashion Trends This Season",
      excerpt: "Stay ahead with the latest fashion trends and styling tips.",
      author: "Fashion Editor",
      date: "Jan 10, 2025",
      image: "https://via.placeholder.com/400x250/EC4899/FFFFFF?text=Fashion"
    },
    {
      id: 4,
      title: "Home Decor Ideas on a Budget",
      excerpt: "Transform your space without breaking the bank with these creative ideas.",
      author: "Home Team",
      date: "Jan 8, 2025",
      image: "https://via.placeholder.com/400x250/10B981/FFFFFF?text=Home+Decor"
    },
    {
      id: 5,
      title: "Sustainable Shopping Guide",
      excerpt: "Learn how to make eco-friendly choices while shopping online.",
      author: "Green Team",
      date: "Jan 5, 2025",
      image: "https://via.placeholder.com/400x250/F59E0B/FFFFFF?text=Sustainable"
    },
    {
      id: 6,
      title: "Gift Ideas for Every Occasion",
      excerpt: "Find the perfect gift for your loved ones with our curated selection.",
      author: "Gift Guide",
      date: "Jan 3, 2025",
      image: "https://via.placeholder.com/400x250/8B5CF6/FFFFFF?text=Gifts"
    }
  ]

  return (
    <div className="container mx-auto mt-12 px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground text-center mb-2">Our Blog</h1>
      <p className="text-muted-foreground text-center mb-8 text-sm">
        Tips, trends, and insights for smart shopping
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {blogs.map((blog) => (
          <article key={blog.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video overflow-hidden bg-muted">
              <img 
                src={blog.image} 
                alt={blog.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-3">
              <h2 className="text-sm font-semibold text-card-foreground mb-1 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                {blog.title}
              </h2>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {blog.excerpt}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{blog.date}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Blog
