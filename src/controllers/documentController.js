import fs from 'fs';
import path from 'path';
import File from '../models/fileModel.js';
import ConversionLog from '../models/conversionLogs.js';
import { convertDocument } from '../services/documentService.js';
import { uploadFileToSupabase } from '../services/storageService.js';

export const documentConversionController = async(req, res) => {
    try{
        const userId = req.user.id;
        const targetFormat = req.body.targetFormat?.toLowerCase();
        const allowedFormats =["pdf", "txt", "odt", "doc", "docx", "html"];
        const inputPath = req.file.path;
        if(!allowedFormats.includes(targetFormat)){
            return res.status(400).json({message:"Invalid target Format"});
        }

        const {convertedPath} = await convertDocument(inputPath, targetFormat);
        

        const fileName = `${Date.now()}-${req.file.originalname.split('.')[0]}.${targetFormat}`;

        const fileUrl = await uploadFileToSupabase(convertedPath, fileName);
        
        const fileRecord = await File.create({
            filename: req.file.originalname,
            filetype: req.file.mimetype,
            filesize: req.file.size,
            user_id: userId,
            converted_file_url:fileUrl
        });
        await ConversionLog.create({
            file_id: fileRecord.id,
            target_format:targetFormat,
            status:"completed",
            converted_file_url:fileUrl
        });

        fs.unlinkSync(req.file.path);

        res.json({message:"Document Converted Successfully", url:fileUrl});
        } catch(err) {
            console.error(err);
            res.status(500).json({
                message:"Document Conversion Failed"
            });
        }
    };