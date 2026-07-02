import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", "data:", "https:"],
      },
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigin = (process.env.FRONTEND_URL || "").replace(/\/$/, "");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(passport.initialize());

// ── Health check — rate limiter se pehle, exempt hai ─────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok", uptime: process.uptime() });
});
// ─────────────────────────────────────────────────────────────────────────────

app.use(generalLimiter);

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "SmokeByte API Docs",
    swaggerOptions: { persistAuthorization: true },
  })
);

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
app.use("/convert", conversionRoutes);
app.use("/status", statusRoutes);
app.use("/download", downloadRoutes);

app.use(errorHandler);

export default app;