import File from "../models/fileModel.js";
import ConversionLog from "../models/conversionLogs.js";

export const getUserHistory = async(req, res) =>{
    try{
        const userId = req.user.id;

        const files = await File.findAll({
            where:{user_id:userId},
            include:[{
                model: ConversionLog,
                attributes:["id","target_format", "status", "converted_file_url","created_at"]
         }
         ]
        });
        res.json({message:"History fetched", data:files});
    }catch(err){
        res.status(500).json({message:"Failed to fetch history"});
    }
};