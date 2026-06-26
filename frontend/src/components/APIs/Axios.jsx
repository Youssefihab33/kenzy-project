import axios from 'axios';

const backendUrl = import.meta.env?.VITE_BACKEND_URL || '';

const axiosInstance = axios.create({
	// Ensure the baseURL always has a trailing slash for Django/DRF compatibility
	baseURL: backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

/**
 * Request Interceptor
 * Automatically attaches the 'Token <key>' header if a token exists in localStorage.
 */
axiosInstance.interceptors.request.use(
	(config) => {
		// Using raw localStorage here as this file is outside the React component lifecycle
		const token = localStorage.getItem('auth_token');

		if (token) {
			// Ensure token is trimmed and formatted correctly for Django Knox/Authtoken
			const cleanToken = token.replace(/['"]+/g, '');
			config.headers.Authorization = `Token ${cleanToken}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

/**
 * Response Interceptor
 * Handles global error states, specifically 401 Unauthorized.
 */
axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			// Don't clear token if we are already on the login page to avoid loops
			if (!window.location.pathname.includes('/login')) {
				console.warn('Session expired or unauthorized. Cleaning up...');
				localStorage.removeItem('auth_token');

				// Optional: Force a hard reload to reset the React state or redirect
				window.location.href = '/login';
			}
		}

		if (error.code === 'ECONNABORTED') {
			console.error('Request timed out. Please check your connection.');
		}

		return Promise.reject(error);
	},
);

export default axiosInstance;
