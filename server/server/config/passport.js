const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
// const jwt = require('jsonwebtoken');

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/oauth/google/callback'
    }, 
    async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleID: profile.id });

        if(!user) {
            user = new User({
                googleID: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                role: 'user'
            });
            await user.save();
        }

        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));