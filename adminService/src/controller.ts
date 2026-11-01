import { Request, Response } from "express";
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

const isId = (value: unknown): value is string => typeof value === 'string' && /^\d+$/.test(value);

const isNonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= 255;

// Returns false (after responding) when the caller is not an admin.
const requireAdmin = (req: AuthenticatedRequest, res: Response): boolean => {
    if (!req.user) {
        res.status(401).json({ message: 'Please login' });
        return false;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({ message: 'Not an admin account' });
        return false;
    }
    return true;
}

// Returns the uploaded file's data URI, or null (after responding) if it is missing or the wrong type.
const readFile = (req: Request, res: Response, kind: 'image' | 'audio') => {
    const file = req.file;
    if (!file) {
        res.status(400).json({ message: 'File is required' });
        return null;
    }
    if (!file.mimetype.startsWith(`${kind}/`)) {
        res.status(400).json({ message: `File must be an ${kind}` });
        return null;
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        res.status(500).json({ message: 'Invalid file - Failed to generate file buffer' });
        return null;
    }
    return fileBuffer.content;
}

// Cloudinary URLs look like .../upload/v123/<folder>/<name>.<ext>; the public id is <folder>/<name>.
const publicIdFromUrl = (url?: string | null): string | null => {
    const match = url?.match(/\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/);
    return match ? match[1] : null;
}

// Best effort: a failed cleanup must not fail the request that already changed the database.
const destroyAsset = async (url?: string | null, resource_type: 'image' | 'video' = 'image') => {
    const publicId = publicIdFromUrl(url);
    if (!publicId) return;
    try {
        await cloudinary.v2.uploader.destroy(publicId, { resource_type });
    } catch (error) {
        console.error('Failed to delete Cloudinary asset', publicId, error);
    }
}

const invalidate = async (...keys: string[]) => {
    if (redisClient.isReady && keys.length) {
        await redisClient.del(keys);
    }
}

export const addAlbum = errorHandler(async (req: AuthenticatedRequest, res) => {
    if (!requireAdmin(req, res)) return;

    const { title, description } = req.body;
    if (!isNonEmpty(title) || !isNonEmpty(description)) {
        res.status(400).json({ message: 'Title and description are required (max 255 characters)' });
        return;
    }

    const content = readFile(req, res, 'image');
    if (!content) return;

    const cloud = await cloudinary.v2.uploader.upload(content, {
        folder: "albums",
    });

    const result = await sql `
        INSERT INTO albums (title, description, thumbnail)
        VALUES (${title.trim()}, ${description.trim()}, ${cloud.secure_url})
        RETURNING *`

    await invalidate('albums');

    res.status(201).json({
        message: 'Album created successfully',
        album: result[0]
    })
})


export const addSongs = errorHandler(async (req: AuthenticatedRequest, res) => {
    if (!requireAdmin(req, res)) return;

    const { title, description, album_id } = req.body;
    if (!isNonEmpty(title) || !isNonEmpty(description) || !isId(album_id)) {
        res.status(400).json({ message: 'Title, description and a valid album_id are required' });
        return;
    }

    const content = readFile(req, res, 'audio');
    if (!content) return;

    const isAlbum = await sql `
        SELECT id FROM albums WHERE id = ${album_id}
    `
    if (isAlbum.length === 0) {
        res.status(404).json({ message: 'Album not found' });
        return;
    }

    const cloud = await cloudinary.v2.uploader.upload(content, {
        folder: "songs",
        resource_type: "video"
    });

    const result = await sql `
        INSERT INTO songs (title, description, audio, album_id)
        VALUES (${title.trim()}, ${description.trim()}, ${cloud.secure_url}, ${album_id})
        RETURNING *
    `

    await invalidate('songs', `album_song_${album_id}`);

    res.status(201).json({
        message: 'Song created successfully',
        song: result[0]
    })
})

export const addThumbnail = errorHandler(async (req: AuthenticatedRequest, res) => {
    if (!requireAdmin(req, res)) return;

    if (!isId(req.params.id)) {
        res.status(400).json({ message: 'Invalid song id' });
        return;
    }

    const song = await sql `
        SELECT * FROM songs WHERE id = ${req.params.id}
    `
    if (song.length === 0) {
        res.status(404).json({ message: 'Song not found' });
        return;
    }

    const content = readFile(req, res, 'image');
    if (!content) return;

    const cloud = await cloudinary.v2.uploader.upload(content, {
        folder: "thumbnails",
    });

    const result = await sql `
        UPDATE songs
        SET thumbnail = ${cloud.secure_url}
        WHERE id = ${req.params.id}
        RETURNING *
    `

    await destroyAsset(song[0].thumbnail);
    await invalidate('songs', `album_song_${song[0].album_id}`);

    res.status(200).json({
        message: 'Thumbnail added successfully',
        song: result[0]
    })
})


export const deleteAlbum = errorHandler(async (req: AuthenticatedRequest, res) => {
    if (!requireAdmin(req, res)) return;

    if (!isId(req.params.id)) {
        res.status(400).json({ message: 'Invalid album id' });
        return;
    }

    const album = await sql `
        SELECT * FROM albums WHERE id = ${req.params.id}
    `
    if (album.length === 0) {
        res.status(404).json({ message: 'Album not found' });
        return;
    }

    const songs = await sql `
        SELECT * FROM songs WHERE album_id = ${req.params.id}
    `

    // Songs are removed by ON DELETE CASCADE in the same statement.
    await sql `
        DELETE FROM albums
        WHERE id = ${req.params.id}
    `

    await Promise.all([
        destroyAsset(album[0].thumbnail),
        ...songs.flatMap((song) => [
            destroyAsset(song.audio, 'video'),
            destroyAsset(song.thumbnail),
        ]),
    ]);

    await invalidate('albums', 'songs', `album_song_${req.params.id}`);

    res.json({
        message: 'Album deleted successfully',
    })
})

export const deleteSong = errorHandler(async (req: AuthenticatedRequest, res) => {
    if (!requireAdmin(req, res)) return;

    if (!isId(req.params.id)) {
        res.status(400).json({ message: 'Invalid song id' });
        return;
    }

    const song = await sql `
        SELECT * FROM songs WHERE id = ${req.params.id}
    `
    if (song.length === 0) {
        res.status(404).json({ message: 'Song not found' });
        return;
    }

    await sql `
        DELETE FROM songs
        WHERE id = ${req.params.id}
    `

    await Promise.all([
        destroyAsset(song[0].audio, 'video'),
        destroyAsset(song[0].thumbnail),
    ]);

    await invalidate('songs', `album_song_${song[0].album_id}`);

    res.json({
        message: 'Song deleted successfully',
    })
})
