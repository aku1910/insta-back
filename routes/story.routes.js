// story.routes.js
import express from 'express';
import { createStory, getStories } from '../controllers/story.controller.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.post('/createStory', protectRoute, createStory);

router.get('/getStories', protectRoute, getStories);

export default router;
