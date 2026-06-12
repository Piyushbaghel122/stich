import "dotenv/config";
import app from "./src/app.js";
import http from "http";
import { connectDB } from "./src/db/db.js";
import connectRedis from "./src/db/redis.js";

const server = http.createServer(app);

const PORT = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
        console.error(
            `Port ${PORT} is already in use. Stop the other server or set a different PORT in .env.`,
        );
    } else {
        console.error("Server failed to start:", error);
    }

    process.exit(1);
});

Promise.all([connectDB(), connectRedis()])
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Server startup failed:", error);
        process.exit(1);
    });
