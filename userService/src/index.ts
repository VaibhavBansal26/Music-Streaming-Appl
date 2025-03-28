import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes.js';
import cors from 'cors';

const app = express();

app.use(cors())

dotenv.config();

app.use(express.json());

const port = process.env.PORT || 5001;

app.use("/api/v1",userRoutes)

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {
            dbName: process.env.DB_NAME,
        });
        console.log('Connected to database');

    } catch (error) {
        console.log(error);
    }
}

app.get('/', (req, res) => {
    res.send('Hello World');
});   



app.listen(5001, () => {
    console.log(`Server is running on port ${port}`);
    connectDb();
})