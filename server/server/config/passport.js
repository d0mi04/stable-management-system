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
        // najpierw trzeba znaleźć po googleID czy taki użytkownik już istnieje
        let user = await User.findOne({ googleID: profile.id });

        // jeśli użytkownik już się logował przez google
        if(user) {
            return done(null, user);
        }

        // jeśli użytkownik nie logował się przez google, to sprawdzamy, czy jest w bazie user z takim mailem:
        const existingUser = await User.findOne({ email: profile.emails[0].value });

        if(existingUser) {
            // jak user istnieje, to go aktualizujemy o dane do logowania za pomocą Google
            existingUser.googleId = profile.id;
            await existingUser.save();
            return done(null, existingUser);
        }

        // zupełnie nowy user - dopiero tworzymy konto:
        const newUser = new User({
            googleID: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            role: 'user'
        });
        await newUser.save();
        done(null, newUser);
    } catch (err) {
        done(err, null);
    }
}));