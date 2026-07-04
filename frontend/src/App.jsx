import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Theme1 from './components/themes/Theme1';

import './App.css';

import { UserProvider } from './components/APIs/Context';
import ProtectedRoutes from './components/APIs/ProtectedRoutes';

// import Header from './components/snippets/Header';
// import Footer from './components/snippets/Footer';
import LoadingSpinner from './components/snippets/LoadingSpinner';

// import Homepage from './components/Homepage';
import Login from './components/Login';
import CourseDetails from './components/CourseDetails';
// import Show from './components/Show';

// Lazy load route components for better initial load performance
// const Artist = lazy(() => import('./components/Artist'));
// const Country = lazy(() => import('./components/Country'));
// const Language = lazy(() => import('./components/Language'));
// const Genre = lazy(() => import('./components/Genre'));
// const Rating = lazy(() => import('./components/Rating'));
// const Label = lazy(() => import('./components/Label'));
// const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
// const ResetPassword = lazy(() => import('./components/ResetPassword'));
// const Register = lazy(() => import('./components/Register'));
// const Logout = lazy(() => import('./components/Logout'));
// const Profile = lazy(() => import('./components/Profile'));

const PageLoader = () => (
	<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
		<LoadingSpinner />
	</Box>
);

export default function App() {
	return (
		<ThemeProvider theme={Theme1}>
			<CssBaseline />
			<UserProvider>
				{/* <Header /> */}
				<Suspense fallback={<PageLoader />}>
					<Routes>
						{/* Public Routes */}
						{/* <Route path='/register/' element={<Register />} /> */}
						<Route path='/login/' element={<Login />} />
						{/* <Route path='/logout/' element={<Logout />} /> */}
						{/* <Route path='/forgot-password/' element={<ForgotPassword />} /> */}
						{/* <Route path='/reset-password/:token' element={<ResetPassword />} /> */}

						{/* Protected Routes */}
						<Route element={<ProtectedRoutes />}>
							<Route path='/course/:courseId' element={<CourseDetails />} />
							{/* <Route path='/' element={<Homepage />} /> */}
							{/*	<Route path='/artist/:artist_id' element={<Artist />} />
							<Route path='/country/:country_id' element={<Country />} />
							<Route path='/language/:language_id' element={<Language />} />
							<Route path='/genre/:genre_id' element={<Genre />} />
							<Route path='/rating/:rating_id' element={<Rating />} />
							<Route path='/label/:label_id' element={<Label />} />
							<Route path='/show/:show_id' element={<Show />} />
							<Route path='/profile' element={<Profile />} />*/}
						</Route>
					</Routes>
				</Suspense>
				{/* <Footer /> */}
			</UserProvider>
		</ThemeProvider>
	);
}
