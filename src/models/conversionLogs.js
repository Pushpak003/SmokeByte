import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import File from "./fileModel.js";

const ConversionLog = sequelize.define(
  "ConversionLog",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bullmq_job_id: { type: DataTypes.STRING(255), allowNull: false },
    file_id: { type: DataTypes.INTEGER, allowNull: false },
    target_format: { type: DataTypes.STRING(20), allowNull: false },
    // FIX: was hardcoded "completed" — default is now "pending"
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "processing", "completed", "failed"]],
      },
    },
    converted_file_url: { type: DataTypes.TEXT, allowNull: true },
    error_message: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "conversion_logs",
    timestamps: false,
  }
);

File.hasMany(ConversionLog, { foreignKey: "file_id" });
ConversionLog.belongsTo(File, { foreignKey: "file_id" });

export default ConversionLog;