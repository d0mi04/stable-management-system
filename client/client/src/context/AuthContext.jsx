// AuthContext - mockowanie użytkowników
// tworzy kontekst AuthContext, w którym przechowywany jest aktualny użytkownik user
// udostępnia funkcje login (usrname, password) i logout() --> na razie logowania są ustawione na sztywno
// hook useAuth() umożliwia pobranie kontekstu w innych komponentach
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // mockowane dane użytkownika
    const mockUsers = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'user', password: 'user123', role: 'user'}
    ];

    const login = (username, password) => {
        const foundUser = mockUsers.find(
            (u) => u.username === username && u.password === password
        );
        if(foundUser) {
            setUser({
                username: foundUser.username, role: foundUser.role
            });
            return foundUser;
        }
        return null;
    }

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// hook do używania kontekstu w komponentach
export const useAuth = () => useContext(AuthContext);