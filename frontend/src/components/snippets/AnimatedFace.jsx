import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

export default function AnimatedFace({ state = 'default' }) {
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const faceRef = useRef(null);

	const isHiding = state === 'hiding';
	const isTyping = state === 'typing';

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (faceRef.current && !isHiding && !isTyping) {
				const rect = faceRef.current.getBoundingClientRect();
				const centerX = rect.left + rect.width / 2;
				const centerY = rect.top + rect.height / 2;

				const dx = e.clientX - centerX;
				const dy = e.clientY - centerY;
				const dist = Math.sqrt(dx * dx + dy * dy);

				// Limit how far the pupils can travel
				const maxMove = 4;
				const scale = Math.min(dist / 100, 1); // Sensitivity scale
				const moveX = dist > 0 ? (dx / dist) * maxMove * scale : 0;
				const moveY = dist > 0 ? (dy / dist) * maxMove * scale : 0;

				setMousePos({ x: moveX, y: moveY });
			}
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, [isHiding, isTyping]);

	// Pupil position logic
	let pupilX = mousePos.x;
	let pupilY = mousePos.y;

	if (isTyping) {
		pupilX = 0;
		pupilY = 4; // Look down at input
	}

	return (
		<Box
			ref={faceRef}
			sx={{
				width: 100,
				height: 100,
				margin: '0 auto 20px',
				position: 'relative',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				pointerEvents: 'none', // Don't block mouse events for the listener
			}}
		>
			<svg width='100' height='100' viewBox='0 0 100 100'>
				{/* Face Background */}
				<circle cx='50' cy='50' r='45' fill='rgba(255, 255, 255, 0.05)' stroke='rgba(255, 255, 255, 0.2)' strokeWidth='2' />

				{/* Eyes Group */}
				<g style={{ transition: 'transform 0.3s ease' }} transform={isTyping ? 'translate(0, 3)' : 'translate(0, 0)'}>
					{/* Left Eye */}
					<g transform='translate(35, 45)'>
						{isHiding ?
							<path d='M-8,0 Q0,8 8,0' fill='none' stroke='white' strokeWidth='3' strokeLinecap='round' />
						:	<>
								<circle r='8' fill='white' opacity='0.2' />
								<circle
									r='4'
									fill='white'
									style={{ transition: isTyping ? 'transform 0.3s ease' : 'none' }}
									transform={`translate(${pupilX}, ${pupilY})`}
								/>
							</>
						}
					</g>

					{/* Right Eye */}
					<g transform='translate(65, 45)'>
						{isHiding ?
							<path d='M-8,0 Q0,8 8,0' fill='none' stroke='white' strokeWidth='3' strokeLinecap='round' />
						:	<>
								<circle r='8' fill='white' opacity='0.2' />
								<circle
									r='4'
									fill='white'
									style={{ transition: isTyping ? 'transform 0.3s ease' : 'none' }}
									transform={`translate(${pupilX}, ${pupilY})`}
								/>
							</>
						}
					</g>
				</g>

				{/* Mouth */}
				<path
					d={isHiding ? 'M40,70 Q50,65 60,70' : isTyping ? 'M40,72 Q50,75 60,72' : 'M40,70 Q50,72 60,70'}
					fill='none'
					stroke='white'
					strokeWidth='3'
					strokeLinecap='round'
					style={{ transition: 'all 0.3s ease' }}
				/>

				{/* Hands (hiding) */}
				<g style={{ opacity: isHiding ? 1 : 0, transition: 'all 0.3s ease' }} transform={isHiding ? 'translate(0, 0)' : 'translate(0, 20)'}>
					<circle cx='30' cy='50' r='12' fill='rgba(255, 255, 255, 0.1)' stroke='rgba(255, 255, 255, 0.3)' strokeWidth='1' />
					<circle cx='70' cy='50' r='12' fill='rgba(255, 255, 255, 0.1)' stroke='rgba(255, 255, 255, 0.3)' strokeWidth='1' />
				</g>
			</svg>
		</Box>
	);
}
