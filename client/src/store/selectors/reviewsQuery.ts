import { selectorFamily } from 'recoil'
import { getReviewsByProduct } from '@/services/api'
import { reviewsAtom } from '../atoms/reviewAtom'
import type { Review } from '../atoms/reviewAtom'

export const reviewsByProductQuery = selectorFamily<Review[], string>({
  key: 'reviewsByProductQuery',
  get: (productId: string) => async ({ get }) => {
    const cachedReviews = get(reviewsAtom)
    
    if (cachedReviews[productId]) {
      return cachedReviews[productId]
    }
    
    try {
      const response = await getReviewsByProduct(productId)
      return response.data.data?.reviews || []
    } catch (error) {
      console.error('Error fetching reviews:', error)
      return []
    }
  },
  set: (productId: string) => ({ set, get }, newValue) => {
    const currentReviews = get(reviewsAtom)
    set(reviewsAtom, {
      ...currentReviews,
      [productId]: newValue as Review[]
    })
  }
})
