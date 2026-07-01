import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

// ca.pem root mein hai — COPY . . se image mein already aata hai
const caPath = path.join(process.cwd(), "ca.pem");
const ca = fs.readFileSync(caPath, "utf8");
logger.info("DB — CA cert loaded from ca.pem");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true,
      ca,
    },
  },
});

sequelize
  .authenticate()
  .then(() => logger.info("✅ DB connected successfully"))
  .catch((err) => logger.error({ err: err.message }, "❌ DB connection failed"));

export default sequelize;