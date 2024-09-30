import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRouter from './routes/auth.routes.js';
import postRouter from './routes/posts.routes.js';
import messageRoute from "./routes/message.routes.js";
import storyRouter from "./routes/story.routes.js";
import getUserProfile from "./routes/otherUser.routes.js";
import getAllUsers from './routes/users.routes.js'
import adminRouter from "./routes/admin.routes.js"
import path from 'path';
import { fileURLToPath } from 'url';
import { app,server } from "./socket.js"
import nodemailer from "nodemailer"

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profilePicStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './profilePic'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const postImageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './postImage'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const storyImageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './storyImage'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const profilePicUpload = multer({ storage: profilePicStorage });
const postImageUpload = multer({ storage: postImageStorage });
const storyImageUpload = multer({ storage: storyImageStorage });

const PORT = process.env.PORT || 9000;
const MONGODB_URL = process.env.MONGODB_URL;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('./'));
app.use(express.json());

app.use('/api/auth', profilePicUpload.single('profilePic'), authRouter);
app.use('/api/stories', storyImageUpload.single('storyImage'), storyRouter);
app.use('/api/post', postImageUpload.single('postPic'), postRouter);
app.use('/api/user', getUserProfile);
app.use("/api/messages", messageRoute)
app.use('/api/users', getAllUsers);
app.use('/api/users/', authRouter)
app.use('/api/post/', postRouter)
app.use('/api/', adminRouter);


mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log('Database connected');
        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
        
    })
    .catch((error) => {
        console.error('Error connecting to database:', error.message);
    });

export default app;
