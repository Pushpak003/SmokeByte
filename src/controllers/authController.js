import { authService } from "../services/authService.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils.js";
import { userRepository } from "../repositories/userRepository.js";

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

// Called after passport authenticates the Google user
export const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    const accessToken = generateAccessToken({ id: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ id: user.id, username: user.username });
    await userRepository.saveRefreshToken(user.id, refreshToken);

    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};