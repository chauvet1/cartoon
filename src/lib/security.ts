/**
 * Security utilities and validation functions for Paperbag
 */

import { FILE_CONFIG, VALIDATION_RULES } from './constants';

/**
 * File validation and security checks
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFile?: File;
  metadata?: {
    size: number;
    type: string;
    name: string;
    lastModified: number;
  };
}

/**
 * Comprehensive file validation with security checks
 */
export function validateFileSecurity(file: File): FileValidationResult {
  // Check file size
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${formatFileSize(FILE_CONFIG.MAX_SIZE)}`
    };
  }

  // Check file type
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${FILE_CONFIG.ALLOWED_TYPES.join(', ')}`
    };
  }

  // Check file name for malicious patterns
  const maliciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.pif$/i,
    /\.com$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.jar$/i,
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i,
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i
  ];

  const fileName = file.name.toLowerCase();
  for (const pattern of maliciousPatterns) {
    if (pattern.test(fileName)) {
      return {
        isValid: false,
        error: 'File name contains potentially malicious content'
      };
    }
  }

  // Sanitize file name
  const sanitizedName = sanitizeFileName(file.name);
  const sanitizedFile = new File([file], sanitizedName, {
    type: file.type,
    lastModified: file.lastModified
  });

  return {
    isValid: true,
    sanitizedFile,
    metadata: {
      size: file.size,
      type: file.type,
      name: sanitizedName,
      lastModified: file.lastModified
    }
  };
}

/**
 * Sanitize file name to prevent security issues
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(0, 100); // Limit length
}

/**
 * Validate image file content (basic magic number check)
 */
export async function validateImageContent(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Check magic numbers for common image formats
      const isValidImage = 
        // PNG
        (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) ||
        // JPEG
        (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) ||
        // GIF
        (uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46) ||
        // WebP
        (uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50);
      
      resolve(isValidImage);
    };
    
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 12)); // Read first 12 bytes
  });
}

/**
 * Rate limiting implementation
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length === 0) return now;
    
    const oldestRequest = Math.min(...validRequests);
    return oldestRequest + this.windowMs;
  }
}

/**
 * Input sanitization utilities
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
}

export function sanitizeHtml(html: string): string {
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br'];
  const allowedAttributes = ['class', 'id'];
  
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '');
}

/**
 * CSRF protection utilities
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64;
}

/**
 * Content Security Policy helpers
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://clerk.com', 'https://js.stripe.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://api.convex.dev', 'https://api.openai.com'],
  'frame-src': ["'self'", 'https://clerk.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * Secure headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

/**
 * Environment variable validation
 */
export function validateEnvironmentVariables(): { isValid: boolean; missing: string[] } {
  const requiredVars = [
    'VITE_CLERK_PUBLISHABLE_KEY',
    'VITE_CONVEX_URL',
    'POLAR_ACCESS_TOKEN',
    'POLAR_ORGANIZATION_ID',
    'POLAR_WEBHOOK_SECRET',
    'OPENAI_API_KEY'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * API key validation
 */
export function validateAPIKey(key: string, type: 'openai' | 'clerk' | 'polar'): boolean {
  if (!key || typeof key !== 'string') return false;

  switch (type) {
    case 'openai':
      return key.startsWith('sk-') && key.length > 20;
    case 'clerk':
      return key.startsWith('pk_') || key.startsWith('sk_');
    case 'polar':
      return key.length > 20 && /^[a-zA-Z0-9_-]+$/.test(key);
    default:
      return false;
  }
}

/**
 * Secure random string generation
 */
export function generateSecureRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash function for sensitive data
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Secure comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * File size formatter helper
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Security audit logger
 */
export class SecurityAuditLogger {
  private logs: Array<{
    timestamp: Date;
    level: 'info' | 'warning' | 'error';
    event: string;
    details: any;
    userId?: string;
    ip?: string;
  }> = [];

  log(level: 'info' | 'warning' | 'error', event: string, details: any, userId?: string, ip?: string) {
    const logEntry = {
      timestamp: new Date(),
      level,
      event,
      details,
      userId,
      ip
    };

    this.logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      console.warn('Security audit log:', logEntry);
    }
  }

  getLogs(filter?: { level?: string; userId?: string; since?: Date }) {
    let filteredLogs = this.logs;

    if (filter) {
      if (filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filter.level);
      }
      if (filter.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
      }
      if (filter.since) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.since!);
      }
    }

    return filteredLogs;
  }
}

// Global security audit logger instance
export const securityAuditLogger = new SecurityAuditLogger();