import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = "https://c8d008ddd407.ngrok-free.app";

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_confirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== password_confirmation) {
            setError("Passwords do not match.");
            return;
        }
        try {
            const response = await axios.post(`${API_BASE_URL}/api/register`, { name, email, password, password_confirmation });
             
            localStorage.setItem('authToken', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/'); 
            window.location.reload();

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded" required/>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded" required/>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded" required/>
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2">Confirm Password</label>
                        <input type="password" value={password_confirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded" required/>
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Register
                    </button>
                     <p className="text-center mt-4">
                        Already have an account? <a href="/login" className="text-blue-400 hover:underline">Log in</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;