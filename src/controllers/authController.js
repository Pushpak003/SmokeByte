import User from "../models/userModel.js";
import RefreshToken from "../models/refreshTokenModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });

    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
    });
    const refreshToken = generateRefreshToken({
      id: user.id,
      username: user.username,
    });
    await RefreshToken.create({
      token: refreshToken,
      user_id: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);

    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username: username } });
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid Credentials" });

    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
    });
    const refreshToken = generateRefreshToken({
      id: user.id,
      username: user.username,
    });
    await RefreshToken.create({
      token: refreshToken,
      user_id: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    res.status(200).json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "No Refresh Token Provided" });

  try {
    const storedToken = await RefreshToken.findOne({
      where: {
        token: refreshToken,
      },
    });

    if (!storedToken) {
      return res.status(403).json({
        message: "Refresh token not found",
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      username: decoded.username,
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.status(403).json({ message: "Invalid Refresh Token" });
  }
};
export const logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      message: "No Refresh Token Provided",
    });
  }

  await RefreshToken.destroy({
    where: {
      token: refreshToken,
    },
  });

  return res.json({
    message: "Logged out successfully",
  });
};