
import { response } from 'express';
import errorHandler from './errorHandler.js';
import { AuthenticatedRequest } from './middleware.js';
import { User } from './model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = errorHandler( async (req, res) => {
    const {name, email, password, role} = req.body;
    let user = await User.findOne({email});
    if (user) {
        res.status(400).json({message: 'User already exists'});
        return
    }

    const hashPassword = await bcrypt.hash(password, 10);
    user = await User.create({
        name,
        email,
        role,
        password: hashPassword
    });

    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET as string,{
        expiresIn: '7d',
    });
    res.status(201).json({
        message: 'User created successfully',
        user,
        token
    });

});


export const loginUser = errorHandler( async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        res.status(400).json({message: 'User not found'});
        return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400).json({message: 'Invalid credentials'});
        return;
    }

    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET as string,{
        expiresIn: '7d',
    });

    res.status(200).json({
        message:'User logged in successfully',
        user,
        token
    })



})


export const getUserProfile = errorHandler(async (req:AuthenticatedRequest, res) => {
    const user = req.user;
    res.json(user);
})

export const addToPlaylist = errorHandler(async (req:AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({message: 'User not found'});
        return
    }

    if (user.playlists.includes(req.params.id)) {
        const index = user.playlists.indexOf(req.params.id);
        user.playlists.splice(index, 1);
        await user.save();
        res.json({message: 'Song removed from playlist'});
        return
    }

    user.playlists.push(req.params.id);
    await user.save();
    res.json({message: 'Song added to playlist'});
});