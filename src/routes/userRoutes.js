import express from 'express';
import { authMiddleware } from './../middlewares/authMiddleware.js';
import { getUserHistory } from '../controllers/userHistorycontroller.js';
import {getUserProfile} from "../controllers/userHistorycontroller.js"
const router = express.Router();
const noCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};

router.get('/history',authMiddleware, getUserHistory);
router.get('/me',noCache, authMiddleware, getUserProfile);

export default router;