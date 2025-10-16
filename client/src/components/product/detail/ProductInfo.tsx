import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import RatingStars from "./RatingStars"

type ProductInfoProps = {
  name: string
  brand: { name: string }
  category: { name: string }
  price: number
  comparePrice?: number
  discountPercentage?: number
  averageRating: number
  totalReviews: number
  isOutOfStock: boolean
  description: string
}

const ProductInfo = ({
  name,
  brand,
  category,
  price,
  comparePrice,
  discountPercentage,
  averageRating,
  totalReviews,
  isOutOfStock,
  description
}: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">{brand.name}</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground/90 mb-1">{name}</h1>
        <p className="text-sm text-muted-foreground">{category.name}</p>
      </div>

      <RatingStars rating={averageRating} totalReviews={totalReviews} />

      <div className="p-4">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">₹{Math.round(price)}</span>
          {comparePrice && comparePrice > price && (
            <span className="text-lg text-muted-foreground line-through italic">₹{Math.round(comparePrice)}</span>
          )}
          {(discountPercentage ?? 0) > 0 && (
            <Badge className="bg-green-500 hover:bg-green-600">{discountPercentage}% OFF</Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Stock:</span>
        <Badge variant={isOutOfStock ? "destructive" : "default"}>
          {isOutOfStock ? "Out of Stock" : "In Stock"}
        </Badge>
      </div>

      <Separator className="bg-foreground/20 rounded-full" />

      <div>
        <p className="text-sm font-medium mb-3">Quantity</p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={isOutOfStock}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium w-12 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
            disabled={isOutOfStock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 h-11 cursor-pointer" disabled={isOutOfStock}>
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
        <Button variant="secondary" className="flex-1 h-11 cursor-pointer" disabled={isOutOfStock}>
          Buy Now
        </Button>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Description</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default ProductInfo
