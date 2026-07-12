import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Accordion, 
    AccordionSummary, 
    AccordionDetails, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText,
    Divider,
    Paper,
    Card,
    CardContent,
    TextField,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    ListItemButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import QuizIcon from '@mui/icons-material/Quiz';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import axiosInstance from './APIs/Axios';
import { UserContext } from './APIs/Context';
import LoadingSpinner from './snippets/LoadingSpinner';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [course, setCourse] = useState(null);
    const [contents, setContents] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ssoLoading, setSsoLoading] = useState(false);

    // Tutor Form States
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newOrder, setNewOrder] = useState('0');
    const [videoFile, setVideoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            // Fetch course info from Django
            const courseRes = await axiosInstance.get(`/courses/${courseId}/`);
            setCourse(courseRes.data);

            // Fetch course contents (proxied from Moodle)
            try {
                const contentsRes = await axiosInstance.get(`/courses/${courseId}/contents/`);
                setContents(contentsRes.data);
            } catch (moodleErr) {
                console.warn("Moodle course content not available:", moodleErr);
                setContents([]);
            }

            // Fetch local video lessons
            const lessonsRes = await axiosInstance.get(`/lessons/?course=${courseId}`);
            setLessons(lessonsRes.data);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching course data:", err);
            setError("Failed to load course content.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const handleModuleClick = async (module) => {
        setSsoLoading(true);
        try {
            // Get SSO URL from Django
            const response = await axiosInstance.get(`/courses/${courseId}/sso_url/`);
            if (response.data.login_url) {
                window.open(response.data.login_url, '_blank');
            }
        } catch (err) {
            console.error("SSO failed", err);
            window.open(module.url, '_blank');
        } finally {
            setSsoLoading(false);
        }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            setFormError("Lesson title is required.");
            return;
        }

        setUploading(true);
        setFormError('');
        setFormSuccess('');

        const formData = new FormData();
        formData.append('course', courseId);
        formData.append('title', newTitle);
        formData.append('description', newDescription);
        formData.append('order', parseInt(newOrder, 10) || 0);
        if (videoFile) {
            formData.append('video', videoFile);
        }

        try {
            const response = await axiosInstance.post('/lessons/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setLessons([...lessons, response.data]);
            setFormSuccess("Lesson created successfully!");
            // Reset form
            setNewTitle('');
            setNewDescription('');
            setNewOrder('0');
            setVideoFile(null);
            // Reset file input element
            const fileInput = document.getElementById('video-file-input');
            if (fileInput) fileInput.value = '';
        } catch (err) {
            console.error("Error uploading lesson:", err);
            setFormError(err.response?.data?.detail || "Failed to upload lesson.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return;
        try {
            await axiosInstance.delete(`/lessons/${lessonId}/`);
            setLessons(lessons.filter(l => l.id !== lessonId));
        } catch (err) {
            console.error("Failed to delete lesson:", err);
            alert("Failed to delete lesson.");
        }
    };

    const getIcon = (modname) => {
        switch (modname) {
            case 'video':
            case 'url':
                return <PlayCircleOutlineIcon color="primary" />;
            case 'quiz':
                return <QuizIcon color="secondary" />;
            case 'resource':
                return <DescriptionIcon />;
            default:
                return <DescriptionIcon />;
        }
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><LoadingSpinner /></Box>;
    if (error) return <Typography color="error" sx={{ p: 4 }}>{error}</Typography>;

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
            {/* Header */}
            <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {course?.name}
                </Typography>
                <Typography variant="subtitle1">
                    Tutor: {course?.tutor_name || `Dr. ${course?.tutor}`}
                </Typography>
            </Paper>

            {/* Video Lessons Section */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <VideoLibraryIcon sx={{ mr: 1 }} color="primary" /> Video Lessons
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List>
                    {lessons.map((lesson) => (
                        <React.Fragment key={lesson.id}>
                            <ListItem
                                disablePadding
                                secondaryAction={
                                    user?.is_tutor && (
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteLesson(lesson.id)}>
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    )
                                }
                            >
                                <ListItemButton
                                    onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
                                    sx={{ borderRadius: 1 }}
                                >
                                    <ListItemIcon>
                                        <PlayCircleOutlineIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={lesson.title}
                                        secondary={lesson.description || "No description provided."}
                                    />
                                </ListItemButton>
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </React.Fragment>
                    ))}
                    {lessons.length === 0 && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                            No video lessons have been uploaded for this course yet.
                        </Typography>
                    )}
                </List>
            </Paper>

            {/* Tutor Upload/Management Section */}
            {user?.is_tutor && (
                <Card sx={{ mb: 4, border: '1px solid', borderColor: 'primary.light' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                            Upload New Video Lesson
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Add a new lesson with a video player powered by Video.js for your students.
                        </Typography>

                        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                        {formSuccess && <Alert severity="success" sx={{ mb: 2 }}>{formSuccess}</Alert>}

                        <Box component="form" onSubmit={handleAddLesson} noValidate sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Lesson Title"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        disabled={uploading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Order/Index"
                                        value={newOrder}
                                        onChange={(e) => setNewOrder(e.target.value)}
                                        disabled={uploading}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Lesson Description"
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        disabled={uploading}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<CloudUploadIcon />}
                                        sx={{ mr: 2 }}
                                        disabled={uploading}
                                    >
                                        Select Video File (.mp4)
                                        <input
                                            id="video-file-input"
                                            type="file"
                                            accept="video/mp4,video/*"
                                            hidden
                                            onChange={(e) => setVideoFile(e.target.files[0])}
                                        />
                                    </Button>
                                    <Typography variant="caption" color="text.secondary">
                                        {videoFile ? `Selected: ${videoFile.name}` : "No file selected"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={uploading}
                                        sx={{ minWidth: 150 }}
                                    >
                                        {uploading ? <CircularProgress size={24} color="inherit" /> : "Upload Lesson"}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Course Contents Section (from Moodle) */}
            {contents.length > 0 && (
                <>
                    <Typography variant="h5" sx={{ mb: 2 }}>Moodle Course Contents</Typography>
                    {contents.map((section) => (
                        <Accordion key={section.id} defaultExpanded={section.name !== 'General'}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">{section.name}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {section.summary && (
                                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                        {section.summary.replace(/<[^>]*>?/gm, '')}
                                    </Typography>
                                )}
                                <List>
                                    {section.modules.map((module) => (
                                        <React.Fragment key={module.id}>
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={() => handleModuleClick(module)} disabled={ssoLoading}>
                                                    <ListItemIcon>
                                                        {getIcon(module.modname)}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={module.name}
                                                        secondary={module.description ? module.description.replace(/<[^>]*>?/gm, '') : null}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                            <Divider variant="inset" component="li" />
                                        </React.Fragment>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </>
            )}
        </Box>
    );
};

export default CourseDetails;
