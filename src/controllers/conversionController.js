import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import File from '../models/fileModel.js'; // Assuming you have a File model for storing file metadata
import ConversionLog from '../models/conversionLogs.js';

export const convertImage = async(req, res) =>{
    try{
        const userID = req.user.id;
        const filePath = req.file.path;

        const outputName = `converted-${Date.now()}.png`;
        const outputPath = path.join("public","uploads", outputName);

        await sharp(filePath).png().toFile(outputPath);

        const fileRecord = await File.create({
            filename: req.file.originalname,
            filetype: req.file.mimetype,
            filesize:req.file.size,
            user_id: userID
        });
        await ConversionLog.create({
            file_id: fileRecord.id,
            target_format: "png",
            status:"completed",
            converted_file_url:`/uploads/${outputName}`
        });

        res.status(200).json({
           message: "Image converted successfully",
           fileUrl: `/uploads/${outputName}`
});

    }catch(err) {
        res.status(500).json({message: err.message});
    }
};