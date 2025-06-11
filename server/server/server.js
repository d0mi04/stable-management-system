const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');

// adding routes files:
const stallRoutes = require('./routes/stalls');
const horseRoutes = require('./routes/horses');
const staffRoutes = require('./routes/staff');
const stableRoutes = require('./routes/stables');
const horseActivityRoutes = require('./routes/horseActivities');
const expenseRoutes = require('./routes/expenses');

// authorization:
const authRoutes = require('./routes/auth');

// 🇬 używanie autoryzacji Google: 
const oauthRoutes = require('./routes/oauth');

const app = express();
app.use(cors());
app.use(express.json());

// 🇬 do logowania Google:
app.use(passport.initialize());

// mongoDB connection:
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// using routes:
app.use('/oauth', oauthRoutes); // 🇬 logowanie google
app.use('/auth', authRoutes);
app.use('/stalls', stallRoutes);
app.use('/horses', horseRoutes);
app.use('/staff', staffRoutes);
app.use('/stables', stableRoutes);
app.use('/horseActivities', horseActivityRoutes);
app.use('/expenses', expenseRoutes);

// start:
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serwer is running on port ${PORT}`));