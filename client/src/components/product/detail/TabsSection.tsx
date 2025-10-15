import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import ReviewsLoader from "@/components/reviews/ReviewsLoader"

type TabsSectionProps = {
  description: string
  productId: string
  averageRating: number
  totalReviews: number
  onTabChange?: (tab: 'details' | 'reviews' | 'discussion') => void
}

const TabsSection = ({ description, productId, averageRating, totalReviews, onTabChange }: TabsSectionProps) => {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'discussion'>('details')

  const handleTabChange = (tab: 'details' | 'reviews' | 'discussion') => {
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  return (
    <div className="mt-8 sm:mt-12">
      <div className="flex gap-1 sm:gap-2 border-b border-border overflow-x-auto">
        {['details', 'reviews', 'discussion'].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            size="sm"
            className={`rounded-none border-b-2 text-xs sm:text-sm whitespace-nowrap ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            onClick={() => handleTabChange(tab as typeof activeTab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      <div className="py-4 sm:py-6">
        {activeTab === 'details' && (
          <div className="prose max-w-none">
            <p className="text-muted-foreground">{description}</p>
          </div>
        )}

        {activeTab === 'discussion' && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-muted-foreground">No discussions yet. Be the first to start one!</p>
          </div>
        )}
      </div>

      {activeTab === 'reviews' && (
        <Suspense fallback={
          <div className="flex items-center justify-center py-12 gap-2">
            <Spinner className="h-6 w-6 text-primary" />
            <span className="text-muted-foreground">Loading reviews...</span>
          </div>
        }>
          <ReviewsLoader
            productId={productId}
            averageRating={averageRating}
            totalReviews={totalReviews}
          />
        </Suspense>
      )}
    </div>
  )
}

export default TabsSection
