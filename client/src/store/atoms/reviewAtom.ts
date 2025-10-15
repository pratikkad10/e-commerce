import { atom } from 'recoil'

export type Review = {
  _id: string
  product: string
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  rating: number
  comment?: string
  images?: Array<{ url: string; alt?: string; _id: string }>
  videos?: Array<{ url: string; _id: string }>
  createdAt: string
  updatedAt: string
}

type ReviewsByProduct = {
  [productId: string]: Review[]
}

export const reviewsAtom = atom<ReviewsByProduct>({
  key: 'reviews',
  default: {},
})
