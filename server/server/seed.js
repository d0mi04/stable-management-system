// If your .env file is in the project root, and you run this script from server/server/,
// you might need: require('dotenv').config({ path: '../../.env' });
require('dotenv').config(); 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import your Mongoose models here
// Ensure these paths are correct relative to this seed.js file.
// If models are in server/models/, use '../models/User', etc.
// If models are in project_root/models/, use '../../models/User', etc.
const User = require('./models/User');
const Horse = require('./models/Horse');
const Stable = require('./models/Stable');
const Stall = require('./models/Stall');
const Staff = require('./models/Staff');
const Expense = require('./models/Expense');
const Event = require('./models/Event');
const HorseActivity = require('./models/HorseActivity');

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not defined. Please check your .env file.');
    process.exit(1);
  }
  try {
    // Mongoose 6+ uses these options by default
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (err) {
    console.error('MongoDB connection error for seeding:', err.message);
    process.exit(1);
  }
};

const seedData = async () => {
    try {
        await connectDB(); // Ensure connection is established before proceeding

        // Clear existing data
        await Stable.deleteMany();
        await Stall.deleteMany();
        await User.deleteMany();
        await Horse.deleteMany();

        console.log('Data cleared...');

        // Create Users
        const user1 = await User.create({
            username: 'adminUser',
            email: 'admin@example.com',
            password: bcrypt.hashSync("admin123", 10), // Password will be hashed by pre-save hook in User model
            role: 'admin',
        });

        const user2 = await User.create({
            username: 'staffUser',
            email: 'staff@example.com',
            password: bcrypt.hashSync("staff123", 10), // Password will be hashed by pre-save hook in User model
            role: 'user',
        });

        console.log('Users created...');

        // Create Stables
        const stable1 = await Stable.create({
            fullName: 'Sunset Meadows',
            location: 'Valley View',
            capacity: 20,
            description: 'Scenic and spacious stables.',
            stallSize: 'large', 
            managedBy: user1._id,
        });

        const stable2 = await Stable.create({
            fullName: 'Green Pastures',
            location: 'Hilltop Ranch',
            capacity: 15,
            description: 'Quiet and serene environment for horses.',
            stallSize: 'medium', 
            managedBy: user1._id,
        });
        
        const stable3 = await Stable.create({
            fullName: 'North Ridge',
            location: 'Mountain Trail',
            capacity: 10,
            description: 'Cozy stables with access to trails.',
            stallSize: 'medium',
            managedBy: user2._id,
        });

        console.log('Stables created...');

        // Create Stalls
        const stall1_1 = await Stall.create({
            name: `1-${stable1.fullName}`,
            number: 1,
            stableId: stable1._id,
            size: 'large',
            status: 'available',
        });

        const stall1_2 = await Stall.create({
            name: `2-${stable1.fullName}`,
            number: 2,
            stableId: stable1._id,
            size: 'large',
            status: 'occupied',
        });
        
        const stall1_3 = await Stall.create({
            name: `3-${stable1.fullName}`,
            number: 3,
            stableId: stable1._id,
            size: 'large',
            status: 'maintenance',
        });

        const stall2_1 = await Stall.create({
            name: `1-${stable2.fullName}`,
            number: 1,
            stableId: stable2._id,
            size: 'medium',
            status: 'available',
        });
        
        const stall3_1 = await Stall.create({
            name: `1-${stable3.fullName}`,
            number: 1,
            stableId: stable3._id,
            size: 'medium',
            status: 'available',
        });

        console.log('Stalls created...');

        // Create Horses
        const horse1 = await Horse.create({
            name: 'Spirit',
            breed: 'Mustang',
            birthDate: new Date(new Date().setFullYear(new Date().getFullYear() - 5)), // Age 5
            owner: user1._id,
            ownerEmail: user1.email, // Assuming User schema has email
            stallId: stall1_2._id, 
            notes: 'Special Needs: None. Feed Instructions: Standard feed twice a day. Medications: None.',
            status: 'stall granted', // Example valid status
        });

        const horse2 = await Horse.create({
            name: 'Comet',
            breed: 'Thoroughbred',
            birthDate: new Date(new Date().setFullYear(new Date().getFullYear() - 7)), // Age 7
            owner: user2._id,
            ownerEmail: user2.email, // Assuming User schema has email
            stallId: stall2_1._id, 
            notes: 'Special Needs: Requires daily leg wraps. Feed Instructions: High-protein feed. Medications: Daily joint supplement.',
            status: 'stall granted', // Example valid status
        });
        
       
        
        await Stall.findByIdAndUpdate(stall2_1._id, { status: 'occupied' });

        console.log('Horses created...');
        console.log('Seed data imported successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    } finally {
        // Ensure the connection is closed whether seeding succeeds or fails
        if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) { // 1 = connected, 2 = connecting
            await mongoose.connection.close();
            console.log('MongoDB connection closed.');
        }
    }
};

seedData();