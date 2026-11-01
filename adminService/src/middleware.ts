

import {Request,Response,NextFunction} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

interface AuthenticatedRequest extends Request {
    user?: { _id: string; role: string }
}

// The token is verified locally with the shared JWT_SECRET; the role is a signed claim,
// so no per-request call to the user service is needed. Role changes apply after re-login.
export const isAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : undefined;
    const token = (bearer ?? req.headers.token) as string | undefined;
    if (!token) {
        res.status(401).json({ message: 'Please login' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        if (!decoded._id || !decoded.role) {
            res.status(401).json({ message: 'Please login again' });
            return;
        }
        req.user = { _id: decoded._id, role: decoded.role };
        next();
    } catch {
        res.status(401).json({ message: 'Please login' });
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

