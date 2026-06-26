import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import LoadingSpinner from '../snippets/LoadingSpinner';
import axiosInstance from './Axios';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [token, setToken, removeToken] = useLocalStorage('auth_token', null, { raw: true });
	const navigate = useNavigate();

	const fetchUserData = useCallback(async () => {
		if (!token) {
			setLoading(false);
			setUser(null);
			return;
		}

		setLoading(true); // Ensure loading is true when fetching starts
		try {
			const res = await axiosInstance.get(`/users/current/`);
            console.log('updated context: ' + res)
			setUser(res.data);
		} catch (err) {
			console.error('Session invalid:', err);
			if (err.response?.status === 401 || err.response?.status === 403) {
				logout();
			}
		} finally {
			setLoading(false);
		}
	}, [token]);

	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	const login = (newToken, redirectTo = '/') => {
		setLoading(true); // Block ProtectedRoutes from redirecting during fetch
		setToken(newToken);
		// The useEffect will pick up the token change and call fetchUserData
		navigate(redirectTo, { replace: true });
	};

	const logout = async () => {
		try {
			await axiosInstance.post('/auth/logout/');
		} catch (error) {
			console.error('Logout API error:', error);
		} finally {
			setUser(null);
			removeToken();
			setLoading(false);
			navigate('/login');
		}
	};

	// We provide an 'isInitialLoading' flag so ProtectedRoutes knows
	// the difference between "not logged in" and "still checking".
	const contextValue = {
		user,
		setUser,
		login,
		logout,
		isAuthenticated: !!user,
		loading, // Pass the loading state to the context
	};

	// Show loading if we are fetching user data
	if (loading) return <LoadingSpinner />;

	return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};
