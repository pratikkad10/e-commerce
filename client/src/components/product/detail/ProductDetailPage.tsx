import { useState, Suspense } from "react"
import ImageGallery from "./ImageGallery"
import ProductInfo from "./ProductInfo"
import TabsSection from "./TabsSection"

import type { Product } from "@/store/atoms/productAtom"

type ProductDetailPageProps = {
  product: Product
}

const ProductDetailPage = ({ product }: ProductDetailPageProps) => {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'discussion'>('details')

  return (
    <div className="container mx-auto px-4 py-4 mt-12">
      <div className="bg-background rounded-md shadow-md p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageGallery
            images={product.images.map(img => ({ url: img.url, alt: img.alt || product.name }))}
            primaryImage={product.primaryImage ? { url: product.primaryImage.url, alt: product.primaryImage.alt || product.name } : { url: product.images[0]?.url || '', alt: product.images[0]?.alt || product.name }}
          />
          <ProductInfo
            name={product.name}
            brand={product.brand || { name: 'Unknown' }}
            category={product.category || { name: 'Uncategorized' }}
            price={product.price}
            comparePrice={product.comparePrice}
            discountPercentage={product.discountPercentage}
            averageRating={product.averageRating || 0}
            totalReviews={product.totalReviews || 0}
            isOutOfStock={product.stock === 0}
            description={product.description}
          />
        </div>

        <TabsSection
          description={product.description}
          productId={product._id}
          averageRating={product.averageRating || 0}
          totalReviews={product.totalReviews || 0}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  )
}

export default ProductDetailPage
