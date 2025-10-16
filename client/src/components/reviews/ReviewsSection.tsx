import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReviewItem from "./ReviewItem"
import RatingSummary from "./RatingSummary"
import type { Review as ReviewType } from "@/store/atoms/reviewAtom"

type ReviewItemType = {
  id: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  date: string
  likes: number
  dislikes: number
  images?: string[]
  videos?: string[]
}

type ReviewsSectionProps = {
  reviews: ReviewType[]
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

const ReviewsSection = ({ reviews, averageRating, totalReviews, ratingDistribution }: ReviewsSectionProps) => {
  const [sortBy, setSortBy] = useState("newest")
  
  // Transform API reviews to ReviewItem format
  const transformedReviews: ReviewItemType[] = reviews.map(review => ({
    id: review._id,
    userName: review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonymous',
    userAvatar: review.user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.firstName}` : undefined,
    rating: review.rating,
    comment: review.comment || '',
    date: formatDate(review.createdAt),
    likes: 0,
    dislikes: 0,
    images: review.images?.map(img => img.url),
    videos: review.videos?.map(vid => vid.url)
  }))
  
  const [sortedReviews, setSortedReviews] = useState(transformedReviews)

  const handleSortChange = (value: string) => {
    setSortBy(value)
    let sorted = [...transformedReviews]
    
    if (value === "oldest") {
      sorted.reverse()
    } else if (value === "highest") {
      sorted.sort((a, b) => b.rating - a.rating)
    } else if (value === "lowest") {
      sorted.sort((a, b) => a.rating - b.rating)
    }
    
    setSortedReviews(sorted)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 px-4">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground/90">Review List</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Showing 1–{Math.min(sortedReviews.length, totalReviews)} of {totalReviews} results
            </p>
          </div>
          
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] border-border bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <ReviewItem key={review.id} {...review} />
          ))}
        </div>
      </div>

      <div className="lg:col-span-1">
        <RatingSummary
          averageRating={averageRating}
          totalReviews={totalReviews}
          ratingDistribution={ratingDistribution}
        />
      </div>
    </div>
  )
}

export default ReviewsSection
