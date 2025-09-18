import { addToQueue } from "../jobs/conversionQueue.js";
import { uploadFileToSupabase } from "../services/storageService.js";
import fs from "fs";


export const documentConversionController = async (req, res) => {
  try {
   
    const targetFormat = req.body.targetFormat?.toLowerCase();
    const allowedFormats = ["pdf", "txt", "odt", "doc", "docx", "html"];
    if (!allowedFormats.includes(targetFormat)) {
      return res.status(400).json({ message: "Invalid target format" });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const fileUrl = await uploadFileToSupabase(req.file.path, fileName);

    fs.unlinkSync(req.file.path);
    
   const job = await addToQueue({
  fileUrl,
  targetFormat,
  userId: req.user.id,
  originalName: req.file.originalname,
  fileType: req.file.mimetype,
  mimeType: req.file.mimetype,
  fileSize: req.file.size,
});

    res.status(200).json({
      message: "Document conversion job added to queue",
      jobId: job.id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};