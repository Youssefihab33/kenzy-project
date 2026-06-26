import { Box, CircularProgress } from '@mui/material';

export default function LoadingSpinner({ small = false }) {
	if (small) {
		return <CircularProgress size={20} sx={{ color: 'primary.main' }} />;
	}

	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
			}}
		>
			<Box sx={{ display: 'flex', gap: 2 }}>
				<CircularProgress sx={{ color: 'primary.main' }} size={40} />
				<CircularProgress sx={{ color: 'secondary.main' }} size={40} />
				<CircularProgress sx={{ color: 'primary.light' }} size={40} />
			</Box>
		</Box>
	);
}
