describe('Paperbag E2E Tests', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('/');
    
    // Mock external APIs
    cy.intercept('POST', '**/api/storage/upload', {
      statusCode: 200,
      body: { storageId: 'mock-storage-id' }
    }).as('uploadImage');
    
    cy.intercept('POST', '**/api/images/edits', {
      statusCode: 200,
      body: {
        data: [{
          b64_json: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }]
      }
    }).as('generateImage');
    
    cy.intercept('GET', '**/api/users/credits', {
      statusCode: 200,
      body: { remainingCredits: 10 }
    }).as('getCredits');
  });

  describe('Authentication Flow', () => {
    it('shows sign-in prompt for unauthenticated users', () => {
      // Mock unauthenticated state
      cy.window().then((win) => {
        win.localStorage.removeItem('clerk-session');
      });
      
      cy.visit('/');
      cy.contains('Please sign in to generate cartoon images').should('be.visible');
      cy.get('[data-testid="sign-in-button"]').should('be.visible');
    });

    it('allows user to sign in', () => {
      cy.get('[data-testid="sign-in-button"]').click();
      
      // Mock successful authentication
      cy.window().then((win) => {
        win.localStorage.setItem('clerk-session', 'mock-session-token');
      });
      
      cy.reload();
      cy.contains('Drop your photo').should('be.visible');
    });
  });

  describe('Image Upload Flow', () => {
    beforeEach(() => {
      // Mock authenticated state
      cy.window().then((win) => {
        win.localStorage.setItem('clerk-session', 'mock-session-token');
      });
      cy.visit('/');
    });

    it('uploads image via file input', () => {
      // Create a test image file
      const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      
      // Upload image
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(testImage.split(',')[1], 'base64'),
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg'
      });
      
      // Verify upload request
      cy.wait('@uploadImage');
      
      // Verify processing starts
      cy.contains('Processing').should('be.visible');
      cy.get('[data-testid="progress-bar"]').should('be.visible');
    });

    it('uploads image via drag and drop', () => {
      const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      
      // Create a file for drag and drop
      const file = new File([Cypress.Buffer.from(testImage.split(',')[1], 'base64')], 'test-image.jpg', {
        type: 'image/jpeg'
      });
      
      // Simulate drag and drop
      cy.get('[data-testid="drop-zone"]')
        .trigger('dragover')
        .trigger('drop', {
          dataTransfer: {
            files: [file]
          }
        });
      
      // Verify upload request
      cy.wait('@uploadImage');
      
      // Verify processing starts
      cy.contains('Processing').should('be.visible');
    });

    it('validates file type and size', () => {
      // Try to upload invalid file type
      cy.get('input[type="file"]').selectFile({
        contents: 'This is not an image',
        fileName: 'test.txt',
        mimeType: 'text/plain'
      });
      
      // Should show error message
      cy.contains('Please upload a valid image file').should('be.visible');
      
      // Try to upload oversized file
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg'
      });
      
      cy.get('input[type="file"]').selectFile(largeFile);
      
      // Should show size error
      cy.contains('File size must be less than').should('be.visible');
    });
  });

  describe('Image Processing Flow', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('clerk-session', 'mock-session-token');
      });
      cy.visit('/');
    });

    it('processes image with selected style', () => {
      // Select a style
      cy.get('[data-testid="style-selector"]').click();
      cy.contains('Anime').click();
      
      // Upload image
      const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(testImage.split(',')[1], 'base64'),
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg'
      });
      
      // Wait for processing to complete
      cy.wait('@generateImage');
      
      // Verify result is displayed
      cy.get('[data-testid="cartoon-result"]').should('be.visible');
      cy.get('[data-testid="download-button"]').should('be.visible');
    });

    it('shows processing stages', () => {
      const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(testImage.split(',')[1], 'base64'),
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg'
      });
      
      // Check processing stages
      cy.contains('Uploading your image').should('be.visible');
      cy.contains('Preparing image for transformation').should('be.visible');
      cy.contains('AI is creating your cartoon version').should('be.visible');
    });

    it('handles processing errors gracefully', () => {
      // Mock API error
      cy.intercept('POST', '**/api/images/edits', {
        statusCode: 500,
        body: { error: 'Processing failed' }
      }).as('generateImageError');
      
      const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(testImage.split(',')[1], 'base64'),
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg'
      });
      
      cy.wait('@generateImageError');
      
      // Should show error message
      cy.contains('Processing failed').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });
  });

  describe('User Credits Flow', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('clerk-session', 'mock-session-token');
      });
    });

    it('shows credit status', () => {
      cy.visit('/');
      cy.wait('@getCredits');
      
      cy.get('[data-testid="credits-display"]').should('contain', '10');
    });

    it('prevents processing when credits are low', () => {
      // Mock low credits
      cy.intercept('GET', '**/api/users/credits', {
        statusCode: 200,
        body: { remainingCredits: 0 }
      }).as('getLowCredits');
      
      cy.visit('/');
      cy.wait('@getLowCredits');
      
      // Try to upload image
      const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(testImage.split(',')[1], 'base64'),
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg'
      });
      
      // Should show credit purchase prompt
      cy.contains('Please purchase more credits').should('be.visible');
    });

    it('handles credit purchase flow', () => {
      // Mock low credits
      cy.intercept('GET', '**/api/users/credits', {
        statusCode: 200,
        body: { remainingCredits: 0 }
      }).as('getLowCredits');
      
      // Mock checkout creation
      cy.intercept('POST', '**/api/checkouts', {
        statusCode: 200,
        body: { url: 'https://checkout.polar.sh/mock-checkout' }
      }).as('createCheckout');
      
      cy.visit('/');
      cy.wait('@getLowCredits');
      
      // Click purchase button
      cy.get('[data-testid="purchase-credits-button"]').click();
      
      // Should redirect to checkout
      cy.wait('@createCheckout');
      cy.url().should('include', 'checkout.polar.sh');
    });
  });

  describe('Dashboard Flow', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('clerk-session', 'mock-session-token');
      });
    });

    it('displays user gallery', () => {
      // Mock user images
      cy.intercept('GET', '**/api/users/images', {
        statusCode: 200,
        body: {
          images: [
            {
              _id: 'image-1',
              originalImageUrl: 'https://example.com/original.jpg',
              cartoonImageUrl: 'https://example.com/cartoon.jpg',
              status: 'completed',
              createdAt: Date.now()
            }
          ]
        }
      }).as('getUserImages');
      
      cy.visit('/dashboard');
      cy.wait('@getUserImages');
      
      cy.get('[data-testid="gallery-grid"]').should('be.visible');
      cy.get('[data-testid="image-card"]').should('have.length', 1);
    });

    it('allows image download', () => {
      cy.intercept('GET', '**/api/users/images', {
        statusCode: 200,
        body: {
          images: [
            {
              _id: 'image-1',
              originalImageUrl: 'https://example.com/original.jpg',
              cartoonImageUrl: 'https://example.com/cartoon.jpg',
              status: 'completed',
              createdAt: Date.now()
            }
          ]
        }
      }).as('getUserImages');
      
      cy.visit('/dashboard');
      cy.wait('@getUserImages');
      
      // Click download button
      cy.get('[data-testid="download-button"]').first().click();
      
      // Verify download starts
      cy.window().then((win) => {
        expect(win.location.href).to.include('cartoon.jpg');
      });
    });
  });

  describe('Responsive Design', () => {
    it('works on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/');
      
      // Should show mobile-optimized layout
      cy.get('[data-testid="mobile-layout"]').should('be.visible');
      cy.get('[data-testid="mobile-upload-button"]').should('be.visible');
    });

    it('works on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.visit('/');
      
      // Should show tablet-optimized layout
      cy.get('[data-testid="tablet-layout"]').should('be.visible');
    });

    it('works on desktop', () => {
      cy.viewport(1920, 1080);
      cy.visit('/');
      
      // Should show desktop layout
      cy.get('[data-testid="desktop-layout"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', () => {
      cy.visit('/');
      
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'tabindex');
      
      // Test arrow key navigation
      cy.get('[data-testid="style-selector"]').focus();
      cy.get('[data-testid="style-selector"]').type('{downarrow}');
      cy.get('[data-testid="style-option"]').should('be.visible');
    });

    it('has proper ARIA labels', () => {
      cy.visit('/');
      
      // Check for ARIA labels
      cy.get('[data-testid="upload-button"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="progress-bar"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="loading-spinner"]').should('have.attr', 'role', 'status');
    });

    it('supports screen readers', () => {
      cy.visit('/');
      
      // Check for screen reader text
      cy.get('.sr-only').should('be.visible');
      cy.get('[aria-live]').should('exist');
    });
  });
});