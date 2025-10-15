import { useReviews } from "@/hooks/useReviews"
import { ReviewsSection } from "./index"

type ReviewsLoaderProps = {
  productId: string
  averageRating: number
  totalReviews: number
}

const ReviewsLoader = ({ productId, averageRating, totalReviews }: ReviewsLoaderProps) => {
  const { reviews } = useReviews(productId)
  
  const ratingDistribution = reviews.reduce((acc, review) => {
    acc[review.rating as keyof typeof acc] = (acc[review.rating as keyof typeof acc] || 0) + 1
    return acc
  }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

  return (
    <ReviewsSection
      reviews={reviews}
      averageRating={averageRating}
      totalReviews={reviews.length || totalReviews}
      ratingDistribution={ratingDistribution}
    />
  )
}

export default ReviewsLoader
