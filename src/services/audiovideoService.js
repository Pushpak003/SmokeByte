import ffmpeg from '../config/ffmpeg';
import path from 'path';

export const convertMedia = async (inputPath, outputFormat) =>{
    return new Promise((resolve, reject) => {
        const outputName = `converted-${Date.now()}.${outputFormat}`;
        const outputPath = path.join("public/uploads", outputName);

        ffmpeg(inputPath)
          .toFormat(outputFormat)
          .on("end",()=> resolve({ outputName}))
          .on("error",reject)
          .save(outputPath);

    });
};