import axios from "axios";

const api = axios.create({
    baseURL: "https://e-commerce-ghmy.onrender.com",
    withCredentials: true,
});

// Auth APIs
export const loginUser = (data: {
    email: string;
    password: string;
}) => api.post("/auth/login", data);


export const signupUser = (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    storeName?: string;
    role?: string;
}) => api.post("/auth/register", data);

export const getProfile = () => api.get("/users/profile");

export const logoutUser = () => api.post("/auth/logout");

export const resetPassword = (data: { token: string; password: string }) => api.post("/auth/reset-password", data);

export const forgotPassword = (data: { email: string }) => api.post("/auth/forgot-password", data);

export const getProducts = () => api.get("/products");

// Wishlist APIs
export const getWishlist = () => api.get("/users/wishlist");
export const addToWishlist = (productId: string) => api.post("/users/wishlist", { productId });

export const removeFromWishlist = (productId: string) => api.delete(`/users/wishlist/${productId}`);

// Cart APIs
export const getCart = () => api.get("/cart");

export const getCartSummary = () => api.get("/cart/summary");

export const addToCart = (productId: string, quantity: number) => api.post("/cart/add", { productId, quantity });

export const updateCartItem = (itemId: string, quantity: number) => api.put(`/cart/item/${itemId}`, { quantity });

export const removeFromCart = (itemId: string) => api.delete(`/cart/item/${itemId}`);

export const clearCart = () => api.delete("/cart/clear");

//product apis
export const getProductById = (productId: string) => api.get(`/products/${productId}`);

// products by category implemented using recoil
// export const getProductsByCategory = (category: string) => api.get(`/products/category/${category}`);

// all Categories
export const getAllCategories = () => api.get("/categories");

//get brands
export const getAllBrands = () => api.get("/brands");

//search products -- this functionality performed by selector using recoil no need to do an extra api call
// export const searchProducts = (query: string) => api.get(`/products/search?query=${query}`);

//reviews apis
export const getReviewsByProduct = (productId: string) => api.get(`/reviews/product/${productId}`);

export const addReview = (data: { productId: string; rating: number; comment?: string }) => api.post("/reviews", data);

export const updateReview = (reviewId: string, data: { rating: number; comment?: string }) => api.put(`/reviews/${reviewId}`, data);

export const deleteReview = (reviewId: string) => api.delete(`/reviews/${reviewId}`);