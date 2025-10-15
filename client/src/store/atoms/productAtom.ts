import { atom } from 'recoil';

export type Product = {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  lowStockThreshold: number;
  trackQuantity: boolean;
  
  category: {
    _id: string;
    name: string;
    slug: string;
    id: string;
  } | null;
  brand: {
    _id: string;
    name: string;
  } | null;
  tags: string[];
  
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
    _id: string;
    id: string;
  }>;
  videos: Array<{
    url: string;
    title: string;
    thumbnail: string;
    _id: string;
    id: string;
  }>;
  primaryImage: {
    url: string;
    alt?: string;
    isPrimary: boolean;
    _id: string;
    id: string;
  } | null;
  
  hasVariants: boolean;
  variants: unknown[];
  attributes: unknown[];
  
  shippingClass: string;
  freeShipping: boolean;
  shippingCost: number;
  
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  
  seo: {
    metaKeywords: string[];
    _id: string;
    slug: string;
  };
  
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  reviews: unknown[];
  
  totalSales: number;
  totalRevenue: number;
  viewCount: number;
  
  seller: string;
  sellerEarnings: number;
  commission: number;
  
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    unit: string;
  };
  weight: {
    value?: number;
    unit: string;
  };
  
  discountPercentage: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  __v: number;
  id: string;
};

export const productsAtom = atom<Product[]>({
  key: 'products',
  default: [],
});



