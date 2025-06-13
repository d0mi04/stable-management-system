import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok && data.token) {
                const token = data.token.replace(/^Bearer\s/, '');
                localStorage.setItem('token', token);
                const userObj = {
                    userId: data.userId,
                    username: data.username,
                    role: data.role,
                    email: data.email
                };
                setUser(userObj);
                localStorage.setItem('user', JSON.stringify(userObj));
                return userObj;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (err) {
            return null;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);