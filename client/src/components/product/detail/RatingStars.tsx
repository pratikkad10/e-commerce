import { Star } from "lucide-react"

type RatingStarsProps = {
  rating: number
  totalReviews?: number
}

const RatingStars = ({ rating, totalReviews }: RatingStarsProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {rating.toFixed(1)} {totalReviews && `(${totalReviews} reviews)`}
      </span>
    </div>
  )
}

export default RatingStars
