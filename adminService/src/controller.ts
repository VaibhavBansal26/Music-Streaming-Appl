import { Request } from "express";
import errorHandler from "./errorHandler.js";
import getBuffer from "./config/datauri.js";
import cloudinary from 'cloudinary';
import { sql } from "./config/db.js";
import { redisClient } from "./index.js";


interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        role: string;
    }
}

export const addAlbum = errorHandler(async (req:AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({
            message: 'Not an admin acocunt'
        })
        return
    }

    const {title,description} = req.body;
    const file = req.file;
    if (!file) {
        res.status(400).json({
            message: 'File is required'
        })
        return
    }

    const fileBuffer = getBuffer(file);

    if(!fileBuffer || !fileBuffer.content) {
        res.status(500).json({
            message: 'Invalid file - Failed to generate file buffer'
        })
        return
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "albums",
    });

    const result = await sql `
        INSERT INTO albums (title, description, thumbnail)
        VALUES (${title}, ${description}, ${cloud.secure_url})
        RETURNING *`
    
    if (redisClient.isReady){
        await redisClient.del('albums')
    }
    
    res.status(201).json({
        message: 'Album created successfully',
        album: result[0]    
    })
})


export const addSongs = errorHandler(async (req:AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
        res.status(401).json({
            message: 'Not an admin acocunt'
        })
        return
    }

    // const {albumId} = req.params;
    const {title, description, album_id} = req.body;
    const isAlbum = await sql `
        SELECT * FROM albums WHERE id = ${album_id}
    `
    if (isAlbum.length === 0) {
        res.status(404).json({
            message: 'Album not found'
        })
        return
    }

    const file = req.file;
    if (!file) {
        res.status(400).json({
            message: 'File is required'
        })
        return
    }

    const fileBuffer = getBuffer(file);
    if(!fileBuffer || !fileBuffer.content) {
        res.status(500).json({
            message: 'Invalid file - Failed to generate file buffer'
        })
        return
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "songs",
        resource_type: "video"
    });


    const result = await sql `
        INSERT INTO songs (title, description, audio, album_id)
        VALUES (${title}, ${description}, ${cloud.secure_url}, ${album_id})
        RETURNING *
    `

    if (redisClient.isReady){
        await redisClient.del('songs')
    }

    res.status(201).json({
        message: 'Song created successfully',
        song: result
    })

})

export const addThumbnail = errorHandler(async (req:AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
        res.status(401).json({
            message: 'Not an admin acocunt'
        })
        return
    }

   const song = await sql `
        SELECT * FROM songs WHERE id = ${req.params.id}
    `
    if (song.length === 0) {
        res.status(404).json({
            message: 'Song not found'
        })
        return
    }

    const file = req.file;
    if (!file) {
        res.status(400).json({
            message: 'File is required'
        })
        return
    }

    const fileBuffer = getBuffer(file);
    if(!fileBuffer || !fileBuffer.content) {
        res.status(500).json({
            message: 'Invalid file - Failed to generate file buffer'
        })
        return
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content);

    const result = await sql `
        UPDATE songs
        SET thumbnail = ${cloud.secure_url}
        WHERE id = ${req.params.id}
        RETURNING *
    `

    if (redisClient.isReady){
        await redisClient.del('songs')
    }

    res.status(201).json({
        message: 'Thumbnail added successfully',
        song: result[0]    
    })


})


export const deleteAlbum = errorHandler(async (req:AuthenticatedRequest, res) => { 
    if (req.user?.role !== 'admin') {
        res.status(401).json({
            message: 'Not an admin acocunt'
        })
        return
    }

    const isAlbum = await sql `
        SELECT * FROM albums WHERE id = ${req.params.id}
    `
    if (isAlbum.length === 0) {
        res.status(404).json({
            message: 'Album not found'
        })
        return
    }


    await sql `
        DELETE FROM songs
        WHERE album_id = ${req.params.id}
        RETURNING *
    `

    await sql `
        DELETE FROM albums
        WHERE id = ${req.params.id}
        RETURNING *
    `

    if (redisClient.isReady){
        await redisClient.del('albums')
    }

    if (redisClient.isReady){
        await redisClient.del('songs')
    }


    res.json({
        message: 'Album deleted successfully',
    })
})

export const deleteSong = errorHandler(async (req:AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
        res.status(401).json({
            message: 'Not an admin acocunt'
        })
        return
    }

    const song = await sql `
        SELECT * FROM songs WHERE id = ${req.params.id}
    `
    if (song.length === 0) {
        res.status(404).json({
            message: 'Song not found'
        })
        return
    }

    await sql `
        DELETE FROM songs
        WHERE id = ${req.params.id}
        RETURNING *
    `

    if (redisClient.isReady){
        await redisClient.del('songs')
    }

    res.json({
        message: 'Song deleted successfully',
    })
})