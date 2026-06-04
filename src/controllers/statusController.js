import ConversionLog from "../models/conversionLogs.js";
import File from "../models/fileModel.js";
export const getConversionStatus = async (req, res) => {
  try {
    const log = await ConversionLog.findOne({
      where: { id: req.params.id },
      include: [{
        model: File,
        where: {
          user_id: req.user_id,
        },
        attributes: [],
      }],
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
