import express from 'express';
import { getAllAlbum, getAllSongs, getAllSongsByAlbum, getSong } from './controller.js';


const router = express.Router();

router.get('/album/all',getAllAlbum)
router.get('/songs/all',getAllSongs)
router.get('/album/:id',getAllSongsByAlbum)
router.get('/songs/:id',getSong)


export default router;