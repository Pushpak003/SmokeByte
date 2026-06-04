import { Sequelize} from "sequelize";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const caPath = path.join(process.cwd(), "ca.pem");


const sequelize = new Sequelize(process.env.DATABASE_URL, {
    
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(
        path.join(process.cwd(), "ca.pem"),
        "utf8"
      ),
    },
  },
  
});

export default sequelize;