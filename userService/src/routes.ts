import express from 'express';
import rateLimit from 'express-rate-limit';
import { addToPlaylist, getUserProfile, loginUser, registerUser } from './controller.js';
import { isAuth } from './middleware.js';


const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts, try again later' },
});


router.post('/user/registerUser',authLimiter, registerUser)
router.post('/user/loginUser',authLimiter, loginUser)
router.get('/user/getUserProfile',isAuth,getUserProfile)
router.post('/songs/:id',isAuth,addToPlaylist)

export default router;