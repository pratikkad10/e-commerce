import { Card } from "@/components/ui/card"
import RatingStars from "./RatingStars"

type RatingSummaryProps = {
  averageRating: number
  totalReviews: number
  ratingDistribution?: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

const RatingSummary = ({ averageRating, totalReviews, ratingDistribution }: RatingSummaryProps) => {
  return (
    <Card className="p-6 rounded-2xl border border-border/50 bg-card/50 sticky top-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground/90 mb-2">Rating Summary</h3>
        <div className="text-5xl font-bold text-primary mb-2">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex justify-center mb-2">
          <RatingStars rating={averageRating} size="lg" />
        </div>
        <p className="text-sm text-muted-foreground">({totalReviews} Reviews)</p>
      </div>

      {ratingDistribution && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star as keyof typeof ratingDistribution] || 0
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
            
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-foreground/70">{star}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right text-muted-foreground">{count}</span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default RatingSummary
