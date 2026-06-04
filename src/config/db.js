import { Sequelize} from "sequelize";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();


const sequelize = new Sequelize(process.env.DATABASE_URL, {
    
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ca: fs.readFileSync("./ca.pem").toString(),
  },
  
});
export default sequelize;