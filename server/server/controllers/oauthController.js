const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.googleCallback = async (req, res) => {
    try {
        // użytkownik powinien być już zalogowany przez Google:
        const user = req.user;

        if(!user) {
            return res.status(401).send('User not authenticated');
        }

        // wygenerowanie JWT:
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

        // tu jest wysyłanie danych do frontendu za pomocą window.postMessage
        res.send(`
            <script>
                window.opener.postMessage(
                    ${JSON.stringify({
                        token,
                        username: user.username,
                        userId: user._id,
                        role: user.role,
                    })},
                    "http://localhost:3000"    
                );
                window.close();
            </script>
        `);
    } catch (err) {
        console.error('Google login callback error:', err);
        res.status(500).send('Internal Server Error');
    }
};