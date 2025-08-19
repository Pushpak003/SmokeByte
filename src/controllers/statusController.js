import ConversionLog from "../models/conversionLogs.js";

export const getConversionStatus = async (req, res) => {
  try {
    const log = await ConversionLog.findOne({
      where: { id: req.params.jobId },
      user_id:req.user.id
    });

    if (!log) return res.status(404).json({ message: "Job not found" });

    res.json({
      status: log.status,
      fileUrl: log.converted_file_url,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
