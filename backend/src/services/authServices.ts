import { pool } from "../db/db.js";

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    phone: string;
    country: string;
    reset_password_token: string | null;
    reset_password_expires_at: Date | null;
}

export type SafeUser = Omit<User, "password">;

export async function createUser(
    username: string,
    email: string,
    password: string,
    phone: string,
    country: string,
) {
    const result = await pool.query<User>(
        `INSERT INTO users (username, email, password, phone, country)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [username, email.toLowerCase(), password, phone, country],
    );

    return result.rows[0];
}

export async function findUserById(id: number) {
    const result = await pool.query<User>(
        "SELECT * FROM users WHERE id = $1 LIMIT 1",
        [id],
    );

    return result.rows[0] ?? null;
}

export async function findUserByEmail(email: string) {
    const result = await pool.query<User>(
        "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
        [email],
    );

    return result.rows[0] ?? null;
}

export async function findUserByEmailOrPhone(email: string, phone: string) {
    const result = await pool.query<User>(
        `SELECT * FROM users
         WHERE LOWER(email) = LOWER($1) OR phone = $2
         LIMIT 1`,
        [email, phone],
    );

    return result.rows[0] ?? null;
}

export async function findUserByPhone(phone: string) {
    const result = await pool.query<User>(
        "SELECT * FROM users WHERE phone = $1 LIMIT 1",
        [phone],
    );

    return result.rows[0] ?? null;
}

export async function savePasswordResetToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
) {
    await pool.query(
        `UPDATE users
         SET reset_password_token = $1, reset_password_expires_at = $2
         WHERE id = $3`,
        [tokenHash, expiresAt, userId],
    );
}

export async function resetPasswordWithToken(
    tokenHash: string,
    password: string,
) {
    const result = await pool.query<User>(
        `UPDATE users
         SET password = $1,
             reset_password_token = NULL,
             reset_password_expires_at = NULL
         WHERE reset_password_token = $2
           AND reset_password_expires_at > NOW()
         RETURNING *`,
        [password, tokenHash],
    );

    return result.rows[0] ?? null;
}

export async function isTokenBlacklisted(token: string) {
    const result = await pool.query(
        "SELECT 1 FROM blacklist WHERE token = $1 LIMIT 1",
        [token],
    );

    return result.rowCount !== null && result.rowCount > 0;
}

export async function blacklistToken(token: string) {
    await pool.query(
        `INSERT INTO blacklist (token, created_at)
         SELECT $1, NOW()
         WHERE NOT EXISTS (SELECT 1 FROM blacklist WHERE token = $1)`,
        [token],
    );
}
