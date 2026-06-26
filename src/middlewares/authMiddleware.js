import { verifyAccessToken } from "./../utils/jwtUtils.js";
import User from "../models/userModel.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  try {
    const decoded = verifyAccessToken(token);

    // Fetch the full user row so controllers have access to email, avatar, etc.
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "username", "email", "avatar", "auth_provider"],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};