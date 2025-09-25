/**
 * Type definitions and interfaces for Paperbag application
 */

// User related types
export interface User {
  _id: string;
  name: string;
  email: string;
  userId: string;
  createdAt: number;
  imageCredits?: number;
}

export interface UserCreditsStatus {
  hasActiveSubscription: boolean;
  remainingCredits: number;
}

// Image related types
export interface ImageRecord {
  _id: string;
  userId: string;
  originalStorageId: string;
  originalImageUrl?: string;
  cartoonStorageId?: string;
  cartoonImageUrl?: string;
  status: ImageStatus;
  createdAt: number;
  updatedAt: number;
}

export type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'error';

export interface ImageUploadResult {
  storageId: string;
  imageId: string;
}

// Cartoon style types
export interface CartoonStyle {
  id: string;
  name: string;
  description?: string;
  preview?: string;
}

export const CARTOON_STYLES: CartoonStyle[] = [
  { id: "simpsons", name: "Simpsons", description: "Iconic yellow cartoon style" },
  { id: "studio-ghibli", name: "Studio Ghibli", description: "Soft colors and detailed backgrounds" },
  { id: "family-guy", name: "Family Guy", description: "Simple shapes and bold outlines" },
  { id: "disney", name: "Disney", description: "Clean lines and vibrant colors" },
  { id: "anime", name: "Anime", description: "Large eyes and detailed features" },
  { id: "comic-book", name: "Comic Book", description: "Bold outlines and high contrast" },
  { id: "south-park", name: "South Park", description: "Simple geometric shapes" }
];

// Transaction types
export interface Transaction {
  _id: string;
  userId: string;
  polarId: string;
  polarPriceId: string;
  amount: number;
  currency: string;
  status: string;
  purchaseType: string;
  quantity: number;
  createdAt: string;
  modifiedAt: string;
}

export interface ProductPrice {
  id: string;
  amount: number;
  currency: string;
  interval: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  isRecurring: boolean;
  prices: ProductPrice[];
}

export interface PlansResponse {
  items: Product[];
  pagination: any;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
}

// Component prop types
export interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  acceptedTypes?: string[];
  maxSize?: number;
}

export interface CartoonPreviewProps {
  originalImage: string;
  cartoonImage?: string;
  style: string;
  isLoading: boolean;
  onRetry?: () => void;
}

export interface CreditsDisplayProps {
  credits: number;
  onPurchase: () => void;
  isLoading?: boolean;
}

// Form types
export interface ImageUploadForm {
  file: File | null;
  style: string;
  compression: number;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  type: string;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  retryable: boolean;
}

// Configuration types
export interface AppConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  defaultCompressionQuality: number;
  processingTimeout: number;
  retryAttempts: number;
}

export const APP_CONFIG: AppConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  defaultCompressionQuality: 0.85,
  processingTimeout: 60000, // 60 seconds
  retryAttempts: 3
};

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event types
export interface ImageProcessingEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  stage?: 'upload' | 'process' | 'generate';
  progress?: number;
  message?: string;
  error?: string;
}

// Hook return types
export interface UseImageProcessingReturn {
  processImage: (file: File, style: string) => Promise<void>;
  isLoading: boolean;
  progress: number;
  error: string | null;
  result: string | null;
  reset: () => void;
}

export interface UseUserCreditsReturn {
  credits: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  purchaseCredits: (priceId: string) => Promise<string>;
}

// Constants
export const IMAGE_PROCESSING_STAGES = {
  UPLOAD: 'uploading',
  PROCESS: 'processing', 
  GENERATE: 'generating',
  COMPLETE: 'completed'
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection issue. Please check your internet connection.',
  AUTH_REQUIRED: 'Please sign in to continue.',
  INSUFFICIENT_CREDITS: 'Please purchase more credits to continue.',
  FILE_TOO_LARGE: 'File size must be less than 10MB.',
  INVALID_FILE_TYPE: 'Please upload a valid image file (JPEG, PNG, or WebP).',
  PROCESSING_FAILED: 'Image processing failed. Please try again.',
  UPLOAD_FAILED: 'Failed to upload image. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
} as const;