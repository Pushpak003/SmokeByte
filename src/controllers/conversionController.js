import { conversionService } from "../services/conversionService.js";

// Single controller handles image, document, and media —
// category is set by the route (req.conversionCategory)
export const convertFile = async (req, res, next) => {
  try {
    const { jobId } = await conversionService.queueConversion({
      file: req.file,
      targetFormat: req.body.targetFormat,
      userId: req.user.id,
      category: req.conversionCategory, // set by setCategory middleware in routes
    });

    res.status(200).json({
      message: "Conversion job queued",
      jobId,
    });
  } catch (err) {
    // Clean up temp file if upload failed before unlinkSync in service
    if (req.file?.path) {
      import("fs").then((fs) => fs.default.unlink(req.file.path, () => {}));
    }
    next(err);
  }
};

export const getStatus = async (req, res, next) => {
  try {
    const result = await conversionService.getStatus(req.params.jobId);
    if (!result) {
      return res.status(404).json({ status: "not_found", message: "Job not found" });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
};