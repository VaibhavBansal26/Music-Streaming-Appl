import express from 'express';
import dotenv from 'dotenv';
import adminRoutes from './routes.js';
import { sql } from './config/db.js';
import cloudinary from 'cloudinary';
import redis from 'redis';
import cors from 'cors';

dotenv.config();

export const redisClient = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT as string)
    }
});

redisClient.connect().then(() => {
    console.log('Connected to Redis.');
}).catch((error) => {
    console.log(error);
});

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const app = express();

app.use(cors())

app.use(express.json());

const port = process.env.PORT || 5002;

app.get('/', (req, res) => {
    res.send('Hello World 3');
});   


async function connectDb() {
    try {
        console.log('Connected to database');
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
        album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `
        console.log('Connected to database  and initialized tables');
    } catch (error) {   
        console.log(error);
    }
}

app.use('/api/v1',adminRoutes);

connectDb().then(() => {
    app.listen(port, () => {
        console.log(`Admin Server is running on port ${port}`);
    })
});





