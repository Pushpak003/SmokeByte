// "import dotenv/config" is a static import — it runs before any other module code,
// unlike dotenv.config() which is a function call and gets hoisted-over by other imports.
import "dotenv/config";
import { validateEnv } from "./config/env.js";
validateEnv();

import app from "./app.js";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed (SIGTERM)");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Server closed (SIGINT)");
    process.exit(0);
  });
});