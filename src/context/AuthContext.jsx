import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// IMPORTANT: Set this! It should be the same URL as in your LoginPage.jsx
const API_BASE_URL = "https://c8d008ddd407.ngrok-free.app"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
       
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
        }
       
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login`, { email, password });
            
            // Set the token and user data in state and localStorage
            const newToken = response.data.access_token;
            const userData = response.data.user;

            setToken(newToken);
            setUser(userData);
            setIsAuthenticated(true);

            localStorage.setItem('authToken', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            return { success: true };
        } catch (err) {
            console.error('Login failed:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to login. Please check your credentials.' };
        }
    };

    const logout = () => {
        // Clear state and localStorage
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    // The value that will be exposed to components that use this context
    const value = {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};