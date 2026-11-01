import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

// Works with any PostgreSQL (Render, Neon, local); TLS is taken from the URL (sslmode=require).
export const sql = postgres(process.env.DB_URL as string, {
    max: 5,
    idle_timeout: 20,
});
