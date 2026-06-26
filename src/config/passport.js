import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const avatarUrl = profile.photos?.[0]?.value;
        const displayName = profile.displayName?.replace(/\s+/g, "_").toLowerCase();

        // 1. User already registered via Google — just return them
        let user = await User.findOne({ where: { google_id: googleId } });
        if (user) return done(null, user);

        // 2. Same email exists (registered via username/password before)
        //    Link the Google account to existing user
        if (email) {
          user = await User.findOne({ where: { email } });
          if (user) {
            await user.update({ google_id: googleId, avatar_url: avatarUrl });
            return done(null, user);
          }
        }

        // 3. New user — create account
        // Username: use displayName, fallback to google_<id> if taken
        let username = displayName || `google_${googleId}`;
        const existing = await User.findOne({ where: { username } });
        if (existing) username = `${username}_${googleId.slice(-4)}`;

        user = await User.create({
          username,
          password: null, // OAuth user — no password
          google_id: googleId,
          email: email || null,
          avatar_url: avatarUrl || null,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;