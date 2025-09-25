import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

/**
 * Mobile-optimized touch interactions
 */
export function useTouchGestures() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    return {
      isLeftSwipe,
      isRightSwipe,
      isUpSwipe,
      isDownSwipe,
      distanceX,
      distanceY
    };
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}

/**
 * Mobile-optimized image gallery with swipe support
 */
interface MobileImageGalleryProps {
  images: string[];
  onImageChange?: (index: number) => void;
  className?: string;
}

export const MobileImageGallery: React.FC<MobileImageGalleryProps> = ({
  images,
  onImageChange,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { onTouchStart, onTouchMove, onTouchEnd } = useTouchGestures();

  const handleSwipe = () => {
    const swipeResult = onTouchEnd();
    if (!swipeResult) return;

    if (swipeResult.isLeftSwipe && currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
    } else if (swipeResult.isRightSwipe && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handleSwipe}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            )}
            onClick={() => {
              setCurrentIndex(index);
              onImageChange?.(index);
            }}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Mobile-optimized file upload with drag and drop
 */
interface MobileFileUploadProps {
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const MobileFileUpload: React.FC<MobileFileUploadProps> = ({
  onFileSelect,
  onError,
  disabled = false,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    onFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
        isDragOver ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-gray-300',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--color-primary)]',
        className
      )}
      onClick={handleClick}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
          handleFile(file);
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="space-y-4">
        <div className="mx-auto w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <div>
          <p className="text-lg font-medium text-gray-900">
            {isDragOver ? 'Drop your image here' : 'Upload an image'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop or click to select
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile-optimized bottom sheet
 */
interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        ref={sheetRef}
        className={cn(
          'relative bg-white rounded-t-xl w-full max-h-[80vh] transform transition-transform duration-300',
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {title && (
          <div className="px-4 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile-optimized floating action button
 */
interface MobileFABProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

export const MobileFAB: React.FC<MobileFABProps> = ({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  className
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed z-40 w-14 h-14 bg-[var(--color-primary)] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2',
        positionClasses[position],
        className
      )}
      aria-label={label}
    >
      {icon}
    </button>
  );
};

/**
 * Hook for detecting mobile devices
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}

/**
 * Mobile-optimized responsive container
 */
interface MobileResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileResponsiveContainer: React.FC<MobileResponsiveContainerProps> = ({
  children,
  className
}) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        'w-full',
        isMobile ? 'px-4' : 'px-6 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};