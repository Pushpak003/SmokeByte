import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./userModel.js";

const File = sequelize.define("File", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    filename: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    filetype: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    filesize: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    converted_file_url: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'files',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

User.hasMany(File,{ foreignKey: "user_id"});
File.belongsTo(User, { foreignKey: "user_id" });    

export default File;