import { useRecoilValue, useSetRecoilState } from 'recoil'
import { reviewsByProductQuery } from '@/store/selectors/reviewsQuery'
import { reviewsAtom, type Review } from '@/store/atoms/reviewAtom'
import { addReview as addReviewAPI, updateReview as updateReviewAPI, deleteReview as deleteReviewAPI } from '@/services/api'

export const useReviews = (productId: string) => {
  const reviews = useRecoilValue(reviewsByProductQuery(productId))
  const setReviewsAtom = useSetRecoilState(reviewsAtom)

  const addReview = async (rating: number, comment?: string) => {
    try {
      const response = await addReviewAPI({ productId, rating, comment })
      const newReview = response.data.review
      
      setReviewsAtom((prev) => ({
        ...prev,
        [productId]: [...(prev[productId] || []), newReview]
      }))
      
      return newReview
    } catch (error) {
      console.error('Error adding review:', error)
      throw error
    }
  }

  const updateReview = async (reviewId: string, rating: number, comment?: string) => {
    try {
      const response = await updateReviewAPI(reviewId, { rating, comment })
      const updatedReview = response.data.review
      
      setReviewsAtom((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).map((r) =>
          r._id === reviewId ? updatedReview : r
        )
      }))
      
      return updatedReview
    } catch (error) {
      console.error('Error updating review:', error)
      throw error
    }
  }

  const deleteReview = async (reviewId: string) => {
    try {
      await deleteReviewAPI(reviewId)
      
      // Remove review from atom
      setReviewsAtom((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).filter((r) => r._id !== reviewId)
      }))
    } catch (error) {
      console.error('Error deleting review:', error)
      throw error
    }
  }

  return {
    reviews,
    addReview,
    updateReview,
    deleteReview
  }
}
