const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// Pobierz wydarzenia dla konkretnej daty
router.get("/:date", async (req, res) => {
  try {
    const events = await Event.find({ date: req.params.date });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dodaj wydarzenie
router.post("/", async (req, res) => {
  const { date, title } = req.body;
  const newEvent = new Event({ date, title });

  try {
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
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
