import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const PORT = process.env.PORT;

app.listen(PORT,()=> {
    console.log(`Server Listening on port ${PORT}`);
});