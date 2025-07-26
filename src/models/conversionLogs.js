import {DataTypes, Datatypes} from 'sequelize';
import sequelize from '../config/db.js';
import File from './fileModel.js';

const ConversionLog = sequelize.defiine("ConversionLog",{
    id:{type: DataTypes.INTEGER, primaryKey: true,authoInrement: true},
    file_id:{type: DataTypes.INTEGER, allowNull: false},
    target_format:{type: DataTypes.STRING(20), allowNull: false},
    status:{type: DataTypes.STRING(20),defaultValue:"completed"},
    converted_file_url:{type: DataTypes.TEXT},
    created_at:{type: DataTypes.DATE, defaultValue: DataTypes.NOW}
},{
    tableName: "conversion_logs",
    timestamps: false
});

File.hasMany(ConversionLog, {foreignKey:"file_id"});
ConversionLog.belongsTo(File,{foreignKey:"file_id"});

export default ConversionLog;