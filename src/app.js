import express from "express";
import path from "path";
import cors from "cors";
import statusRoutes from "./routes/statusRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import conversionRoutes from "./routes/conversionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import limiter from "./middlewares/rateLimit.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({origin: ['http://localhost:3000', 'http://localhost:5173']}));
app.use(limiter);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use("/uploads",express.static(path.join(process.cwd(), "public", "uploads")));
app.use("/convert",conversionRoutes);
app.use("/status", statusRoutes);
export default app;