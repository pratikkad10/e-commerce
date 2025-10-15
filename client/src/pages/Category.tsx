import { useParams } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { filteredProductsSelector } from "@/store/selectors/filteredProductsSelector"
import FilterSidebar from "@/components/product/FilterSidebar"
import ProductGrid from "@/components/product/ProductGrid"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"

const Category = () => {
  const { slug } = useParams()
  const filteredProducts = useRecoilValue(filteredProductsSelector)
  
  const categoryProducts = filteredProducts.filter(p => 
    p.category?.slug === slug
  )
  
  const categoryName = slug?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{categoryName}</h1>
        <p className="text-muted-foreground">
          {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'} found
        </p>
      </div>
      
      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar />
        </aside>

        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-lg">
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <FilterSidebar />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1">
          {categoryProducts.length > 0 ? (
            <ProductGrid products={categoryProducts} />
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Category