import { Button } from "@/components/ui/button"
import { addToWishlist, removeFromWishlist } from "@/services/api"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

const WishlistBtn = ({id}: {id: string}) => {
  const [isInWishlist, setIsInWishlist] = useState(false)

  const handleToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(id)
        .then(() => {
          setIsInWishlist(false)
          toast.success('Removed from wishlist')
        })
        .catch(() => toast.error('Failed to remove from wishlist'))
    } else {
      addToWishlist(id)
        .then(() => {
          setIsInWishlist(true)
          toast.success('Added to wishlist')
        })
        .catch(() => toast.error('Failed to add to wishlist'))
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="cursor-pointer px-2 sm:px-3"
      onClick={handleToggle}
    >
      <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
    </Button>
  )
}

export default WishlistBtn
