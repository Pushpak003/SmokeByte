import User from "../models/userModel.js";
import RefreshToken from "../models/refreshTokenModel.js";
import { REFRESH_TOKEN_TTL_MS } from "../constants/index.js";

export const userRepository = {
  findByUsername(username) {
    return User.findOne({ where: { username } });
  },

  findByGoogleId(googleId) {
    return User.findOne({ where: { google_id: googleId } });
  },

  findByEmail(email) {
    return User.findOne({ where: { email } });
  },

  findById(id) {
    return User.findByPk(id);
  },

  createUser(data) {
    return User.create(data);
  },

  updateUser(user, data) {
    return user.update(data);
  },

  // Refresh tokens
  saveRefreshToken(userId, token) {
    return RefreshToken.create({
      token,
      user_id: userId,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
  },

  findRefreshToken(token) {
    return RefreshToken.findOne({ where: { token } });
  },

  deleteRefreshToken(token) {
    return RefreshToken.destroy({ where: { token } });
  },
};