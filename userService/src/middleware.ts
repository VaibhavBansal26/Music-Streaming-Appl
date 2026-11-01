import { NextFunction,Request,Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { User } from './model.js';
import { IUser } from './model.js';


export interface AuthenticatedRequest extends Request {
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
                message: 'Not authorized, no token'
            })
            return
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        const userId = decoded._id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            res.status(401).json({
                message: 'User not found'
            })
            return
        }

        req.user = user;
        next()

    } catch (error:any) {
        res.status(401).json({
            message: 'Not authorized, token failed'
        })
    }
}