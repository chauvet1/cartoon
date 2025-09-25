import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for managing keyboard navigation
 */
export function useKeyboardNavigation() {
  const focusableElements = useRef<HTMLElement[]>([]);
  const currentIndex = useRef(0);

  const updateFocusableElements = useCallback((container: HTMLElement) => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    focusableElements.current = Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (focusableElements.current.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        currentIndex.current = (currentIndex.current + 1) % focusableElements.current.length;
        focusableElements.current[currentIndex.current]?.focus();
        break;
      
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        currentIndex.current = currentIndex.current === 0 
          ? focusableElements.current.length - 1 
          : currentIndex.current - 1;
        focusableElements.current[currentIndex.current]?.focus();
        break;
      
      case 'Home':
        e.preventDefault();
        currentIndex.current = 0;
        focusableElements.current[0]?.focus();
        break;
      
      case 'End':
        e.preventDefault();
        currentIndex.current = focusableElements.current.length - 1;
        focusableElements.current[currentIndex.current]?.focus();
        break;
    }
  }, []);

  return {
    updateFocusableElements,
    handleKeyDown
  };
}

/**
 * Hook for managing focus trap in modals
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    const focusableElements = containerRef.current.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the previously focused element
      previousActiveElement.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for managing escape key handling
 */
export function useEscapeKey(onEscape: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape, isActive]);
}

/**
 * Hook for managing arrow key navigation in lists
 */
export function useArrowKeyNavigation(
  items: any[],
  onSelect: (index: number) => void,
  isActive: boolean = true
) {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  useEffect(() => {
    if (!isActive || items.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
        
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : items.length - 1
          );
          break;
        
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (selectedIndex >= 0) {
            onSelect(selectedIndex);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [items.length, selectedIndex, onSelect, isActive]);

  return selectedIndex;
}

/**
 * Component for keyboard navigation wrapper
 */
interface KeyboardNavigationProps {
  children: React.ReactNode;
  className?: string;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateFocusableElements, handleKeyDown } = useKeyboardNavigation();

  useEffect(() => {
    if (!containerRef.current) return;

    updateFocusableElements(containerRef.current);
    containerRef.current.addEventListener('keydown', handleKeyDown);

    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [updateFocusableElements, handleKeyDown]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

/**
 * Component for accessible dropdown with keyboard navigation
 */
interface AccessibleDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleDropdown: React.FC<AccessibleDropdownProps> = ({
  isOpen,
  onClose,
  trigger,
  children,
  className
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEscapeKey(onClose, isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => onClose()}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
      >
        {trigger}
      </button>
      
      {isOpen && (
        <div
          ref={dropdownRef}
          className={className}
          role="menu"
          aria-orientation="vertical"
        >
          <KeyboardNavigation>
            {children}
          </KeyboardNavigation>
        </div>
      )}
    </div>
  );
};

/**
 * Hook for managing screen reader announcements
 */
export function useScreenReaderAnnouncement() {
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceRef.current) return;

    announceRef.current.setAttribute('aria-live', priority);
    announceRef.current.textContent = message;

    // Clear the message after a short delay
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = '';
      }
    }, 1000);
  }, []);

  const ScreenReaderAnnouncer = () => (
    <div
      ref={announceRef}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    />
  );

  return { announce, ScreenReaderAnnouncer };
}

/**
 * Hook for managing focus management
 */
export function useFocusManagement() {
  const focusHistory = useRef<HTMLElement[]>([]);

  const pushFocus = useCallback((element: HTMLElement) => {
    focusHistory.current.push(element);
  }, []);

  const popFocus = useCallback(() => {
    const element = focusHistory.current.pop();
    element?.focus();
    return element;
  }, []);

  const clearFocusHistory = useCallback(() => {
    focusHistory.current = [];
  }, []);

  return {
    pushFocus,
    popFocus,
    clearFocusHistory
  };
}