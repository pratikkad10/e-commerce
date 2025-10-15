import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { productByIdSelector } from "@/store/selectors/productByIdSelector";
import ProductDetailPage from "@/components/product/detail/ProductDetailPage";

const Product = () => {
  const { id } = useParams();
  const product = useRecoilValue(productByIdSelector(id || ''));
  
  if (!product) {
    return (
      <div className="container mx-auto mt-12 px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Product not found</h2>
        <p className="text-muted-foreground mt-2">The product you're looking for doesn't exist.</p>
      </div>
    )
  }
  
  return <ProductDetailPage product={product} />
}

export default Product