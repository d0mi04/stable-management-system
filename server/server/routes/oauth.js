const express = require('express');
const passport = require('passport');
const oauthController = require('../controllers/oauthController');
// require('../config/passport');
// const jwt = require('jsonwebtoken');

const router = express.Router();

// teraz endpoint do przekierowania na google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// callback po autoryzacji z Google
router.get(
    '/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login' }), 
    oauthController.googleCallback 
);

module.exports = router;