import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Add Link import
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth(); // to dokładam pobranie usera
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = await login(email, password);
        if (user) {
            if(user.role === 'admin') {
                navigate('/admin/horses', { replace: true }); // przenosi na dashboard
            } else {
                navigate('/user', { replace: true }); // a to przenosi na user home
            }
        } else {
            setError('☹️ Invalid email or password!')
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Stable Manager</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    {error && <p className="text-red-600 text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition duration-200"
                    >
                        Log in
                    </button>
                    
                    <p className="text-center text-sm mt-4">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-600 hover:underline font-medium">
                            Register
                        </Link>
                    </p>
                </form>
                
            </div>
        </div>
    );
};

export default Login;