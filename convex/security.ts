import { ConvexError, v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { securityAuditLogger, RateLimiter, validateFileSecurity, sanitizeInput } from "../src/lib/security";

// Rate limiter instances for different operations
const uploadRateLimiter = new RateLimiter(60000, 5); // 5 uploads per minute
const processingRateLimiter = new RateLimiter(300000, 3); // 3 processing requests per 5 minutes
const generalRateLimiter = new RateLimiter(60000, 20); // 20 general requests per minute

/**
 * Security middleware for mutations
 */
function withSecurity<T extends any[]>(
  handler: (...args: T) => Promise<any>,
  options: {
    rateLimiter?: RateLimiter;
    requireAuth?: boolean;
    auditEvent?: string;
  } = {}
) {
  return async (ctx: any, ...args: T) => {
    const { rateLimiter, requireAuth = true, auditEvent } = options;

    // Authentication check
    if (requireAuth) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        securityAuditLogger.log('warning', 'unauthorized_access_attempt', {
          function: handler.name,
          args: args.map(arg => typeof arg)
        });
        throw new ConvexError("Authentication required");
      }
    }

    // Rate limiting
    if (rateLimiter) {
      const identifier = ctx.auth?.getUserIdentity?.()?.subject || 'anonymous';
      if (!rateLimiter.isAllowed(identifier)) {
        securityAuditLogger.log('warning', 'rate_limit_exceeded', {
          function: handler.name,
          identifier,
          remainingRequests: rateLimiter.getRemainingRequests(identifier),
          resetTime: rateLimiter.getResetTime(identifier)
        });
        throw new ConvexError("Rate limit exceeded. Please try again later.");
      }
    }

    // Audit logging
    if (auditEvent) {
      const identity = await ctx.auth.getUserIdentity();
      securityAuditLogger.log('info', auditEvent, {
        function: handler.name,
        userId: identity?.subject,
        timestamp: new Date().toISOString()
      });
    }

    try {
      return await handler(ctx, ...args);
    } catch (error) {
      const identity = await ctx.auth.getUserIdentity();
      securityAuditLogger.log('error', 'function_execution_error', {
        function: handler.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: identity?.subject,
        args: args.map(arg => typeof arg)
      });
      throw error;
    }
  };
}

/**
 * Enhanced file upload with security checks
 */
export const secureGenerateUploadUrl = mutation({
  args: {},
  handler: withSecurity(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Authentication required");
    }

    // Generate a signed URL for uploading
    const uploadUrl = await ctx.storage.generateUploadUrl();
    
    securityAuditLogger.log('info', 'upload_url_generated', {
      userId: identity.subject,
      timestamp: new Date().toISOString()
    });

    return uploadUrl;
  }, {
    rateLimiter: uploadRateLimiter,
    auditEvent: 'upload_url_request'
  })
});

/**
 * Enhanced image save with security validation
 */
export const secureSaveUploadedImage = mutation({
  args: {
    storageId: v.string(),
    userId: v.string(),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    fileType: v.optional(v.string())
  },
  handler: withSecurity(async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) {
      throw new ConvexError("Unauthorized access");
    }

    // Validate file metadata if provided
    if (args.fileSize && args.fileSize > 10 * 1024 * 1024) {
      throw new ConvexError("File too large");
    }

    if (args.fileType && !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(args.fileType)) {
      throw new ConvexError("Invalid file type");
    }

    // Sanitize file name
    const sanitizedName = args.fileName ? sanitizeInput(args.fileName) : 'image';

    // Generate a URL for the uploaded file
    const imageUrl = await ctx.storage.getUrl(args.storageId);

    // Create a new image record with the URL
    const imageId = await ctx.db.insert("images", {
      userId: args.userId,
      originalStorageId: args.storageId,
      originalImageUrl: imageUrl || undefined,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    securityAuditLogger.log('info', 'image_saved', {
      userId: args.userId,
      imageId,
      fileSize: args.fileSize,
      fileType: args.fileType,
      timestamp: new Date().toISOString()
    });

    return imageId;
  }, {
    rateLimiter: uploadRateLimiter,
    auditEvent: 'image_save'
  })
});

/**
 * Enhanced image processing with security checks
 */
export const secureCartoonifyImage = mutation({
  args: { 
    storageId: v.string(), 
    style: v.string(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string())
  },
  handler: withSecurity(async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Authentication required");
    }

    // Validate style parameter
    const allowedStyles = ['simpsons', 'studio-ghibli', 'family-guy', 'disney', 'anime', 'comic-book', 'south-park'];
    if (!allowedStyles.includes(args.style)) {
      securityAuditLogger.log('warning', 'invalid_style_parameter', {
        userId: identity.subject,
        style: args.style,
        userAgent: args.userAgent,
        ipAddress: args.ipAddress
      });
      throw new ConvexError("Invalid cartoon style");
    }

    // Find the image record by storage ID
    const images = await ctx.db
      .query("images")
      .filter(q => q.eq(q.field("originalStorageId"), args.storageId))
      .collect();

    const image = images[0];
    if (!image) {
      throw new ConvexError("Image record not found");
    }

    // Verify ownership
    if (image.userId !== identity.subject) {
      securityAuditLogger.log('warning', 'unauthorized_image_access', {
        userId: identity.subject,
        imageId: image._id,
        imageOwner: image.userId,
        userAgent: args.userAgent,
        ipAddress: args.ipAddress
      });
      throw new ConvexError("Unauthorized access to image");
    }

    // Check if image is already being processed or completed
    if (image.status === "processing") {
      return { success: true, status: "processing" };
    }

    if (image.status === "completed" && image.cartoonImageUrl) {
      return { success: true, status: "completed" };
    }

    // Update status to processing
    await ctx.db.patch(image._id, {
      status: "processing",
      updatedAt: Date.now(),
    });

    securityAuditLogger.log('info', 'image_processing_started', {
      userId: identity.subject,
      imageId: image._id,
      style: args.style,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
      timestamp: new Date().toISOString()
    });

    try {
      // Schedule the image generation task
      await ctx.scheduler.runAfter(0, internal.image.ImageGen, {
        imageUrl: image.originalImageUrl!,
        userId: image.userId,
        style: args.style
      });
      
      return { success: true, status: "processing" };
    } catch (error) {
      // If scheduling fails, revert status to pending
      await ctx.db.patch(image._id, {
        status: "pending",
        updatedAt: Date.now()
      });
      
      securityAuditLogger.log('error', 'image_processing_scheduling_failed', {
        userId: identity.subject,
        imageId: image._id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw new ConvexError("Failed to schedule image generation");
    }
  }, {
    rateLimiter: processingRateLimiter,
    auditEvent: 'image_processing_request'
  })
});

/**
 * Enhanced user queries with security
 */
export const secureGetUserImages = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string())
  },
  handler: withSecurity(async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) {
      throw new ConvexError("Unauthorized access");
    }

    const limit = Math.min(args.limit || 20, 100); // Cap at 100 for security
    
    let query = ctx.db
      .query("images")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc");

    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("createdAt"), parseInt(args.cursor!)));
    }

    const images = await query.take(limit);
    
    const hasMore = images.length === limit;
    const nextCursor = hasMore ? images[images.length - 1].createdAt.toString() : null;

    return {
      images,
      hasMore,
      nextCursor
    };
  }, {
    rateLimiter: generalRateLimiter,
    auditEvent: 'user_images_query'
  })
});

/**
 * Security monitoring query
 */
export const getSecurityLogs = query({
  args: {
    level: v.optional(v.string()),
    userId: v.optional(v.string()),
    since: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Only allow access to admin users (you might want to implement admin role checking)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Authentication required");
    }

    // In a real app, you'd check if the user has admin privileges
    // For now, we'll just log the access attempt
    securityAuditLogger.log('info', 'security_logs_accessed', {
      userId: identity.subject,
      filters: args,
      timestamp: new Date().toISOString()
    });

    const filter = {
      level: args.level as 'info' | 'warning' | 'error' | undefined,
      userId: args.userId,
      since: args.since ? new Date(args.since) : undefined
    };

    return securityAuditLogger.getLogs(filter);
  }
});

/**
 * Rate limit status query
 */
export const getRateLimitStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Authentication required");
    }

    const userId = identity.subject;

    return {
      upload: {
        remaining: uploadRateLimiter.getRemainingRequests(userId),
        resetTime: uploadRateLimiter.getResetTime(userId)
      },
      processing: {
        remaining: processingRateLimiter.getRemainingRequests(userId),
        resetTime: processingRateLimiter.getResetTime(userId)
      },
      general: {
        remaining: generalRateLimiter.getRemainingRequests(userId),
        resetTime: generalRateLimiter.getResetTime(userId)
      }
    };
  }
});