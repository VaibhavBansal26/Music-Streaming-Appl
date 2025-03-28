import express from 'express';
import dotenv from 'dotenv';
import { addToPlaylist, getUserProfile, loginUser, registerUser } from './controller.js';
import { isAuth } from './middleware.js';


const router = express.Router();


router.post('/user/registerUser', registerUser)
router.post('/user/loginUser', loginUser)
router.get('/user/getUserProfile',isAuth,getUserProfile)
router.post('/songs/:id',isAuth,addToPlaylist)

export default router;