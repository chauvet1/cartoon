/**
 * Application constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 60000, // 60 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  COMPRESSION_QUALITY: 0.85,
  THUMBNAIL_SIZE: 400,
} as const;

// Image Processing Configuration
export const IMAGE_CONFIG = {
  PROCESSING_TIMEOUT: 120000, // 2 minutes
  MAX_DIMENSION: 1024,
  DEFAULT_STYLE: 'simpsons',
  SUPPORTED_STYLES: [
    'simpsons',
    'studio-ghibli', 
    'family-guy',
    'disney',
    'anime',
    'comic-book',
    'south-park'
  ],
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 5000, // 5 seconds
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  PAGINATION_LIMIT: 20,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection issue. Please check your internet connection.',
  AUTH_REQUIRED: 'Please sign in to continue.',
  INSUFFICIENT_CREDITS: 'Please purchase more credits to continue.',
  FILE_TOO_LARGE: `File size must be less than ${formatFileSize(FILE_CONFIG.MAX_SIZE)}.`,
  INVALID_FILE_TYPE: `Please upload a valid image file (${FILE_CONFIG.ALLOWED_TYPES.join(', ')}).`,
  PROCESSING_FAILED: 'Image processing failed. Please try again.',
  UPLOAD_FAILED: 'Failed to upload image. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  TIMEOUT_ERROR: 'Operation timed out. Please try again.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  IMAGE_UPLOADED: 'Image uploaded successfully!',
  IMAGE_PROCESSED: 'Image processed successfully!',
  CREDITS_PURCHASED: 'Credits purchased successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  IMAGE_DOWNLOADED: 'Image downloaded successfully!',
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  UPLOADING: 'Uploading your image...',
  PROCESSING: 'Preparing image for transformation...',
  GENERATING: 'AI is creating your cartoon version...',
  COMPLETED: 'Processing complete!',
  PURCHASING: 'Processing your purchase...',
  LOADING_GALLERY: 'Loading your gallery...',
} as const;

// Cartoon Style Definitions
export const CARTOON_STYLES = [
  {
    id: 'simpsons',
    name: 'Simpsons',
    description: 'Iconic yellow cartoon style with spiky hair and overbite',
    preview: '/previews/simpsons.jpg',
    prompt: 'Transform into Simpsons style: yellow skin, large eyes, overbite, spiky hair, simple shapes'
  },
  {
    id: 'studio-ghibli',
    name: 'Studio Ghibli',
    description: 'Soft colors and detailed backgrounds with expressive eyes',
    preview: '/previews/ghibli.jpg',
    prompt: 'Transform into Studio Ghibli style: soft colors, detailed backgrounds, expressive eyes, flowing hair'
  },
  {
    id: 'family-guy',
    name: 'Family Guy',
    description: 'Simple shapes and bold outlines with exaggerated features',
    preview: '/previews/family-guy.jpg',
    prompt: 'Transform into Family Guy style: simple shapes, bold outlines, exaggerated features, flat colors'
  },
  {
    id: 'disney',
    name: 'Disney',
    description: 'Clean lines and vibrant colors with classic animation look',
    preview: '/previews/disney.jpg',
    prompt: 'Transform into Disney style: clean lines, vibrant colors, expressive features, classic animation look'
  },
  {
    id: 'anime',
    name: 'Anime',
    description: 'Large eyes and detailed hair with expressive features',
    preview: '/previews/anime.jpg',
    prompt: 'Transform into anime style: large eyes, detailed hair, expressive features, clean lineart'
  },
  {
    id: 'comic-book',
    name: 'Comic Book',
    description: 'Bold outlines and high contrast with dramatic shadows',
    preview: '/previews/comic-book.jpg',
    prompt: 'Transform into comic book style: bold outlines, high contrast, dramatic shadows, graphic style'
  },
  {
    id: 'south-park',
    name: 'South Park',
    description: 'Simple geometric shapes with flat colors and minimal details',
    preview: '/previews/south-park.jpg',
    prompt: 'Transform into South Park style: simple geometric shapes, flat colors, minimal details'
  }
] as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CREDITS: '/credits',
  SUCCESS: '/success',
  SETTINGS: '/settings',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  SELECTED_STYLE: 'paperbag_selected_style',
  USER_PREFERENCES: 'paperbag_user_preferences',
  RECENT_IMAGES: 'paperbag_recent_images',
  THEME: 'paperbag_theme',
} as const;

// Environment Variables
export const ENV_VARS = {
  CLERK_PUBLISHABLE_KEY: 'VITE_CLERK_PUBLISHABLE_KEY',
  CONVEX_URL: 'VITE_CONVEX_URL',
  POLAR_ACCESS_TOKEN: 'POLAR_ACCESS_TOKEN',
  POLAR_ORGANIZATION_ID: 'POLAR_ORGANIZATION_ID',
  POLAR_WEBHOOK_SECRET: 'POLAR_WEBHOOK_SECRET',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  FRONTEND_URL: 'FRONTEND_URL',
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_ANALYTICS: process.env.NODE_ENV === 'production',
  ENABLE_ERROR_REPORTING: process.env.NODE_ENV === 'production',
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'production',
  ENABLE_BETA_FEATURES: process.env.NODE_ENV === 'development',
} as const;

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  NAME_MAX_LENGTH: 50,
} as const;

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;