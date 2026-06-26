import { useContext } from 'react';
import { Container, Box, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { UserContext } from '../APIs/Context.jsx';
import { Person, Home, Logout } from '@mui/icons-material';

export default function AlreadyLoggedIn() {
	const { user } = useContext(UserContext);
	const username = user?.username || 'user';

	return (
		<Container maxWidth='sm' sx={{ my: 5 }}>
			<Box
				className='glassy'
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					textAlign: 'center',
					p: { xs: 4, sm: 5 },
					borderRadius: 2,
				}}
			>
				<Typography variant='h5' sx={{ fontWeight: 'bold', color: '#5dd95d', my: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
					<Person /> You are already logged in as {username}!
				</Typography>

				<Link
					component={RouterLink}
					to='/'
					sx={{
						textDecoration: 'none',
						color: '#54a9de',
						fontSize: '1.5rem',
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						mb: 2,
						'&:hover': { textDecoration: 'underline' },
					}}
				>
					<Home /> Go to homepage
				</Link>

				<Link
					component={RouterLink}
					to='/logout'
					sx={{
						textDecoration: 'none',
						color: '#9a0606',
						fontSize: '1rem',
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						'&:hover': { textDecoration: 'underline' },
					}}
				>
					<Logout /> Logout
				</Link>
			</Box>
		</Container>
	);
}
