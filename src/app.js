import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import statusRoutes from "./routes/statusRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import conversionRoutes from "./routes/conversionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import { generalLimiter } from "./middlewares/rateLimit.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import passport from "./config/passport.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(passport.initialize());
app.use(generalLimiter); // global limiter — specific routes have their own stricter ones

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
app.use("/convert", conversionRoutes);
app.use("/status", statusRoutes);
app.use("/download", downloadRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok", uptime: process.uptime() });
});

app.use(errorHandler);

export default app;