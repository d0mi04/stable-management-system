import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth(); // to dokładam pobranie usera
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = login(username, password);
        if (user) {
            if(user.role === 'admin') {
                navigate('/admin', { replace: true }); // przenosi na dashboard
            } else {
                navigate('/user', { replace: true }); // a to przenosi na user home
            }
        } else {
            setError('☹️ Invalid username or password!')
        }
    };

    return (
        <div style={{
            maxWidth: '400px',
            margin: '100px auto'
        }}>
            <h2>Login Page</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;