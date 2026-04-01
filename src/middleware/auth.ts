import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";

import { auth } from "../lib/auth.js";

const asUserRole = (value: unknown): UserRoles | undefined => {
  if (value === "admin" || value === "teacher" || value === "student") {
    return value;
  }

  return undefined;
};

export const attachCurrentUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user) {
      const role = asUserRole((session.user as { role?: unknown }).role);
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      };

      if (role) {
        req.user.role = role;
      }
    }
  } catch (error) {
    console.error("Failed to resolve auth session:", error);
  }

  next();
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

export const requireRole = (...roles: UserRoles[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};
