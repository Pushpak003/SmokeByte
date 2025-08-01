import { addToQueue } from "../jobs/conversionQueue.js";


export const mediaConversionController = async (req, res) => {
  try {
    const targetFormat = req.body.targetFormat?.toLowerCase();
    const allowedFormats = ["mp3", "wav", "mp4", "avi", "mov", "webm"];
    if (!allowedFormats.includes(targetFormat)) {
      return res.status(400).json({ message: "Invalid target format" });
    }

  const job =   await addToQueue({
  filePath: req.file.path,
  targetFormat,
  userId: req.user.id,
  originalName: req.file.originalname,
  fileType: req.file.mimetype,
  mimeType: req.file.mimetype,
  fileSize: req.file.size,
  });

    res.status(200).json({
      message: "Media conversion job added to queue",
      jobId: job.id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
