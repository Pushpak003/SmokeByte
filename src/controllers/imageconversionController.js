import fs from 'fs';
import File from '../models/fileModel.js'; // Assuming you have a File model for storing file metadata
import ConversionLog from '../models/conversionLogs.js';
import { convertImageFile } from '../services/imageService.js';
export const convertImage = async(req, res) =>{
    try{
        const userID = req.user.id;
        const filePath = req.file.path;
        const targetFormat = req.body.targetFormat?.toLowerCase();

      
        const convertedFileurl = await convertImageFile(filePath,targetFormat);
        const fileRecord = await File.create({
            filename: req.file.originalname,
            filetype: req.file.mimetype,
            filesize:req.file.size,
            user_id: userID,
            converted_file_url: convertedFileurl
        });
        await ConversionLog.create({
            file_id: fileRecord.id,
            target_format: targetFormat,
            status:"completed",
            converted_file_url: convertedFileurl
        });

        res.status(200).json({
           message: "Image converted successfully",
           fileUrl: convertedFileurl
});

    }catch(err) {
        res.status(500).json({message: err.message});
    }
};