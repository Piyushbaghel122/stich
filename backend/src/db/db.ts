import { Client, Pool } from "pg";

const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://postgres:password123@localhost:5432/stich";

export const pool = new Pool({ connectionString });

function quoteIdentifier(value: string) {
    return `"${value.replaceAll('"', '""')}"`;
}

async function createTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(30) NOT NULL UNIQUE,
            country VARCHAR(100) NOT NULL,
            reset_password_token VARCHAR(255) NOT NULL ,
            reset_password_expires_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS blacklist (
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            token TEXT NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);
}

async function createDatabase() {
    const databaseUrl = new URL(connectionString);
    const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));

    if (!databaseName) {
        throw new Error("DATABASE_URL must include a database name.");
    }

    databaseUrl.pathname = "/postgres";
    const adminClient = new Client({ connectionString: databaseUrl.toString() });

    await adminClient.connect();

    try {
        await adminClient.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
        console.log(`Created PostgreSQL database "${databaseName}".`);
    } finally {
        await adminClient.end();
    }
}

export async function connectDB() {
    try {
        await pool.query("SELECT 1");
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "3D000"
        ) {
            await createDatabase();
            await pool.query("SELECT 1");
        } else {
            throw error;
        }
    }

    await createTables();
    console.log("Connected to PostgreSQL.");
}
