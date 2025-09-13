import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { toast } from 'sonner';
export default function LoginPage() {
    const { login, loginGoogle, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            toast.success('Login successful!');
            navigate('/'); // redirect to homepage or dashboard
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const success = await loginGoogle('/');
            if (success) {
                toast.success('Logged in with Google!');
                navigate('/');
            }
        } catch (err) {
            console.error('Google login failed:', err);
            toast.error('Google login failed. Please try again.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 text-sm font-medium">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 text-sm font-medium">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className="mt-6 flex items-center">
                <div className="flex-grow h-px bg-gray-300" />
                <span className="px-3 text-gray-500 text-sm">OR</span>
                <div className="flex-grow h-px bg-gray-300" />
            </div>
            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
                <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google Logo"
                    className="w-5 h-5"
                />
                {loading ? 'Signing in...' : 'Continue with Google'}
            </button>
        </div>
    );
}
