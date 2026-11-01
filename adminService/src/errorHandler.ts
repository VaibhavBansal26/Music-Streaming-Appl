import { RequestHandler } from "express";
import { Request, Response, NextFunction } from "express";



const errorHandler =(handler: RequestHandler) : RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error:any) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default errorHandler;