import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    Button,
    Breadcrumbs
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import axiosInstance from './APIs/Axios';
import LoadingSpinner from './snippets/LoadingSpinner';

const VideoPlayer = ({ options, onReady }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if (!videoRef.current) return;

        // Create a wrapper element for video-js
        const videoElement = document.createElement('video-js');
        videoElement.classList.add('vjs-big-play-centered');
        videoRef.current.appendChild(videoElement);

        const player = playerRef.current = videojs(videoElement, {
            ...options,
            controls: true,
            fluid: true,
            responsive: true,
        }, () => {
            onReady && onReady(player);
        });

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [options, onReady]);

    // Update video source when options change
    useEffect(() => {
        const player = playerRef.current;
        if (player && options.sources) {
            player.src(options.sources);
        }
    }, [options.sources]);

    return (
        <div data-vjs-player style={{ width: '100%' }}>
            <div ref={videoRef} />
        </div>
    );
};

const LessonView = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const playerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch course details
                const courseRes = await axiosInstance.get(`/courses/${courseId}/`);
                setCourse(courseRes.data);

                // Fetch lessons list
                const lessonsRes = await axiosInstance.get(`/lessons/?course=${courseId}`);
                setLessons(lessonsRes.data);

                // Find or fetch current lesson
                const activeLesson = lessonsRes.data.find(l => l.id.toString() === lessonId);
                if (activeLesson) {
                    setCurrentLesson(activeLesson);
                } else {
                    // Try direct fetch
                    const lessonRes = await axiosInstance.get(`/lessons/${lessonId}/`);
                    setCurrentLesson(lessonRes.data);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching lesson data:", err);
                setError("Failed to load lesson contents.");
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, lessonId]);

    const handlePlayerReady = (player) => {
        playerRef.current = player;
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><LoadingSpinner /></Box>;
    if (error) return <Typography color="error" sx={{ p: 4 }}>{error}</Typography>;
    if (!currentLesson) return <Typography sx={{ p: 4 }}>Lesson not found.</Typography>;

    const videoOptions = {
        autoplay: false,
        sources: currentLesson.video_url ? [{
            src: currentLesson.video_url,
            type: 'video/mp4'
        }] : []
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            {/* Navigation / Breadcrumbs */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    component={Link}
                    to={`/courses/${courseId}`}
                    variant="outlined"
                >
                    Back to Course Details
                </Button>
                <Breadcrumbs aria-label="breadcrumb">
                    <Typography color="text.secondary">{course?.name}</Typography>
                    <Typography color="text.primary">{currentLesson?.title}</Typography>
                </Breadcrumbs>
            </Box>

            <Grid container spacing={3}>
                {/* Video Player and details */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ overflow: 'hidden', mb: 3, bgcolor: '#000' }}>
                        {currentLesson.video_url ? (
                            <VideoPlayer options={videoOptions} onReady={handlePlayerReady} />
                        ) : (
                            <Box sx={{ p: 10, textAlign: 'center', color: '#fff' }}>
                                <Typography variant="h6">No Video Uploaded for This Lesson.</Typography>
                            </Box>
                        )}
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h4" gutterBottom>{currentLesson?.title}</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
                            {currentLesson?.description || "No description provided for this lesson."}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Playlist sidepanel */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Lessons Playlist</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <List component="nav">
                            {lessons.map((lesson) => (
                                <ListItem key={lesson.id} disablePadding>
                                    <ListItemButton
                                        selected={lesson.id.toString() === lessonId}
                                        onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
                                        sx={{
                                            borderRadius: 1,
                                            mb: 1,
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.light',
                                                color: 'primary.contrastText',
                                                '&:hover': {
                                                    bgcolor: 'primary.light',
                                                }
                                            }
                                        }}
                                    >
                                        <PlayCircleOutlineIcon sx={{ mr: 2, color: lesson.id.toString() === lessonId ? 'inherit' : 'action.active' }} />
                                        <ListItemText
                                            primary={lesson.title}
                                            secondary={lesson.order !== undefined ? `Order: ${lesson.order}` : null}
                                            secondaryTypographyProps={{
                                                style: { color: lesson.id.toString() === lessonId ? 'rgba(255,255,255,0.7)' : 'inherit' }
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                            {lessons.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    No other lessons available.
                                </Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default LessonView;
