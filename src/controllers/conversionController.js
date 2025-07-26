import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import File from '../models/fileModel.js'; // Assuming you have a File model for storing file metadata
import ConversionLog from '../models/conversionLogs.js';

export const convertImage = async(req, res) =>{
    try{
        const userID = req.user.id;
        const filePath = req.file.path;
        const targetFormat = req.body.targetFormat?.toLowerCase();
        const allowedFormats = ["png","jpeg","jpg","webp"];
        if(!allowedFormats.includes(targetFormat)){
            fs.unlinkSync(filePath);
            return res.status(400).json({message:"Invalid Format"});
        }
        
        const extension = targetFormat === "jpg" ? "jpeg": targetFormat;

        const outputName = `converted-${Date.now()}.${targetFormat}`;
        const outputDir = path.join(process.cwd(),"public","uploads");
        const outputPath = path.join(outputDir, outputName);

        if(!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir, {recursive: true});
        }
        const image = sharp(filePath);
        if(targetFormat === "png") await image.png().toFile(outputPath);
        if(targetFormat === "jpeg") await image.jpeg().toFile(outputPath);
        if(targetFormat === "jpg") await image.jpg().toFile(outputPath);
        if(targetFormat === "webp") await image.webp().toFile(outputPath);


        const fileRecord = await File.create({
            filename: req.file.originalname,
            filetype: req.file.mimetype,
            filesize:req.file.size,
            user_id: userID,
            converted_file_url:`/uploads/${outputName}`
        });
        await ConversionLog.create({
            file_id: fileRecord.id,
            target_format: targetFormat,
            status:"completed",
            converted_file_url:`/uploads/${outputName}`
        });

        fs.unlinkSync(filePath);

        res.status(200).json({
           message: "Image converted successfully",
           fileUrl: `/uploads/${outputName}`
});

    }catch(err) {
        res.status(500).json({message: err.message});
    }
};