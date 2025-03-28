import express from 'express';
import uploadFile, { isAuth } from './middleware.js';
import { addAlbum, addSongs, addThumbnail, deleteAlbum, deleteSong } from './controller.js';

const router = express.Router();

router.post('/album/addAlbum',isAuth,uploadFile,addAlbum)
router.post('/songs/addSong',isAuth,uploadFile,addSongs)
router.post('/songs/:id',isAuth,uploadFile,addThumbnail)
router.delete('/album/:id',isAuth,deleteAlbum)
router.delete('/songs/:id',isAuth,deleteSong)


export default router;