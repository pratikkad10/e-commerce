import { memo } from "react"
import type { Product } from "@/store/atoms/productAtom"
import Product_card from "./Product_card"

const ProductGrid = memo(({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 w-full">
      {products.map((product) => (
        <Product_card key={product._id} product={product} />
      ))} 
    </div>
  )
})

export default ProductGrid
