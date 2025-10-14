import { ShoppingCart } from 'lucide-react'
import { Button } from '../ui/button'

const Cart = () => {
  return (
    <Button variant="ghost" size="icon">
        <ShoppingCart className="h-5 w-5" />
    </Button>
  )
}

export default Cart