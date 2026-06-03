import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import statusRoutes from "./routes/statusRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import conversionRoutes from "./routes/conversionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js"
import limiter from "./middlewares/rateLimit.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({origin:  'https://smoke-byte-frontend.vercel.app',credentials: true, allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(limiter);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use("/uploads",express.static(path.join(process.cwd(), "public", "uploads")));
app.use("/convert",conversionRoutes);
app.use("/status", statusRoutes);
app.use('/download', downloadRoutes);
app.use(errorHandler);
export default app;