import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const convertImageFile = async(inputPath,targetFormat) => {
    const allowedFormats = ["png","jpeg","jpg","webp"];
        if(!allowedFormats.includes(targetFormat)){
            fs.unlinkSync(inputPath);
            return res.status(400).json({message:"Invalid Format"});
        }
        
        const extension = targetFormat === "jpg" ? "jpeg": targetFormat;

        const outputName = `converted-${Date.now()}.${targetFormat}`;
        const outputDir = path.join(process.cwd(),"public","uploads");
        const outputPath = path.join(outputDir, outputName);

        if(!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir, {recursive: true});
        }
        const image = sharp(inputPath);
        if(extension === "png") await image.png().toFile(outputPath);
        if(extension === "jpeg") await image.jpeg().toFile(outputPath);
        if(extension === "jpg") await image.jpg().toFile(outputPath);
        if(extension === "webp") await image.webp().toFile(outputPath);

        fs.unlinkSync(inputPath);


        return outputPath;
};