import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { ErrorHandler, PaperbagError, ErrorType } from '../lib/errorHandling';
import { validateImageFile, compressImage, createThumbnail } from '../lib/imageUtils';
import { UseImageProcessingReturn, UseUserCreditsReturn, ImageProcessingEvent } from '../types';

/**
 * Custom hook for image processing logic
 */
export function useImageProcessing(): UseImageProcessingReturn {
  const { isSignedIn, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const errorHandler = ErrorHandler.getInstance();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveUploadedImage = useMutation(api.files.saveUploadedImage);
  const cartoonifyImage = useMutation(api.files.cartoonifyImage);

  const processImage = useCallback(async (file: File, style: string) => {
    if (!isSignedIn || !userId) {
      const error = new PaperbagError(ErrorType.AUTHENTICATION, 'Please sign in to process images');
      errorHandler.handleError(error);
      setError(errorHandler.getUserFriendlyMessage(errorHandler.handleError(error)));
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new PaperbagError(ErrorType.VALIDATION, validation.error!);
      }

      setProgress(10);

      // Create thumbnail for preview
      const thumbnail = await createThumbnail(file, 400);
      setResult(thumbnail);
      setProgress(25);

      // Compress image
      const compressedFile = await compressImage(file, 0.85);
      setProgress(40);

      // Upload to Convex
      const uploadUrl = await generateUploadUrl();
      setProgress(50);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': compressedFile.type },
        body: compressedFile,
      });

      if (!response.ok) {
        throw new PaperbagError(ErrorType.UPLOAD, `Upload failed: ${response.statusText}`);
      }

      const { storageId } = await response.json();
      setProgress(70);

      // Save image metadata
      await saveUploadedImage({ storageId, userId });
      setProgress(85);

      // Start cartoonification
      await cartoonifyImage({ storageId, style });
      setProgress(100);

    } catch (err) {
      const appError = errorHandler.handleError(err);
      setError(errorHandler.getUserFriendlyMessage(appError));
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, userId, generateUploadUrl, saveUploadedImage, cartoonifyImage, errorHandler]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    processImage,
    isLoading,
    progress,
    error,
    result,
    reset
  };
}

/**
 * Custom hook for user credits management
 */
export function useUserCredits(): UseUserCreditsReturn {
  const { isSignedIn, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const errorHandler = ErrorHandler.getInstance();
  const userCreditsStatus = useQuery(api.transactions.getUserCreditsStatus);
  const getImagePackCheckoutUrl = useMutation(api.transactions.getImagePackCheckoutUrl);

  const credits = userCreditsStatus?.remainingCredits || 0;

  const purchaseCredits = useCallback(async (priceId: string): Promise<string> => {
    if (!isSignedIn) {
      throw new PaperbagError(ErrorType.AUTHENTICATION, 'Please sign in to purchase credits');
    }

    setIsLoading(true);
    setError(null);

    try {
      const checkoutUrl = await getImagePackCheckoutUrl({ priceId });
      return checkoutUrl;
    } catch (err) {
      const appError = errorHandler.handleError(err);
      setError(errorHandler.getUserFriendlyMessage(appError));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getImagePackCheckoutUrl, errorHandler]);

  const refetch = useCallback(() => {
    // Convex queries automatically refetch, but we can trigger a manual refresh
    setError(null);
  }, []);

  return {
    credits,
    isLoading: isLoading || userCreditsStatus === undefined,
    error,
    refetch,
    purchaseCredits
  };
}

/**
 * Custom hook for image gallery management
 */
export function useImageGallery() {
  const { isSignedIn, userId } = useAuth();
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();
  
  const userImages = useQuery(
    api.files.getUserImages,
    isSignedIn && userId ? { userId, cursor, limit: 20 } : "skip"
  );

  const loadMore = useCallback(() => {
    if (userImages?.hasMore && userImages.nextCursor) {
      setCursor(userImages.nextCursor);
    }
  }, [userImages?.hasMore, userImages?.nextCursor]);

  const reset = useCallback(() => {
    setCursor(undefined);
    setHasMore(true);
  }, []);

  return {
    images: userImages?.images || [],
    hasMore: userImages?.hasMore || false,
    isLoading: userImages === undefined,
    loadMore,
    reset
  };
}

/**
 * Custom hook for file upload with drag and drop
 */
export function useFileUpload(
  onFileSelect: (file: File) => void,
  onError: (error: string) => void
) {
  const [isDragOver, setIsDragOver] = useState(false);
  const errorHandler = ErrorHandler.getInstance();

  const handleFile = useCallback((file: File) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      const error = new PaperbagError(ErrorType.VALIDATION, validation.error!);
      errorHandler.handleError(error);
      onError(errorHandler.getUserFriendlyMessage(errorHandler.handleError(error)));
      return;
    }
    onFileSelect(file);
  }, [onFileSelect, onError, errorHandler]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFile(file);
      } else {
        const error = new PaperbagError(ErrorType.VALIDATION, 'Please drop an image file');
        errorHandler.handleError(error);
        onError(errorHandler.getUserFriendlyMessage(errorHandler.handleError(error)));
      }
    }
  }, [handleFile, onError, errorHandler]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput
  };
}

/**
 * Custom hook for debounced search
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for local storage with error handling
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}