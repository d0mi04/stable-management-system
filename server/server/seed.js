require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import your Mongoose models here
const User = require('./models/User');
const Horse = require('./models/Horse');
const Stable = require('./models/Stable');
const Stall = require('./models/Stall');
const Staff = require('./models/Staff');
const Expense = require('./models/Expense');
const Event = require('./models/Event');
const HorseActivity = require('./models/HorseActivity');

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  // Clear collections
  await User.deleteMany({});
  await Horse.deleteMany({});
  await Stable.deleteMany({});
  await Stall.deleteMany({});
  await Staff.deleteMany({});
  await Expense.deleteMany({});
  await Event.deleteMany({});
  await HorseActivity.deleteMany({});

  // Insert Users
  const users = await User.insertMany([
    {
      email: "admin@example.com",
      username: "admin",
      password: bcrypt.hashSync("admin123", 10), // valid bcrypt hash for "admin123"
      role: "admin",
      myHorses: []
    },
    {
      email: "user@example.com",
      username: "user",
      password: bcrypt.hashSync("user123", 10), // valid hash for user password, e.g., "user123"
      role: "user",
      myHorses: []
    }
  ]);

  // Insert Stable
  const stable = await Stable.create({
    name: "Sunny Stables",
    location: "Countryside",
    capacity: 20,
    description: "Spacious and modern stable.",
    stallArray: []
  });

  // Insert Horses
  const horses = await Horse.insertMany([
    {
      name: "Thunderbolt",
      birthDate: new Date("2018-05-10"),
      breed: "Arabian",
      notes: "Fast and energetic.",
      owner: users[1]._id,
      ownerEmail: users[1].email,
      stallId: null,
      status: "waiting for stall"
    },
    {
      name: "Bella",
      birthDate: new Date("2019-03-15"),
      breed: "Friesian",
      notes: "Calm and friendly.",
      owner: users[1]._id,
      ownerEmail: users[1].email,
      stallId: null,
      status: "waiting for stall"
    }
  ]);

  // Insert Stalls
  const stalls = await Stall.insertMany([
    {
      stableId: stable._id,
      size: "large",
      status: "available",
      horseId: null
    },
    {
      stableId: stable._id,
      size: "medium",
      status: "available",
      horseId: null
    }
  ]);

  // Insert Staff
  await Staff.insertMany([
    {
      name: "Jan Kowalski",
      phone: 123456789,
      email: "jan.kowalski@example.com",
      role: "groomer",
      specialities: ["feeding", "cleaning"],
      schedule: ["Monday", "Wednesday", "Friday"]
    }
  ]);

  // Insert Expense
  await Expense.insertMany([
    {
      date: new Date("2024-06-01"),
      type: "expense",
      category: "horse food",
      relatedTo: null,
      relatedModel: null,
      amount: 500,
      settled: false,
      description: "Monthly horse food"
    }
  ]);

  // Insert Event
  await Event.insertMany([
    {
      title: "Vet Visit",
      date: "Mon Jun 10 2024",
      horseId: horses[0]._id
    }
  ]);

  // Insert HorseActivity
  await HorseActivity.insertMany([
    {
      horseId: horses[0]._id,
      date: new Date("2024-06-15T14:00:00.000Z"),
      durationMinutes: 60,
      allDay: false,
      type: "training",
      notes: "Jumping practice"
    }
  ]);

  console.log('Mock data inserted!');
  mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
});