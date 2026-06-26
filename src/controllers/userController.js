import { userService } from "../services/userService.js";

export const getProfile = async (req, res, next) => {
  try {
    res.json(userService.getProfile(req.user));
  } catch (err) {
    next(err);
  }
};

export const getUserHistory = async (req, res, next) => {
  try {
    const data = await userService.getHistory(req.user.id);
    res.json({ message: "History fetched", data });
  } catch (err) {
    next(err);
  }
};