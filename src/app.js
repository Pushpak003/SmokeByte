import express from "express";
import path from "path";
import cors from "cors";
import statusRoutes from "./routes/statusRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import conversionRoutes from "./routes/conversionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js"
import limiter from "./middlewares/rateLimit.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({origin:  'http://localhost:5173',credentials: true, allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(limiter);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use("/uploads",express.static(path.join(process.cwd(), "public", "uploads")));
app.use("/convert",conversionRoutes);
app.use("/status", statusRoutes);
app.use('/download', downloadRoutes);
export default app;