const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  date: String, // np. "Mon Jun 09 2025"
});

module.exports = mongoose.model("Event", eventSchema);
