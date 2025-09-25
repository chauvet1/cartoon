import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  error?: string;
  stage?: 'upload' | 'process' | 'generate' | 'complete';
}

export interface ProgressTrackerProps {
  current: number;
  total: number;
  message?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  current,
  total,
  message,
  showPercentage = true,
  size = 'md'
}) => {
  const percentage = Math.round((current / total) * 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {message && (
        <p className="text-sm text-gray-600 mb-2 text-center">{message}</p>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full', sizeClasses[size])}>
        <div
          className={cn(
            'bg-[var(--color-primary)] rounded-full transition-all duration-300 ease-out',
            sizeClasses[size]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-gray-500 mt-1 text-center">{percentage}%</p>
      )}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}> = ({ size = 'md', message, className = '', variant = 'spinner' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-[var(--color-primary)] rounded-full animate-pulse',
                  size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div
            className={cn(
              'bg-[var(--color-primary)] rounded-full animate-pulse',
              sizeClasses[size]
            )}
          />
        );
      
      default:
        return (
          <Loader2 className={cn('animate-spin text-[var(--color-primary)]', sizeClasses[size])} />
        );
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      {renderSpinner()}
      {message && (
        <p className="text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
};

export const ImageProcessingLoader: React.FC<{
  stage: 'uploading' | 'processing' | 'generating' | 'completed';
  progress?: number;
  error?: string;
  onRetry?: () => void;
}> = ({ stage, progress, error, onRetry }) => {
  const stageMessages = {
    uploading: 'Uploading your image...',
    processing: 'Preparing image for transformation...',
    generating: 'AI is creating your cartoon version...',
    completed: 'Processing complete!'
  };

  const stageIcons = {
    uploading: <Clock className="h-6 w-6 text-blue-600" />,
    processing: <Loader2 className="h-6 w-6 text-yellow-600 animate-spin" />,
    generating: <Loader2 className="h-6 w-6 text-[var(--color-primary)] animate-spin" />,
    completed: <CheckCircle className="h-6 w-6 text-green-600" />
  };

  const stageProgress = {
    uploading: 25,
    processing: 50,
    generating: 75,
    completed: 100
  };

  const currentProgress = progress || stageProgress[stage];

  if (error) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Processing Failed
          </h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <div 
          className="absolute top-0 left-0 w-16 h-16 border-4 border-[var(--color-primary)] rounded-full border-t-transparent animate-spin"
          style={{ 
            animationDuration: '1s',
            transform: `rotate(${(currentProgress / 100) * 360}deg)`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {stageIcons[stage]}
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {stageMessages[stage]}
        </h3>
        <ProgressTracker 
          current={currentProgress} 
          total={100} 
          showPercentage={true}
        />
      </div>

      {stage === 'generating' && (
        <div className="text-xs text-gray-500 text-center max-w-xs">
          This usually takes 30-60 seconds. You can safely navigate away and come back later.
        </div>
      )}
    </div>
  );
};

export const SkeletonLoader: React.FC<{
  className?: string;
  lines?: number;
  width?: string | number;
  height?: string | number;
}> = ({ className, lines = 1, width = '100%', height = '1rem' }) => {
  if (lines === 1) {
    return (
      <div
        className={cn('animate-pulse bg-gray-200 rounded', className)}
        style={{ width, height }}
      />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-gray-200 rounded h-4"
          style={{ 
            width: i === lines - 1 ? '75%' : '100%',
            height 
          }}
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-lg p-6 shadow-sm', className)}>
      <div className="space-y-4">
        <SkeletonLoader height="2rem" width="60%" />
        <SkeletonLoader lines={3} />
        <div className="flex space-x-2">
          <SkeletonLoader height="2rem" width="80px" />
          <SkeletonLoader height="2rem" width="100px" />
        </div>
      </div>
    </div>
  );
};

export const ImageSkeleton: React.FC<{
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}> = ({ className, aspectRatio = 'square' }) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[4/3]'
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded-lg',
        aspectClasses[aspectRatio],
        className
      )}
    />
  );
};

export const useLoadingState = (initialState: LoadingState = { isLoading: false }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>(initialState);

  const setLoading = (isLoading: boolean, message?: string, stage?: LoadingState['stage']) => {
    setLoadingState({ isLoading, message, stage });
  };

  const setProgress = (progress: number, message?: string, stage?: LoadingState['stage']) => {
    setLoadingState(prev => ({ ...prev, progress, message, stage }));
  };

  const setError = (error: string) => {
    setLoadingState({ isLoading: false, error });
  };

  const clearError = () => {
    setLoadingState(prev => ({ ...prev, error: undefined }));
  };

  const reset = () => {
    setLoadingState({ isLoading: false });
  };

  return {
    loadingState,
    setLoading,
    setProgress,
    setError,
    clearError,
    reset
  };
};

export const RetryButton: React.FC<{
  onRetry: () => void;
  isLoading?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}> = ({ onRetry, isLoading = false, className = '', variant = 'primary' }) => {
  const variantClasses = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
  };

  return (
    <button
      onClick={onRetry}
      disabled={isLoading}
      className={cn(
        'px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantClasses[variant],
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Retrying...</span>
        </div>
      ) : (
        'Try Again'
      )}
    </button>
  );
};