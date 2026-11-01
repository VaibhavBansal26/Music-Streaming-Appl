import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import adminRoutes from './routes.js';
import { sql } from './config/db.js';
import cloudinary from 'cloudinary';
import redis from 'redis';
import cors from 'cors';
import helmet from 'helmet';

export const redisClient = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT as string),
        // Back off up to 30s instead of retrying twice a second when Redis is unreachable.
        reconnectStrategy: (retries) => Math.min(retries * 1000, 30000)
    }
});

// Redis is only used to invalidate the song service cache; admin writes still work without it.
redisClient.on('error', (error) => console.error('Redis error', error.message));
redisClient.connect().then(() => {
    console.log('Connected to Redis.');
}).catch((error) => {
    console.error('Redis unavailable, continuing without cache', error.message);
});

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '100kb' }));

const port = process.env.PORT || 5002;

app.get('/', (req, res) => {
    res.send('Admin service');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', cache: redisClient.isReady });
});

async function connectDb() {
    try {
        await sql`
        CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `
        await sql`
        CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255),
        audio VARCHAR(255) NOT NULL,
        album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `
        // Older databases were created with ON DELETE SET NULL; make album deletes cascade to songs.
        await sql`ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_album_id_fkey`
        await sql`
        ALTER TABLE songs
        ADD CONSTRAINT songs_album_id_fkey
        FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
        `
        console.log('Connected to database and initialized tables');
    } catch (error) {
        console.error('Database initialization failed', error);
        process.exit(1);
    }
}

app.use('/api/v1', adminRoutes);

// Upload errors (too large, wrong type) from multer
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = error?.name === 'MulterError' || error?.message?.startsWith('Only image') ? 400 : 500;
    res.status(status).json({ message: status === 400 ? error.message : 'Internal server error' });
});

connectDb().then(() => {
    app.listen(port, () => {
        console.log(`Admin Server is running on port ${port}`);
    })
});
