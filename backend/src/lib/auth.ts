import { Request, Response, NextFunction } from "express";
import { clerkClient } from "@clerk/express";
import { prismaClient } from "./db";

export interface AuthenticatedUser {
  userId: string;
  orgId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware to authenticate user via Clerk and attach user context
 * Extracts email from Clerk auth, finds user in DB, and sets req.user
 */
export async function clerkAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get Clerk auth object from request (added by @clerk/express)
    const clerkAuth = (req as any).auth;

    console.log("🔐 Auth Middleware - Clerk Auth:", {
      hasAuth: !!clerkAuth,
      userId: clerkAuth?.userId,
      sessionId: clerkAuth?.sessionId,
    });

    if (!clerkAuth || !clerkAuth.userId) {
      // No authentication - continue without user context (allows public queries)
      console.log("⚠️  No Clerk authentication found, continuing without user context");
      return next();
    }

    // Get user details from Clerk using the Clerk client
    const clerkUserId = clerkAuth.userId;
    console.log("🔍 Fetching user from Clerk API, userId:", clerkUserId);
    
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const email = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;

      console.log("📧 Email extracted from Clerk:", email);

      if (!email) {
        console.error("❌ No email found for Clerk user:", clerkUserId);
        return res.status(401).json({ 
          error: "Unauthorized: No email address found for this user",
          details: "Please ensure your Clerk account has a verified email address"
        });
      }

      // Find user in database by email
      console.log("🔎 Looking up user in database with email:", email);
      const user = await prismaClient.user.findUnique({
        where: { email },
        select: {
          id: true,
          orgId: true,
          email: true,
          role: true,
          isDeleted: true,
        },
      });

      console.log("👤 Database user lookup result:", user ? {
        id: user.id,
        email: user.email,
        orgId: user.orgId,
        role: user.role,
        isDeleted: user.isDeleted
      } : "NOT FOUND");

      if (!user) {
        console.error("❌ User not found in database:", email);
        return res.status(404).json({ 
          error: "User not found in database",
          details: `No user found with email: ${email}. Please contact your administrator to set up your account.`,
          email: email
        });
      }

      if (user.isDeleted) {
        console.error("❌ User account is deleted:", email);
        return res.status(403).json({ 
          error: "User account is deactivated",
          details: "Your account has been deactivated. Please contact your administrator."
        });
      }

      // Attach user context to request
      req.user = {
        userId: user.id,
        orgId: user.orgId,
        email: user.email,
        role: user.role,
      };

      console.log("✅ Authentication successful, user context set:", {
        userId: user.id,
        orgId: user.orgId,
        email: user.email,
        role: user.role
      });

      next();
    } catch (clerkError: any) {
      console.error("❌ Clerk API error:", clerkError);
      return res.status(500).json({ 
        error: "Failed to fetch user from Clerk",
        details: clerkError.message
      });
    }
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    return res.status(500).json({ 
      error: "Authentication failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Middleware to require authentication
 * Use this on routes that MUST have authenticated users
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: "Unauthorized: Authentication required" 
    });
  }
  next();
}
