import File from "../models/fileModel.js";
import ConversionLog from "../models/conversionLogs.js";
import sequelize from "../config/db.js";
import { CONVERSION_STATUS } from "../constants/index.js";

export const fileRepository = {
  // Create File + ConversionLog atomically in one transaction
  async createFileWithLog({ filename, filetype, filesize, userId, jobId, targetFormat }) {
    const transaction = await sequelize.transaction();
    try {
      const file = await File.create(
        { filename, filetype, filesize, user_id: userId, converted_file_url: null },
        { transaction }
      );

      const log = await ConversionLog.create(
        {
          bullmq_job_id: String(jobId),
          file_id: file.id,
          target_format: targetFormat,
          status: CONVERSION_STATUS.PENDING,
          converted_file_url: null,
        },
        { transaction }
      );

      await transaction.commit();
      return { file, log };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  findLogByJobId(jobId) {
    return ConversionLog.findOne({ where: { bullmq_job_id: String(jobId) } });
  },

  updateLogStatus(log, status, extra = {}) {
    return log.update({ status, ...extra });
  },

  updateFileUrl(file, url) {
    return file.update({ converted_file_url: url });
  },

  // History — all files for a user with their conversion logs
  getUserHistory(userId) {
    return File.findAll({
      where: { user_id: userId },
      include: [
        {
          model: ConversionLog,
          attributes: ["id", "target_format", "status", "converted_file_url", "created_at"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 50,
    });
  },

  // Crash recovery — reset stale processing logs on worker startup
  resetStaleProcessingLogs() {
    return ConversionLog.update(
      {
        status: CONVERSION_STATUS.FAILED,
        error_message: "Worker restarted — job was interrupted",
      },
      { where: { status: CONVERSION_STATUS.PROCESSING } }
    );
  },
};