import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import RatingStars from "./RatingStars"

type ReviewItemProps = {
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

const ReviewItem = ({ id, userName, userAvatar, rating, comment, date, likes, dislikes, images, videos }: ReviewItemProps) => {
  const [likeCount, setLikeCount] = useState(likes)
  const [dislikeCount, setDislikeCount] = useState(dislikes)
  const [userAction, setUserAction] = useState<"like" | "dislike" | null>(null)

  const handleLike = () => {
    if (userAction === "like") {
      setLikeCount(likeCount - 1)
      setUserAction(null)
    } else {
      setLikeCount(likeCount + 1)
      if (userAction === "dislike") setDislikeCount(dislikeCount - 1)
      setUserAction("like")
    }
  }

  const handleDislike = () => {
    if (userAction === "dislike") {
      setDislikeCount(dislikeCount - 1)
      setUserAction(null)
    } else {
      setDislikeCount(dislikeCount + 1)
      if (userAction === "like") setLikeCount(likeCount - 1)
      setUserAction("dislike")
    }
  }

  return (
    <Card className="p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
      <div className="flex gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-muted text-foreground font-semibold">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-foreground/90">{userName}</h4>
              <p className="text-xs text-muted-foreground">{date}</p>
            </div>
            <RatingStars rating={rating} size="sm" />
          </div>

          <p className="text-sm text-foreground/90 mb-4 leading-relaxed">{comment}</p>

          {images && images.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Review ${idx + 1}`}
                  className="h-24 w-24 object-cover rounded-lg border border-border flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {videos && videos.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {videos.map((video, idx) => (
                <video
                  key={idx}
                  src={video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="h-32 w-48 rounded-lg border border-border flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm transition-colors ${
                userAction === "like" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={handleDislike}
              className={`flex items-center gap-1 text-sm transition-colors ${
                userAction === "dislike" ? "text-destructive" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{dislikeCount}</span>
            </button>
            <button className="text-sm text-primary hover:underline ml-auto">Reply</button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ReviewItem
