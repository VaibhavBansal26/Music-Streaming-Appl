import errorHandler from './errorHandler.js';
import { AuthenticatedRequest } from './middleware.js';
import { User, IUser } from './model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Admins are granted by configuration only, never by the request body.
const adminEmails = (): string[] =>
    (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

const publicUser = (user: IUser) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    playlists: user.playlists,
});

const signToken = (user: IUser) =>
    jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET as string, {
        expiresIn: '7d',
    });

export const registerUser = errorHandler(async (req, res) => {
    const { name, email, password } = req.body ?? {};

    if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ message: 'Name is required' });
        return;
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
        res.status(400).json({ message: 'A valid email is required' });
        return;
    }
    if (typeof password !== 'string' || password.length < 8) {
        res.status(400).json({ message: 'Password must be at least 8 characters' });
        return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        role: adminEmails().includes(normalizedEmail) ? 'admin' : 'user',
        password: await bcrypt.hash(password, 10),
    });

    res.status(201).json({
        message: 'User created successfully',
        user: publicUser(user),
        token: signToken(user),
    });
});

export const loginUser = errorHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    // Same message for unknown user and wrong password to avoid account enumeration.
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
    }

    res.status(200).json({
        message: 'User logged in successfully',
        user: publicUser(user),
        token: signToken(user),
    });
});

export const getUserProfile = errorHandler(async (req: AuthenticatedRequest, res) => {
    res.json(req.user);
});

export const addToPlaylist = errorHandler(async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    const songId = req.params.id;
    if (!/^\d+$/.test(songId)) {
        res.status(400).json({ message: 'Invalid song id' });
        return;
    }

    const index = user.playlists.indexOf(songId);
    if (index !== -1) {
        user.playlists.splice(index, 1);
        await user.save();
        res.json({ message: 'Song removed from playlist' });
        return;
    }

    user.playlists.push(songId);
    await user.save();
    res.json({ message: 'Song added to playlist' });
});
