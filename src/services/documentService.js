import { exec } from 'child_process';
import  path from 'path';

export const convertDocument = (inputPath, targetFormat) => {
    return new Promise((resolve, reject)=>{
        const outputDir = path.resolve("public/uploads");
        const command = `soffice --headless --convert-to ${targetFormat}"${inputPath}" --outdir ${outputDir}`;


        exec(command,(error)=> {
            if (error) return reject(error);

            const originalBase = path.basename(inputPath, path.extname(inputPath));
            const covnertedPath = path.join(outputDir, `${originalBase}.${targetFormat}`);

            resolve({convertedPath});
        });
    });
};

