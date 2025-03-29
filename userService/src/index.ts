import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes.js';
import { MongoClient, ServerApiVersion } from 'mongodb';
import cors from 'cors';

const app = express();

app.use(cors())

dotenv.config();

app.use(express.json());

const port = process.env.PORT || 5001;

app.use("/api/v1",userRoutes)

const client = new MongoClient(process.env.MONGO_URI as string, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  async function run() {
    try {
      await client.connect();
      await client.db(process.env.DB_NAME).command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    //   await client.close();
    }
  }
  
  run().catch(console.dir);

// const connectDb = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI as string, {
//             dbName: process.env.DB_NAME,
//         });
//         console.log('Connected to database');

//     } catch (error) {
//         console.log(error);
//     }
// }

app.get('/', (req, res) => {
    res.send('Hello World');
});   



app.listen(5001, () => {
    console.log(`Server is running on port ${port}`);
    run().catch(console.dir);
    // connectDb();
})