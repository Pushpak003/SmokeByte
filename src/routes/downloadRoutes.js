// routes/downloadRoutes.js
import express from 'express';
import { downloadFileController } from '../controllers/downloadController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// A protected route to handle downloads
router.get('/', authMiddleware, downloadFileController);

export default router;