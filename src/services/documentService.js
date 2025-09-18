import { exec } from "child_process";
import path from "path";
import fs from "fs";

const formatMap = {
  pdf: "pdf:writer_pdf_Export",

  // Word
  doc: "doc:MS Word 97",
  docx: "docx:MS Word 2007 XML",
  rtf: "rtf:Rich Text Format",

  // Excel
  xls: "xls:MS Excel 97",
  xlsx: "xlsx:Calc MS Excel 2007 XML",
  csv: "csv:Text - txt - csv (StarCalc)",

  // PowerPoint
  ppt: "ppt:MS PowerPoint 97",
  pptx: "pptx:Impress MS PowerPoint 2007 XML",

  // ODF (OpenDocument formats)
  odt: "odt:writer8",
  ods: "ods:calc8",
  odp: "odp:impress8",

  // Text/HTML/Markdown
  txt: "txt:Text",
  html: "html:HTML (StarWriter)",
  md: "txt:Text", // LibreOffice doesn't support md directly → best is plain text
};

export const convertDocument = (inputPath, targetFormat) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.resolve("public/uploads");
    const filter = formatMap[targetFormat] || targetFormat;
    const command = `soffice --headless --convert-to ${filter} "${inputPath}" --outdir "${outputDir}"`;
    console.log(`🚀 Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ EXEC FAILED:", error);
        return reject(error);
      }
      if (stderr) {
        // Stderr hamesha error nahi hota, kabhi-kabhi sirf warning hoti hai
        console.warn("⚠️ STDERR:", stderr);
      }

      console.log("✅ Command executed, checking for output file...");

      try {
        const originalBase = path.basename(inputPath, path.extname(inputPath));
        const files = fs.readdirSync(outputDir);
        console.log("📂 Files in output directory:", files);

        const convertedFile = files.find(
          (f) =>
            f.startsWith(originalBase) &&
            f.toLowerCase().endsWith(`.${targetFormat}`)
        );

        if (!convertedFile) {
          return reject(
            new Error("Conversion failed: Output file not found by the script.")
          );
        }

        const convertedPath = path.join(outputDir, convertedFile);
        console.log(`🎉 Found converted file: ${convertedPath}`);
        resolve({ convertedPath });
      } catch (readDirError) {
        console.error("❌ Failed to read output directory:", readDirError);
        reject(readDirError);
      }
    });
  });
};
