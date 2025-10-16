import { useState } from "react"
import { useRecoilValueLoadable } from "recoil"
import ProductGrid from "@/components/product/ProductGrid";
import ProductsLoading from "@/components/product/ProductsLoading";
import ProductError from "@/components/product/ProductError";
import FilterSidebar from "@/components/product/FilterSidebar";
import { filteredProductsSelector } from "@/store/selectors/filteredProductsSelector";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import Banner1 from "@/components/banners/Banner1";

const Shop = () => {
  const productsLoadable = useRecoilValueLoadable(filteredProductsSelector);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const isLoading = productsLoadable.state === 'loading';
  const hasError = productsLoadable.state === 'hasError';
  const products = productsLoadable.state === 'hasValue' ? productsLoadable.contents : [];
  

  return (
    <div className="w-full max-w-[1600px] mx-auto mt-16 md:mt-20 px-4 py-4 md:py-8">
      <Banner1 />
      <h1 className="text-2xl md:text-3xl text-center font-semibold text-foreground/90 mb-4 md:mb-6">All Products</h1>
      
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <aside className="hidden md:block w-56 lg:w-64 flex-shrink-0">
          <div className="sticky top-20 bg-card border border-border rounded-lg p-3 lg:p-4 shadow-sm">
            <FilterSidebar />
          </div>
        </aside>

        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <Button
            size="lg"
            onClick={() => setShowMobileFilters(true)}
            className="rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </div>

        {showMobileFilters && (
          <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}>
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-card border-l border-border shadow-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground/90">Filters</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileFilters(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0">
          {isLoading ? (
            <ProductsLoading />
          ) : hasError ? (
            <ProductError />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <p className="text-sm font-medium text-muted-foreground">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
              <ProductGrid products={products} />
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Shop
