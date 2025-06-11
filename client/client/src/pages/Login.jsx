import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
           const res = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
           });

           const data = await res.json();

           if(!res.ok) {
            setError(data.message || 'Login failed');
            return;
           }

           // zapisanie tokena i danych użytkownika
           localStorage.setItem('token', data.token);
           localStorage.setItem('username', data.username);
           localStorage.setItem('userId', data.userId);
           localStorage.setItem('role', data.role);

           if(data.role === 'admin') {
            navigate('/admin', { replace: true });
           } else {
            navigate('/user', { replace: true });
           }
        } catch (err) {
            setError('Server error during login');
        }
    };

    const handleGoogleLogin = () => {
        // otwieranie popup z Google OAuth z backendu
        const googleLoginWindow = window.open(
            'http://localhost:5000/oauth/google', // endpoint Google OAuth
            '_blank',
            'width=500,height=600'
        );

        // teraz odbiór wiadomości z tokenem z backendu:
        window.addEventListener('message', (event) => {
            if(event.origin !== 'http://localhost:5000') {
                return; // zabezpieczenie jeśli przekierowanie następuje z innej strony niż nasza aplikacja
            }

            const { token, userId, username, role } = event.data;

            if(token) {
                localStorage.setItem('token', token);
                localStorage.setItem('username', username);
                localStorage.setItem('userId', userId);
                localStorage.setItem('role', role);

                if(role === 'admin') {
                    navigate('/admin', { replace: true });
                } else {
                    navigate('/user', { replace: true });
                }
            } else {
                setError('Login with Google failed');
            }
        });
    };
    

    return (
        <div style={{
            maxWidth: '400px',
            margin: '100px auto'
        }}>
            <h2>Login Page</h2>
            <form onSubmit={handleEmailLogin}>
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{color: 'red'}}>{error}</p>}
                <button type="submit">Login with email</button>
            </form>

            <hr />

            <button onClick={handleGoogleLogin} 
            style={{ 
                backgroundColor: '#4285F4', 
                color: 'white', 
                padding: '10px', 
                marginTop: '10px' 
            }}>
                Continue with Google
            </button>
        </div>
    );
};

export default Login;