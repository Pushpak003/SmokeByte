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
export const getUserProfile = async (req, res) => {
  try {
    // authMiddleware already finds the user and attaches it to req.user
    const userProfile = {
      id: req.user.id,
      username: req.user.username,
    };
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};