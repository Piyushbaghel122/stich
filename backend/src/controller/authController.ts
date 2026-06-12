import crypto from "node:crypto";
import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import {
    blacklistToken,
    createUser,
    findUserByEmail,
    resetPasswordWithToken,
    savePasswordResetToken,
} from "../services/authServices.js";
import {
    sendPhoneOtp,
    verifyPhoneOtp,
} from "../services/twilioVerifyService.js";

function hash(value: string) {
    return crypto.createHash("sha256").update(value).digest("hex");
}

function createAuthToken(userId: number) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
}

function setTokenCookie(res: Response, token: string) {
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

export async function registerController(
    req: Request,
    res: Response
) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation errors",
                errors: errors.array(),
            });
        }

        const { username, password, email, phone, country } = req.body;
        if (!username || !password || !email || !phone || !country) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await createUser(
            username,
            email,
            hash(password),
            phone,
            country,
        );
        const token = createAuthToken(user.id);
        setTokenCookie(res, token);

        const { password: _password, ...safeUser } = user;
        return res.status(201).json({
            message: "User created successfully",
            token,
            user: safeUser,
        });
    } catch (error) {
        
    }
}

export async function loginController(
    req: Request,
    res: Response,
 
) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation errors",
                errors: errors.array(),
            });
        }

        const email = String(req.body.email ?? "").trim().toLowerCase();
        const password = String(req.body.password ?? "");
        const user = email ? await findUserByEmail(email) : null;

        if (!user || user.password !== hash(password)) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = createAuthToken(user.id);
        setTokenCookie(res, token);

        const { password: _password, ...safeUser } = user;
        return res.status(200).json({
            message: "Login successful",
            token,
            user: safeUser,
        });
    } catch (error) {

    }
}

export async function logoutController(
    req: Request,
    res: Response

) {
    try {
        const cookieToken = req.cookies?.token;
        const bearerToken = req.get("authorization")?.replace(/^Bearer\s+/i, "");
        const token =
            typeof cookieToken === "string" ? cookieToken : bearerToken;

        if (token) {
            await blacklistToken(token);
        }

        res.clearCookie("token");
        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
    
    }
}

export async function forgotPassword(
    req: Request,
    res: Response
) {
    try {
        const email = String(req.body.email ?? "").trim().toLowerCase();
        const user = email ? await findUserByEmail(email) : null;

        if (!user) {
            return res.status(200).json({
                message: "If the email exists, a password reset link has been created",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        await savePasswordResetToken(
            user.id,
            hash(resetToken),
            new Date(Date.now() + 15 * 60 * 1000),
        );

        return res.status(200).json({
            message: "If the email exists, a password reset link has been created",
            ...(process.env.NODE_ENV !== "production" && { resetToken }),
        });
    } catch (error) {
   
    }
}

export async function resetPassword(
    req: Request,
    res: Response
) {
    try {
        const resetToken = req.params.token;
        const password = String(req.body.password ?? "");

        if (!resetToken || Array.isArray(resetToken) || password.length < 6) {
            return res.status(400).json({
                message: "A valid token and password of at least 6 characters are required",
            });
        }
        const user = await resetPasswordWithToken(hash(resetToken), hash(password));
        if (!user) {
            return res.status(400).json({
                message: "Reset token is invalid or expired",
            });
        }

        return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        next(error);
    }
}

export function getMeController(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({ user: req.authUser });
}

export async function sendOtpController(
    req: Request,
    res: Response,

) {
    try {
        const phone = String(req.body.phone ?? "").trim();
        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        const result = await sendPhoneOtp(phone);
        return res.status(200).json({ message: "OTP sent successfully", ...result });
    } catch (error) {
        next(error);
    }
}

export async function verifyOtpController(
    req: Request,
    res: Response
) {
    try {
        const phone = String(req.body.phone ?? "").trim();
        const otp = String(req.body.otp ?? "").trim();
        if (!phone || !otp) {
            return res.status(400).json({ message: "Phone and OTP are required" });
        }

        const result = await verifyPhoneOtp(phone, otp);
        if (!result.verified) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
                ...result,
            });
        }

        return res.status(200).json({
            message: "Phone number verified successfully",
            ...result,
        });
    } catch (error) {
       return res.status(500)
    }
}

export default registerController;
