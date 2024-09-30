import express from 'express';
import { getUserProfile } from '../controllers/auth.contoller.js';

const router = express.Router();

// Belirli bir kullanıcının profilini almak için rota
router.get('/:userId', getUserProfile);

export default router;
