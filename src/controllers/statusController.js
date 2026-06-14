import ConversionLog from "../models/conversionLogs.js";
import File from "../models/fileModel.js";
export const getConversionStatus = async (req, res) => {
  try {
    

    const log = await ConversionLog.findOne({
      where: {
        bullmq_job_id: String(req.params.jobId),
      },
       
    });
    console.log("JOB ID:", req.params.jobId);
    console.log("FOUND LOG:", log);



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
