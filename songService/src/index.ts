import express from 'express';
import dotenv from 'dotenv';
import songRoutes from './routes.js';
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


const app = express();

app.use(cors())

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World 2');
});   


app.use("/api/v1", songRoutes);

const port = process.env.PORT || 5003;


app.listen(port, () => {
    console.log(`Song Server is running on port ${port}`);
})