import fs from 'fs';
import path from 'path';
import File from '../models/fileModel.js';
import ConversionLog from '../models/conversionLogs.js';
import { convertMedia } from '../services/audiovideoService.js';
export const mediaConversionController = async(req, res) => {
    try{
        const userId = req.user.id;
        const targetFormat = req.body.targetFormat?.toLowerCase();

        const allowedFormats =["mp3", "wav", "mp4", "avi", "mov", "webm"];
        if(!allowedFormats.includes(targetFormat)){
            fs.unlinkSync(req.file.path);
            res.status(400).json({message:"Invalid Target Format"});
        }

        const {outputName} = await convertMedia(req.file.path,targetFormat);
        
        const fileRecord = await File.create({
            filename:req.file.originalname,
            filetype:req.file.mimetype,
            filesize:req.file.size,
            user_id:userId,
            converted_file_url:`uploads/${outputName}`
        });

        await ConversionLog.create({
            file_id:fileRecord.id,
            target_format:targetFormat,
            status:"completed",
            converted_file_url:`uploads/${outputName}`
        });

        fs.unlinkSync(req.file.path);
        res.json({message:"Media Converted Succesfully", url:`/uploads/${outputName}`});
    }catch(err) {
        console.error(err);
        res.status(500).json({message:"Media Conversion Failed"});
    }
};