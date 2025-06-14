const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// adding routes files:
const stallRoutes = require("./routes/stalls");
const horseRoutes = require("./routes/horses");
const eventsRouter = require("./routes/events");
const staffRoutes = require("./routes/staff");
const stableRoutes = require("./routes/stables");
const horseActivityRoutes = require("./routes/horseActivities");
const expenseRoutes = require("./routes/expenses");

// authorization:
const authRoutes = require("./routes/auth");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json());
// Content Security Policy middleware - commented out due to conflicts
// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://accounts.google.com; object-src 'none';"
//   );
//   next();
// });

// mongoDB connection:
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// using routes:
app.use("/auth", authRoutes);
app.use("/stalls", stallRoutes);
app.use("/horses", horseRoutes);
app.use("/events", eventsRouter);
app.use("/staff", staffRoutes);
app.use("/stables", stableRoutes);
app.use("/horseActivities", horseActivityRoutes);
app.use("/expenses", expenseRoutes);

// start:
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serwer is running on port ${PORT}`));
