import { Button } from "@/components/ui/button"
import { addToCart } from "@/services/api"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"

const CartBtn = ({id}: {id: string}) => {
  return (
    <Button
      size="sm"
      className="flex-1 cursor-pointer text-xs sm:text-sm px-2 sm:px-3"
      onClick={() => {
        addToCart(id, 1)
          .then(() => toast.success('Added to cart'))
          .catch(() => toast.error('Failed to add to cart'))
      }}
    >
      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
      <span className="hidden sm:inline">Add to Cart</span>
    </Button>
  )
}

export default CartBtn
