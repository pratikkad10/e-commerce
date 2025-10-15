import { memo } from "react"
import type { Product } from "@/store/atoms/productAtom"
import Product_card from "./Product_card"

const ProductGrid = memo(({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 justify-items-center">
      {products.map((product) => (
        <Product_card key={product._id} product={product} />
      ))} 
    </div>
  )
})

export default ProductGrid
