import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config.js";
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },
    (_, __, profile, done) => {
      // Here, you would typically find or create a user in your database
      return done(null, profile);
    },
  ),
);
export default passport;
