import fs from 'fs';
import path from 'path';
import File from '../models/fileModel.js';
import ConversionLog from '../models/conversionLogs.js';
import { convertDocument } from '../services/documentService.js';

export const documentConversionController = async(req, res) => {
    try{
        const userId = req.user.id;
        const targetFormat = req.body.targetFormat?.toLowerCase();
        const allowedFormats =["pdf", "txt", "odt", "doc", "docx", "html"];

        if(!allowedFormats.includes(targetFormat)){
            return res.status(400).json({message:"Invalid target Format"});
        }

        const {convertedPath} = await convertDocument(inputPath, targetFormat);
        const outputFileName = `converted-${Date.now()}.${targetFormat}}`;
        const finalOutputPath = path.join("public/uploads", outputFileName);
        fs.renameSync(convertedPath, finalOutputPath);
        
        const fileRecord = await File.create({
            filename: req.file.originalname,
            filetype: req.file.mimetype,
            filesize: req.file.size,
            user_id: userId
        });
        await ConversionLog.create({
            file_id: fileRecord.id,
            target_format:targetFormat,
            status:"completed",
            converted_file_url:`/uploads/${outputFileName}`
        });

        fs.unlinkSync(req.file.path);

        res.json({message:"Document Converted Successfully", url: `/uploads/${outputFileName}`});
        } catch(err) {
            console.error(err);
            res.status(500).json({
                message:"Document Conversion Failed"
            });
        }
    };