import { memo } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRecoilState, useRecoilValue } from "recoil"
import { 
  categoryFilterAtom, 
  priceRangeFilterAtom, 
  brandFilterAtom, 
  ratingFilterAtom, 
  sortByAtom,
  inStockOnlyAtom 
} from "@/store/atoms/filterAtom"
import { categoriesSelector, brandsSelector } from "@/store/selectors/filteredProductsSelector"
import { Star, X } from "lucide-react"

const FilterSidebar = memo(() => {
  const categories = useRecoilValue(categoriesSelector)
  const brands = useRecoilValue(brandsSelector)
  
  const [selectedCategory, setSelectedCategory] = useRecoilState(categoryFilterAtom)
  const [priceRange, setPriceRange] = useRecoilState(priceRangeFilterAtom)
  const [selectedBrand, setSelectedBrand] = useRecoilState(brandFilterAtom)
  const [rating, setRating] = useRecoilState(ratingFilterAtom)
  const [sortBy, setSortBy] = useRecoilState(sortByAtom)
  const [inStockOnly, setInStockOnly] = useRecoilState(inStockOnlyAtom)

  const clearAllFilters = () => {
    setSelectedCategory('all')
    setPriceRange('all')
    setSelectedBrand('all')
    setRating(0)
    setSortBy('default')
    setInStockOnly(false)
  }

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'under500', label: 'Under ₹500' },
    { value: '500-1000', label: '₹500 - ₹1000' },
    { value: '1000-5000', label: '₹1000 - ₹5000' },
    { value: 'above5000', label: 'Above ₹5000' }
  ]

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="pb-4 border-b border-border">
        <Label className="text-foreground mb-3 block">Sort By</Label>
        <RadioGroup value={sortBy} onValueChange={setSortBy}>
          {sortOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`sort-${option.value}`} />
              <Label htmlFor={`sort-${option.value}`} className="text-muted-foreground cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="pb-4 border-b border-border">
        <Label className="text-foreground mb-3 block">Category</Label>
        <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
          {categories.filter((cat): cat is string => typeof cat === 'string').map(cat => (
            <div key={cat} className="flex items-center space-x-2">
              <RadioGroupItem value={cat} id={`cat-${cat}`} />
              <Label htmlFor={`cat-${cat}`} className="text-muted-foreground cursor-pointer capitalize">
                {cat}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="pb-4 border-b border-border">
        <Label className="text-foreground mb-3 block">Brand</Label>
        <RadioGroup value={selectedBrand} onValueChange={setSelectedBrand} className="max-h-48 overflow-y-auto">
          {brands.filter((brand): brand is string => typeof brand === 'string').map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <RadioGroupItem value={brand} id={`brand-${brand}`} />
              <Label htmlFor={`brand-${brand}`} className="text-muted-foreground cursor-pointer capitalize">
                {brand}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="pb-4 border-b border-border">
        <Label className="text-foreground mb-3 block">Price Range</Label>
        <RadioGroup value={priceRange} onValueChange={setPriceRange}>
          {priceRanges.map(range => (
            <div key={range.value} className="flex items-center space-x-2">
              <RadioGroupItem value={range.value} id={`price-${range.value}`} />
              <Label htmlFor={`price-${range.value}`} className="text-muted-foreground cursor-pointer">
                {range.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="pb-4 border-b border-border">
        <Label className="text-foreground mb-3 block">Minimum Rating</Label>
        <RadioGroup value={rating.toString()} onValueChange={(val: string) => setRating(Number(val))}>
          {[4, 3, 2, 1].map(stars => (
            <div key={stars} className="flex items-center space-x-2">
              <RadioGroupItem value={stars.toString()} id={`rating-${stars}`} />
              <Label htmlFor={`rating-${stars}`} className="text-muted-foreground cursor-pointer flex items-center gap-1">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1">& Up</span>
              </Label>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="rating-0" />
            <Label htmlFor="rating-0" className="text-muted-foreground cursor-pointer">
              All Ratings
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-foreground mb-3 block">Availability</Label>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="stock" 
            checked={inStockOnly} 
            onCheckedChange={(checked: boolean) => setInStockOnly(checked)}
          />
          <Label htmlFor="stock" className="text-muted-foreground cursor-pointer">
            In Stock Only
          </Label>
        </div>
      </div>
    </div>
  )
})

export default FilterSidebar
