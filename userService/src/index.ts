import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '100kb' }));

const port = process.env.PORT || 5001;

app.get('/', (req, res) => {
    res.send('User service');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', db: mongoose.connection.readyState === 1 });
});

app.use('/api/v1', userRoutes);

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {
            dbName: process.env.DB_NAME,
        });
        console.log('Connected to database');
    } catch (error) {
        console.error('Database connection failed', error);
        process.exit(1);
    }
};

connectDb().then(() => {
    app.listen(port, () => {
        console.log(`User server is running on port ${port}`);
    });
});
