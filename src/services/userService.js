import { fileRepository } from "../repositories/fileRepository.js";

export const userService = {
  getProfile(user) {
    return { id: user.id, username: user.username };
  },

  getHistory(userId) {
    return fileRepository.getUserHistory(userId);
  },
};