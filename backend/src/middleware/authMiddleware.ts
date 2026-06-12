import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import {
    findUserById,
    isTokenBlacklisted,
    type SafeUser,
} from "../services/authServices.js";

export interface AuthenticatedRequest extends Request {
    authUser?: SafeUser;
    authToken?: string;
}

function getToken(req: Request) {
    const cookieToken = req.cookies?.token;

    if (typeof cookieToken === "string" && cookieToken) {
        return cookieToken;
    }

    const authorization = req.get("authorization");
    if (authorization?.startsWith("Bearer ")) {
        return authorization.slice(7).trim();
    }

    return null;
}

export async function requireUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const token = getToken(req);
        const secret = process.env.JWT_SECRET;

        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (!secret) {
            throw new Error("JWT_SECRET is not configured");
        }

        if (await isTokenBlacklisted(token)) {
            return res.status(401).json({ message: "Token is no longer valid" });
        }

        const payload = jwt.verify(token, secret) as JwtPayload;
        const userId = Number(payload.id);

        if (!Number.isInteger(userId) || userId < 1) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const user = await findUserById(userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const { password: _password, ...safeUser } = user;
        req.authUser = safeUser;
        req.authToken = token;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        next(error);
    }
}
