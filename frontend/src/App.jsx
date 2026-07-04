import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { Suspense, useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Theme1 from './components/themes/Theme1';

import './App.css';

import { UserProvider, UserContext } from './components/APIs/Context';
import ProtectedRoutes from './components/APIs/ProtectedRoutes';

import Navbar from './components/Navbar';
import LoadingSpinner from './components/snippets/LoadingSpinner';

import Homepage from './components/Homepage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

const PageLoader = () => (
	<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
		<LoadingSpinner />
	</Box>
);

function AppRoutes() {
    const { user } = useContext(UserContext);
    
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public Routes */}
                <Route path='/login/' element={<Login />} />
                <Route path='/register/' element={<Register />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoutes />}>
                    <Route path='/' element={user ? <Dashboard /> : <Homepage />} />
                    <Route path='/profile' element={<Profile />} />
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}

export default function App() {
	return (
		<ThemeProvider theme={Theme1}>
			<CssBaseline />
			<UserProvider>
                <Navbar />
				<AppRoutes />
			</UserProvider>
		</ThemeProvider>
	);
}
