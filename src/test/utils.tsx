import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { ToastProvider } from '../components/ui/toast';

// Mock Convex client
const mockConvexClient = new ConvexReactClient('https://mock.convex.cloud');

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider publishableKey="pk_test_mock">
      <ConvexProviderWithClerk client={mockConvexClient} useAuth={() => ({ isSignedIn: true, userId: 'mock-user-id' })}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Test utilities
export const createMockFile = (name: string, type: string, size: number): File => {
  const file = new File(['mock file content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

export const createMockImageFile = (name: string = 'test-image.jpg', size: number = 1024): File => {
  return createMockFile(name, 'image/jpeg', size);
};

export const waitForImageLoad = (img: HTMLImageElement): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (img.complete) {
      resolve();
    } else {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image failed to load'));
    }
  });
};

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.ResizeObserver = mockResizeObserver;
};

export const mockFetch = (response: any, status: number = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
    blob: () => Promise.resolve(new Blob([JSON.stringify(response)])),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
  });
};

export const mockFileReader = () => {
  const mockFileReader = {
    readAsDataURL: vi.fn(),
    readAsText: vi.fn(),
    readAsArrayBuffer: vi.fn(),
    result: null,
    onload: null,
    onerror: null,
    onabort: null,
    readyState: 0,
    error: null,
    abort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  };

  global.FileReader = vi.fn(() => mockFileReader) as any;
  return mockFileReader;
};

export const createMockUser = (overrides: any = {}) => ({
  id: 'mock-user-id',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  username: 'testuser',
  ...overrides
});

export const createMockImageRecord = (overrides: any = {}) => ({
  _id: 'mock-image-id',
  userId: 'mock-user-id',
  originalStorageId: 'mock-storage-id',
  originalImageUrl: 'https://example.com/image.jpg',
  cartoonStorageId: 'mock-cartoon-storage-id',
  cartoonImageUrl: 'https://example.com/cartoon.jpg',
  status: 'completed',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides
});

export const createMockCreditsStatus = (overrides: any = {}) => ({
  hasActiveSubscription: true,
  remainingCredits: 10,
  ...overrides
});

// Mock console methods to avoid noise in tests
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });
  
  afterEach(() => {
    Object.assign(console, originalConsole);
  });
};

// Helper to simulate user interactions
export const simulateFileUpload = async (input: HTMLInputElement, file: File) => {
  const event = new Event('change', { bubbles: true });
  Object.defineProperty(event, 'target', {
    value: { files: [file] },
    writable: false
  });
  input.dispatchEvent(event);
};

export const simulateDragAndDrop = async (element: HTMLElement, files: File[]) => {
  const dragOverEvent = new DragEvent('dragover', { bubbles: true });
  const dropEvent = new DragEvent('drop', { bubbles: true });
  
  Object.defineProperty(dropEvent, 'dataTransfer', {
    value: {
      files: files,
      items: files.map(file => ({ kind: 'file', type: file.type }))
    },
    writable: false
  });
  
  element.dispatchEvent(dragOverEvent);
  element.dispatchEvent(dropEvent);
};