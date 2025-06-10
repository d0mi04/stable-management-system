const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  date: String, // np. "Mon Jun 09 2025"
  horseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Horse",
    required: false,
  },
});

module.exports = mongoose.model("Event", eventSchema);
