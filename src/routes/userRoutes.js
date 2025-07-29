import express from 'express';
import { authMiddleware } from './../middlewares/authMiddleware.js';
import { getUserHistory } from '../controllers/userHistorycontroller.js';

const router = express.Router();

router.get('/history',authMiddleware, getUserHistory); 

export default router;