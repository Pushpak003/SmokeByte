import bcrypt from "bcrypt";
import { userRepository } from "../repositories/userRepository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";

export const authService = {
  async register({ username, password }) {
    const existing = await userRepository.findByUsername(username);
    if (existing) throw Object.assign(new Error("User already exists"), { statusCode: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.createUser({ username, password: hashedPassword });

    return authService._issueTokens(user);
  },

  async login({ username, password }) {
    const user = await userRepository.findByUsername(username);
    if (!user) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

    if (!user.password) {
      throw Object.assign(
        new Error("This account uses Google Sign-In. Please login with Google."),
        { statusCode: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

    return authService._issueTokens(user);
  },

  async refresh(token) {
    if (!token) throw Object.assign(new Error("No refresh token provided"), { statusCode: 401 });

    const stored = await userRepository.findRefreshToken(token);
    if (!stored) throw Object.assign(new Error("Refresh token not found"), { statusCode: 403 });

    const decoded = verifyRefreshToken(token); // throws if invalid/expired
    const accessToken = generateAccessToken({ id: decoded.id, username: decoded.username });
    return { accessToken };
  },

  async logout(token) {
    if (!token) throw Object.assign(new Error("No refresh token provided"), { statusCode: 400 });
    await userRepository.deleteRefreshToken(token);
  },

  async handleGoogleUser(profile) {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const avatarUrl = profile.photos?.[0]?.value;
    const displayName = profile.displayName?.replace(/\s+/g, "_").toLowerCase();

    // Already registered via Google
    let user = await userRepository.findByGoogleId(googleId);
    if (user) return user;

    // Same email — link accounts
    if (email) {
      user = await userRepository.findByEmail(email);
      if (user) {
        await userRepository.updateUser(user, { google_id: googleId, avatar_url: avatarUrl });
        return user;
      }
    }

    // New user
    let username = displayName || `google_${googleId}`;
    const taken = await userRepository.findByUsername(username);
    if (taken) username = `${username}_${googleId.slice(-4)}`;

    return userRepository.createUser({
      username,
      password: null,
      google_id: googleId,
      email: email || null,
      avatar_url: avatarUrl || null,
    });
  },

  // Internal — issue both tokens and save refresh token to DB
  async _issueTokens(user) {
    const payload = { id: user.id, username: user.username };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await userRepository.saveRefreshToken(user.id, refreshToken);
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username },
    };
  },
};