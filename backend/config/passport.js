const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'DUMMY_CLIENT_ID',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'DUMMY_CLIENT_SECRET',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(`Google login attempt for email: ${profile.emails[0]?.value}`);
        // Tìm user theo googleId hoặc email
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Kiểm tra email đã tồn tại chưa
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Liên kết Google ID với account hiện tại
            user.googleId = profile.id;
            if (!user.avatar) user.avatar = profile.photos[0]?.value;
            await user.save();
          } else {
            // Tạo user mới từ Google
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0]?.value,
              isEmailVerified: true,
              role: 'customer',
            });
          }
        }

        return done(null, user);
      } catch (error) {
        logger.error(`Google OAuth error: ${error.message}`);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
