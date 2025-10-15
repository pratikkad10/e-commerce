import { Spinner } from "../ui/spinner";

const ProductsLoading = () => {
  return (
    <div className="container mx-auto mt-12 px-4 py-8">
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Spinner className="h-12 w-12 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    </div>
  )
}

export default ProductsLoading
