

import {Request,Response,NextFunction} from 'express';
import  axios from 'axios';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    playlists: string[];
}

interface AuthenticatedRequest extends Request {
    user?: IUser | null
}

export const isAuth = async(req:AuthenticatedRequest, res:Response, next:NextFunction):Promise<void> => {
    try {
        const bearer = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.slice(7)
            : undefined;
        const token = (bearer ?? req.headers.token) as string;
       if (!token) {
            res.status(401).json({
                message: 'Please login'
            })
            return
        }

        const {data} = await axios.get(`${process.env.User_URL}/api/v1/user/getUserProfile`, {
            headers: {
                token,
            }
        });
        req.user = data
        next()

    } catch (error:any) {
        res.status(401).json({
            message: 'Please login'
        })
    }
}


const storage = multer.memoryStorage();

const uploadFile = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and audio files are allowed'));
        }
    },
}).single('file');


export default uploadFile;

