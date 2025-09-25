import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock Convex API responses
export const handlers = [
  // Mock file upload
  http.post('https://mock.convex.cloud/api/storage/upload', () => {
    return HttpResponse.json({
      storageId: 'mock-storage-id-123'
    });
  }),

  // Mock image generation
  http.post('https://api.openai.com/v1/images/edits', () => {
    return HttpResponse.json({
      data: [{
        b64_json: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      }]
    });
  }),

  // Mock Clerk authentication
  http.get('https://api.clerk.com/v1/sessions', () => {
    return HttpResponse.json({
      data: [{
        id: 'mock-session-id',
        user_id: 'mock-user-id',
        status: 'active'
      }]
    });
  }),

  // Mock Polar API
  http.post('https://api.polar.sh/api/v1/checkouts', () => {
    return HttpResponse.json({
      id: 'mock-checkout-id',
      url: 'https://checkout.polar.sh/mock-checkout'
    });
  }),

  // Mock webhook
  http.post('https://mock.convex.cloud/api/webhooks/polar', () => {
    return HttpResponse.json({
      message: 'Webhook received'
    });
  })
];

export const server = setupServer(...handlers);