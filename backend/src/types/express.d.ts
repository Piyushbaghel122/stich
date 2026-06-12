import type { SafeUser } from "../services/authServices.js";

declare global {
    namespace Express {
        interface Request {
            user?: SafeUser;
        }
    }
}

export {};
