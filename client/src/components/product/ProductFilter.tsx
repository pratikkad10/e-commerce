import { memo } from "react"
import { Button } from "@/components/ui/button"
import { useRecoilState, useRecoilValue } from "recoil"
import { categoryFilterAtom, priceRangeFilterAtom } from "@/store/atoms/filterAtom"
import { categoriesSelector } from "@/store/selectors/filteredProductsSelector"

const ProductFilter = memo(() => {
  const categories = useRecoilValue(categoriesSelector)
  const [selectedCategory, setSelectedCategory] = useRecoilState(categoryFilterAtom)
  const [priceRange, setPriceRange] = useRecoilState(priceRangeFilterAtom)

  const priceRanges = [
    { value: 'all', label: 'All' },
    { value: 'under500', label: 'Under ₹500' },
    { value: '500-1000', label: '₹500 - ₹1000' },
    { value: '1000-5000', label: '₹1000 - ₹5000' },
    { value: 'above5000', label: 'Above ₹5000' }
  ]

  return (
    <div className="space-y-4 mb-6">
      <div>
        <p className="text-sm font-medium mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.filter((cat): cat is string => typeof cat === 'string').map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Price Range</p>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map(range => (
            <Button
              key={range.value}
              size="sm"
              variant={priceRange === range.value ? 'default' : 'outline'}
              onClick={() => setPriceRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
})

export default ProductFilter
