import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app.js';

const port = process.env.PORT || 5001;

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
