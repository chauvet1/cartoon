import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibleButton } from '../components/ui/accessible';
import { AccessibleInput } from '../components/ui/accessible';
import { LoadingSpinner } from '../components/ui/loading';
import { ProgressTracker } from '../components/ui/loading';
import { validateImageFile, compressImage, createThumbnail } from '../lib/imageUtils';
import { ErrorHandler, PaperbagError, ErrorType } from '../lib/errorHandling';
import { formatFileSize, debounce, throttle } from '../lib/utils';
import { createMockImageFile, createMockFile } from './utils';

describe('AccessibleButton', () => {
  it('renders with correct accessibility attributes', () => {
    render(<AccessibleButton>Test Button</AccessibleButton>);
    
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('shows loading state correctly', () => {
    render(<AccessibleButton loading>Loading Button</AccessibleButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Loading Button')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<AccessibleButton onClick={handleClick}>Click Me</AccessibleButton>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icons', () => {
    const leftIcon = <span data-testid="left-icon">←</span>;
    const rightIcon = <span data-testid="right-icon">→</span>;
    
    render(
      <AccessibleButton leftIcon={leftIcon} rightIcon={rightIcon}>
        With Icons
      </AccessibleButton>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});

describe('AccessibleInput', () => {
  it('renders with proper labeling', () => {
    render(<AccessibleInput label="Test Input" />);
    
    const input = screen.getByLabelText('Test Input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('shows error message', () => {
    render(<AccessibleInput label="Test Input" error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(<AccessibleInput label="Test Input" helperText="Enter your name" />);
    
    expect(screen.getByText('Enter your name')).toBeInTheDocument();
  });

  it('handles input changes', async () => {
    const handleChange = vi.fn();
    render(<AccessibleInput label="Test Input" onChange={handleChange} />);
    
    const input = screen.getByLabelText('Test Input');
    await userEvent.type(input, 'test value');
    
    expect(handleChange).toHaveBeenCalled();
  });
});

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Processing..." />);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('renders different variants', () => {
    const { rerender } = render(<LoadingSpinner variant="dots" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    rerender(<LoadingSpinner variant="pulse" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('ProgressTracker', () => {
  it('renders progress correctly', () => {
    render(<ProgressTracker current={50} total={100} />);
    
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<ProgressTracker current={25} total={100} message="Uploading..." />);
    
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('hides percentage when showPercentage is false', () => {
    render(<ProgressTracker current={75} total={100} showPercentage={false} />);
    
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });
});

describe('Image Utils', () => {
  describe('validateImageFile', () => {
    it('validates valid image files', () => {
      const validFile = createMockImageFile('test.jpg', 1024);
      const result = validateImageFile(validFile);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects files that are too large', () => {
      const largeFile = createMockImageFile('large.jpg', 11 * 1024 * 1024);
      const result = validateImageFile(largeFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size must be less than');
    });

    it('rejects invalid file types', () => {
      const invalidFile = createMockFile('test.txt', 'text/plain', 1024);
      const result = validateImageFile(invalidFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Please upload a valid image file');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('handles decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1536 * 1024)).toBe('1.5 MB');
    });
  });
});

describe('Error Handling', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    errorHandler.clearErrorLog();
  });

  it('handles PaperbagError correctly', () => {
    const error = new PaperbagError(ErrorType.VALIDATION, 'Invalid input');
    const result = errorHandler.handleError(error);
    
    expect(result.type).toBe(ErrorType.VALIDATION);
    expect(result.message).toBe('Invalid input');
    expect(result.retryable).toBe(false);
  });

  it('categorizes generic errors', () => {
    const error = new Error('Network connection failed');
    const result = errorHandler.handleError(error);
    
    expect(result.type).toBe(ErrorType.NETWORK);
    expect(result.retryable).toBe(true);
  });

  it('provides user-friendly error messages', () => {
    const networkError = errorHandler.handleError(new Error('Network error'));
    const authError = errorHandler.handleError(new Error('Unauthorized'));
    const validationError = errorHandler.handleError(new Error('Invalid input'));
    
    expect(errorHandler.getUserFriendlyMessage(networkError)).toContain('Network connection');
    expect(errorHandler.getUserFriendlyMessage(authError)).toContain('sign in');
    expect(errorHandler.getUserFriendlyMessage(validationError)).toContain('check your input');
  });
});

describe('Utility Functions', () => {
  describe('debounce', () => {
    it('debounces function calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(mockFn).not.toHaveBeenCalled();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('throttles function calls', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});