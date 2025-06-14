const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// Pobierz wydarzenia dla konkretnej daty z wypełnionym horseId (populate)
router.get("/:date", async (req, res) => {
  try {
    const events = await Event.find({ date: req.params.date }).populate(
      "horseId"
    );
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// routes/events.js
router.get("/:date/:ownerId", async (req, res) => {
  try {
    const events = await Event.find({ date: req.params.date })
      .populate("horseId")
      .exec();

    // Filtrowanie wydarzeń, których koń ma ownera o podanym ID
    const filtered = events.filter(
      (ev) => String(ev.horseId?.owner) === String(req.params.ownerId)
    );

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dodaj wydarzenie z horseId
router.post("/", async (req, res) => {
  const { date, title, hour, location, duration, horseId } = req.body;
  const newEvent = new Event({ date, title, hour, location, duration, horseId });

  try {
    const savedEvent = await newEvent.save();
    // Populate the horseId field before returning
    const populatedEvent = await Event.findById(savedEvent._id).populate(
      "horseId"
    );
    res.status(201).json(populatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Usuń wydarzenie
router.delete("/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
