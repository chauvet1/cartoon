import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartoonHero } from '../components/cartoon-hero';
import { useImageProcessing } from '../hooks';
import { useUserCredits } from '../hooks';
import { createMockImageFile, mockFetch, mockFileReader } from './utils';

// Mock the hooks
vi.mock('../hooks', () => ({
  useImageProcessing: vi.fn(),
  useUserCredits: vi.fn(),
  useFileUpload: vi.fn()
}));

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => vi.fn()),
  useQuery: vi.fn(() => ({ remainingCredits: 10 })),
  useAction: vi.fn(() => vi.fn())
}));

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isSignedIn: true, userId: 'test-user-id' }),
  useUser: () => ({ user: { fullName: 'Test User' } }),
  SignInButton: ({ children }: any) => children,
  SignUpButton: ({ children }: any) => children
}));

describe('CartoonHero Integration Tests', () => {
  const mockProcessImage = vi.fn();
  const mockPurchaseCredits = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useImageProcessing as any).mockReturnValue({
      processImage: mockProcessImage,
      isLoading: false,
      progress: 0,
      error: null,
      result: null,
      reset: vi.fn()
    });

    (useUserCredits as any).mockReturnValue({
      credits: 10,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      purchaseCredits: mockPurchaseCredits
    });

    mockFetch({ storageId: 'mock-storage-id' });
    mockFileReader();
  });

  it('renders the main interface correctly', () => {
    render(<CartoonHero />);
    
    expect(screen.getByText('Bag yourself a cartoon version in seconds.')).toBeInTheDocument();
    expect(screen.getByText('Transform your photos instantly')).toBeInTheDocument();
    expect(screen.getByText('Drop your photo')).toBeInTheDocument();
  });

  it('handles file upload flow', async () => {
    const user = userEvent.setup();
    render(<CartoonHero />);
    
    const fileInput = screen.getByRole('button', { name: /drop your photo/i });
    const testFile = createMockImageFile('test.jpg', 1024);
    
    // Mock file input change
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    Object.defineProperty(input, 'files', {
      value: [testFile],
      writable: false
    });
    
    // Simulate file selection
    await user.upload(input, testFile);
    
    // Verify the upload process would be triggered
    expect(mockProcessImage).toHaveBeenCalledWith(testFile, 'simpsons');
  });

  it('shows loading state during processing', () => {
    (useImageProcessing as any).mockReturnValue({
      processImage: mockProcessImage,
      isLoading: true,
      progress: 50,
      error: null,
      result: null,
      reset: vi.fn()
    });

    render(<CartoonHero />);
    
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('displays error messages', () => {
    (useImageProcessing as any).mockReturnValue({
      processImage: mockProcessImage,
      isLoading: false,
      progress: 0,
      error: 'Processing failed',
      result: null,
      reset: vi.fn()
    });

    render(<CartoonHero />);
    
    expect(screen.getByText('Processing failed')).toBeInTheDocument();
  });

  it('shows result when processing completes', () => {
    (useImageProcessing as any).mockReturnValue({
      processImage: mockProcessImage,
      isLoading: false,
      progress: 100,
      error: null,
      result: 'data:image/jpeg;base64,mock-result',
      reset: vi.fn()
    });

    render(<CartoonHero />);
    
    const resultImage = screen.getByAltText('Cartoon');
    expect(resultImage).toBeInTheDocument();
    expect(resultImage).toHaveAttribute('src', 'data:image/jpeg;base64,mock-result');
  });

  it('handles style selection', async () => {
    const user = userEvent.setup();
    render(<CartoonHero />);
    
    const styleSelect = screen.getByRole('combobox');
    await user.click(styleSelect);
    
    const animeOption = screen.getByText('Anime');
    await user.click(animeOption);
    
    expect(styleSelect).toHaveValue('anime');
  });

  it('shows credit purchase when credits are low', () => {
    (useUserCredits as any).mockReturnValue({
      credits: 0,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      purchaseCredits: mockPurchaseCredits
    });

    render(<CartoonHero />);
    
    expect(screen.getByText('Please purchase more credits to continue')).toBeInTheDocument();
  });

  it('handles credit purchase flow', async () => {
    const user = userEvent.setup();
    mockPurchaseCredits.mockResolvedValue('https://checkout.polar.sh/mock');
    
    (useUserCredits as any).mockReturnValue({
      credits: 0,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      purchaseCredits: mockPurchaseCredits
    });

    render(<CartoonHero />);
    
    const purchaseButton = screen.getByText('Purchase Credits');
    await user.click(purchaseButton);
    
    expect(mockPurchaseCredits).toHaveBeenCalled();
  });

  it('validates file before processing', async () => {
    const user = userEvent.setup();
    render(<CartoonHero />);
    
    const invalidFile = createMockFile('test.txt', 'text/plain', 1024);
    
    const fileInput = screen.getByRole('button', { name: /drop your photo/i });
    
    // Simulate invalid file upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    Object.defineProperty(input, 'files', {
      value: [invalidFile],
      writable: false
    });
    
    await user.upload(input, invalidFile);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Please upload a valid image file/)).toBeInTheDocument();
    });
  });

  it('handles drag and drop interactions', async () => {
    const user = userEvent.setup();
    render(<CartoonHero />);
    
    const dropZone = screen.getByRole('button', { name: /drop your photo/i });
    const testFile = createMockImageFile('test.jpg', 1024);
    
    // Simulate drag over
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('bg-[var(--color-primary)]/5');
    
    // Simulate drop
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [testFile]
      }
    });
    
    expect(mockProcessImage).toHaveBeenCalledWith(testFile, 'simpsons');
  });

  it('shows processing stages correctly', () => {
    (useImageProcessing as any).mockReturnValue({
      processImage: mockProcessImage,
      isLoading: true,
      progress: 75,
      error: null,
      result: null,
      reset: vi.fn(),
      stage: 'generating'
    });

    render(<CartoonHero />);
    
    expect(screen.getByText('AI is creating your cartoon version...')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('handles retry functionality', async () => {
    const user = userEvent.setup();
    const mockReset = vi.fn();
    
    (useImageProcessing as any).mockReturnValue({
      processImage: mockProcessImage,
      isLoading: false,
      progress: 0,
      error: 'Processing failed',
      result: null,
      reset: mockReset
    });

    render(<CartoonHero />);
    
    const retryButton = screen.getByText('Try Again');
    await user.click(retryButton);
    
    expect(mockReset).toHaveBeenCalled();
  });
});