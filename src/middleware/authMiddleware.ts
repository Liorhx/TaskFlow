import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../lib/jwt.ts";

export interface AuthRequest extends Request {
  user?: TokenPayload;
  isMockUser?: boolean;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  // Try retrieving token from cookie first, then fall back to Authorization header
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please log in again.",
    });
    return;
  }

  // Check if it's a mock user (demarcated by 'user_' prefix or 'demo-user-id')
  req.user = decoded;
  req.isMockUser = decoded.userId.startsWith("user_") || decoded.userId === "demo-user-id";
  
  next();
}
