import { useContext } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { UserContext } from './Context';
import LoadingSpinner from '../snippets/LoadingSpinner';

const ProtectedRoutes = () => {
	const { user, loading } = useContext(UserContext);
	const location = useLocation();

	if (loading) {
		return <LoadingSpinner />;
	}

	if (!user) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return <Outlet />;
};

export default ProtectedRoutes;
