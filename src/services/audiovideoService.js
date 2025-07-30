import ffmpeg from '../config/ffmpeg.js';
import path from 'path';

export const convertMedia = async (inputPath, outputFormat) =>{
    return new Promise((resolve, reject) => {
        const outputPath = path.join("public/uploads", `converted-${Date.now()}.${outputFormat}`);
        ffmpeg(inputPath)
          .toFormat(outputFormat)
          .on("end",()=> resolve({ outputPath}))
          .on("error",reject)
          .save(outputPath);

    });
};