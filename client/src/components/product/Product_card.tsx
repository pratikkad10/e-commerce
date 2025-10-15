import { memo } from "react"
import type { Product } from "@/store/atoms/productAtom"
import Image from "./product card ui/Image"
import Name from "./product card ui/Name"
import Description from "./product card ui/Description"
import { Price } from "./product card ui/Price"
import CartBtn from "./product card ui/CartBtn"
import WishlistBtn from "./product card ui/WishlistBtn"
import { useNavigate } from "react-router-dom"

const Product_card = memo(({ product }: { product: Product }) => {
    const navigate = useNavigate();
  return (
    <div 
    onClick={()=>navigate(`/product/${product._id}`)}
    className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      <Image image={product.images[0]} />
      <div className="p-2 sm:p-3 flex flex-col flex-1 gap-1">
        <Name name={product.name} />
        <Description description={product.description} />
        <Price price={product.price} comparePrice={product.comparePrice} />
        <div className="flex gap-1.5 sm:gap-2 mt-auto">
          <CartBtn id={product._id} />
          <WishlistBtn id={product._id} />
        </div>
      </div>
    </div>
  )
})

export default Product_card
