const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  date: String, // np. "Mon Jun 09 2025"
  hour: {
    type: String,
    required: true,
    default: "09:00",
  },
  location: {
    type: String,
    required: true,
    enum: ["Krakow", "Gdansk", "Warszawa", "Poznan", "Wroclaw"],
    default: "Warszawa",
  },
  duration: {
    type: Number,
    required: true,
    default: 1,
    min: 0.5,
    max: 24
  },
  horseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Horse",
    required: false,
  },
});

module.exports = mongoose.model("Event", eventSchema);
