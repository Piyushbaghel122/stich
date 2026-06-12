import express, {
    type ErrorRequestHandler,
    type Request,
    type Response,
} from "express";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "../src/routes/authRoutes.js";
import cookies from "cookie-parser";

const app = express();
app.use(morgan("dev"));
app.use(
    cors({
        origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookies());
app.use("/auth", authRoutes);

app.get("/", (_req: Request, res: Response) => {
    res.send("hello-world");
});

app.use((_req: Request, res: Response) => {
    return res.status(404).json({ message: "Route not found" });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    console.error(error);

    if (
        error instanceof SyntaxError &&
        "status" in error &&
        error.status === 400
    ) {
        return res.status(400).json({
            message: "Invalid JSON body. Check commas, quotes, and brackets.",
        });
    }

    const message =
        error instanceof Error ? error.message : "Internal server error";

    return res.status(500).json({
        message:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : message,
    });
};

app.use(errorHandler);

export default app;
