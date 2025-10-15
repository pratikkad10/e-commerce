import { AlertCircle } from "lucide-react"
import { Button } from "../ui/button"

const ProductError = () => {
  return (
    <div className="container mx-auto mt-12 px-4 py-8">
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="max-w-md w-full">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Failed to Load Products</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unable to fetch products. Please check your connection and try again.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductError
