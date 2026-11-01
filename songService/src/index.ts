import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import redis from 'redis';
import cors from 'cors';
import helmet from 'helmet';
import songRoutes from './routes.js';

export const redisClient = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT as string)
    }
});

// Redis is a cache only: the service keeps working from the database without it.
redisClient.on('error', (error) => console.error('Redis error', error.message));
redisClient.connect().then(() => {
    console.log('Connected to Redis.');
}).catch((error) => {
    console.error('Redis unavailable, continuing without cache', error.message);
});

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
    res.send('Song service');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', cache: redisClient.isReady });
});

app.use('/api/v1', songRoutes);

const port = process.env.PORT || 5003;

app.listen(port, () => {
    console.log(`Song Server is running on port ${port}`);
});
