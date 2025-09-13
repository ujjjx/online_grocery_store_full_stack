import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, checkAuthStatus, loginWithGoogle } from '../api/authApi';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Check session on mount
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const savedUser = localStorage.getItem('grocery_user');
                if (savedUser) {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch {
                        localStorage.removeItem('grocery_user');
                    }
                }

                const authStatus = await checkAuthStatus();
                if (authStatus.authenticated && authStatus.user) {
                    setUser(authStatus.user);
                    localStorage.setItem('grocery_user', JSON.stringify(authStatus.user));
                } else {
                    setUser(null);
                    localStorage.removeItem('grocery_user');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
                localStorage.removeItem('grocery_user');
            } finally {
                setLoading(false);
            }
        };

        checkUserSession();
    }, []);

    // ✅ Normal login OR Google login use the same structure
    const handleLoginResponse = (response) => {
        if (response.success && response.user) {
            const u = {
                id: response.user.customer_id || response.user.id,
                name: response.user.name,
                email: response.user.email,
                picture_url: response.user.picture_url || null,
            };
            setUser(u);
            localStorage.setItem('grocery_user', JSON.stringify(u));
            return true;
        }
        return false;
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await loginUser({ email, password });
            return handleLoginResponse(response);
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const loginGoogle = async (redirectTo = '/') => {
        setLoading(true);
        try {
            const response = await loginWithGoogle(redirectTo);
            return handleLoginResponse(response);
        } catch (error) {
            console.error('Google login error:', error);
            toast.error(typeof error === 'string' ? error : 'Google login failed.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, address, contact) => {
        setLoading(true);
        try {
            const response = await registerUser({ name, email, password, address, contact });
            return handleLoginResponse(response);
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Registration failed.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (user?.id) {
                await logoutUser(user.id);
                toast.success("Logged out successfully! 👋");
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error("Logout failed. Please try again.");
        } finally {
            setUser(null);
            localStorage.removeItem('grocery_user');
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginGoogle, // ✅ cleaner name
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
