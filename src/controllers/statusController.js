import ConversionLog from "../models/conversionLogs.js";
import File from "../models/fileModel.js";
export const getConversionStatus = async (req, res) => {
  try {
    

    const log = await ConversionLog.findOne({
      where: {
        bullmq_job_id: String(req.params.jobId),
      },
      include: [{
        model: File,
        where: {
          user_id: req.user.id,
        },
        attributes: [],
      }],
    });


    if (!log) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    return res.json({
      status: log.status,
      fileUrl: log.converted_file_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
};
