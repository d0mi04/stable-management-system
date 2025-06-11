// AuthContext - mockowanie użytkowników
// tworzy kontekst AuthContext, w którym przechowywany jest aktualny użytkownik user
// udostępnia funkcje login (usrname, password) i logout() --> na razie logowania są ustawione na sztywno
// hook useAuth() umożliwia pobranie kontekstu w innych komponentach
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role'),
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username'),
    });

    useEffect(() => {
        if(auth.token) {
            localStorage.setItem('token', auth.token);
            localStorage.setItem('role', auth.role);
            localStorage.setItem('userId', auth.userId);
            localStorage.setItem('username', auth.username);
        } else {
            localStorage.clear();
        }
    }, [auth]);

    // const login = (username, password) => {
    //     const foundUser = mockUsers.find(
    //         (u) => u.username === username && u.password === password
    //     );
    //     if(foundUser) {
    //         setUser({
    //             username: foundUser.username, role: foundUser.role
    //         });
    //         return foundUser;
    //     }
    //     return null;
    // }

    // const logout = () => {
    //     localStorage.removeItem('user');
    //     setUser(null);
    // };

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

// hook do używania kontekstu w komponentach
export const useAuth = () => useContext(AuthContext);