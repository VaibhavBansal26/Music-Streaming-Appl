import { sql } from "./config/db.js";
import errorHandler from "./errorHandler.js";
import { redisClient } from "./index.js";



export const getAllAlbum = errorHandler(async (req, res) => {
    let albums;
    const CACHE_EXPIRY = 1000

    if (redisClient.isReady) {
        albums = await redisClient.get('albums')

    }

    if (albums) {
        console.log('from cache')
        res.json(JSON.parse(albums))
        return
    } else {
        console.log('from db')
        albums = await sql `
            SELECT * FROM albums
        `
        if(redisClient.isReady) {
            await redisClient.set('albums', JSON.stringify(albums),{
                EX: CACHE_EXPIRY
            })
        }
        res.json(albums)
        return
    }

    
})

export const getAllSongs = errorHandler(async (req, res) => {
    let songs;
    const CACHE_EXPIRY = 1000

    if (redisClient.isReady) {
        songs = await redisClient.get('songs')

    }
    if (songs) {
        res.json(JSON.parse(songs))
        return
    } else {
        songs = await sql `
            SELECT * FROM songs
        `
        if(redisClient.isReady) {
            await redisClient.set('songs', JSON.stringify(songs),{
                EX: CACHE_EXPIRY
            })
        }
        res.json(songs)
        return
    }
})

export const getAllSongsByAlbum = errorHandler(async (req, res) => {
    let album,songs;
    const CACHE_EXPIRY = 1000

    if (redisClient.isReady) {
        const cacheData = await redisClient.get(`album_song_${req.params.id}`)
        if (cacheData) {
            res.json(JSON.parse(cacheData))
            return
        }
    }

    album = await sql `
        SELECT * FROM albums
        WHERE id = ${req.params.id}
    `
    if (album.length === 0) {
        res.status(404).json({
            message: 'Album not found'
        })
        return
    }

    songs = await sql `
        SELECT * FROM songs
        WHERE album_id = ${req.params.id}
    `

    const response = {
        songs,
        album: album[0]
    }
    if (redisClient.isReady) {
        await redisClient.set(`album_song_${req.params.id}`, JSON.stringify(response),{
            EX: CACHE_EXPIRY
        })
    }
    res.json(response)
})

export const getSong = errorHandler(async (req, res) => {
    let song;
    song = await sql `
        SELECT * FROM songs
        WHERE id = ${req.params.id}
    `
    if (song.length === 0) {
        res.status(404).json({
            message: 'Song not found'
        })
        return
    }

    res.json(song[0])
})