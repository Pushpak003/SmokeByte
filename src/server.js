import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server Listening on port ${PORT}`);
});
process.on("SIGTERM", () => {
  console.log("SIGTERM received");

  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received");

  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
