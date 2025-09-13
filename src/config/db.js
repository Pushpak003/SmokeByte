import { Sequelize} from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
  logging: console.log,
    dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Render ke self-signed cert ke liye
    },
  },
});
export default sequelize;