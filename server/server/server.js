const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const horseRoutes = require('./routes/horses');

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get('/', (req, res) => {
    res.send('Stable Manager API')
});

// mongoDB connection:
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    })
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.use('/horses', horseRoutes);

// start:
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serwer is running on port ${PORT}`));