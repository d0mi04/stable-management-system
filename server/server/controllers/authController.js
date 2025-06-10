const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({
                message: '🤷‍♀️ User already exists!'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            username,
            password: passwordHash,
            role: 'user' // admin jest tworzony na sztywno w bazie
        });

        await newUser.save();

        res.status(201).json({
            message: '🍏 User registered successfully!'
        });
    } catch (err) {
        res.status(500).json({
            message: '🖥 Server error during registration',
            error: err.message
        })
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        const isValid = await bcrypt.compare(password, user.password);
        if(!user || !isValid) {
            return res.status(400).json({
                message: '🤷‍♀️ Invalid email or password!'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role // to potrzeba żeby mógł wchodzić do flow dla admina
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.status(200).json({
            message: '🍏 Login successful!',
            userId: user._id,
            username: user.username,
            token: `Bearer ${token}`
        });
    } catch (err) {
        req.status(500).json({
            message: '🖥 Internal error during login',
            error: err.message
        });
    }
};