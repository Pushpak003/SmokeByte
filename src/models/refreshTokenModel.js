import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

console.log("REFRESH TOKEN MODEL LOADED");
const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: false,
  }
);

export default RefreshToken;