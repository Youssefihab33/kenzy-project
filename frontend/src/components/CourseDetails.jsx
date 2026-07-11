import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import QuizIcon from '@mui/icons-material/Quiz';
import DescriptionIcon from '@mui/icons-material/Description';
import axiosInstance from './APIs/Axios';
import LoadingSpinner from './snippets/LoadingSpinner';

const CourseDetails = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ssoLoading, setSsoLoading] = useState(false);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // Fetch course info from Django
                const courseRes = await axiosInstance.get(`/courses/${courseId}/`);
                setCourse(courseRes.data);

                // Fetch course contents (proxied from Moodle)
                const contentsRes = await axiosInstance.get(`/courses/${courseId}/contents/`);
                setContents(contentsRes.data);
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching course data:", err);
                setError("Failed to load course content.");
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId]);

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><LoadingSpinner /></Box>;
    if (error) return <Typography color="error" sx={{ p: 4 }}>{error}</Typography>;

    const handleModuleClick = async (module) => {
        setSsoLoading(true);
        try {
            // Get SSO URL from Django
            const response = await axiosInstance.get(`/courses/${courseId}/sso_url/`);
            if (response.data.login_url) {
                // Moodle's userkey login URL will redirect to the resource if we appended wantsurl correctly
                // Our backend already appends wantsurl to the course view page if we pass it, 
                // but let's make it even better: redirect specifically to the module.
                // However, our backend currently only redirects to the course page.
                // We can improve the backend or just open the SSO URL which lands them in the course.
                window.open(response.data.login_url, '_blank');
            }
        } catch (err) {
            console.error("SSO failed", err);
            // Fallback to direct URL if SSO fails (might require login)
            window.open(module.url, '_blank');
        } finally {
            setSsoLoading(false);
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

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {course?.name}
                </Typography>
                <Typography variant="subtitle1">
                    Tutor: {course?.tutor}
                </Typography>
            </Paper>

            <Typography variant="h5" sx={{ mb: 2 }}>Course Contents</Typography>
            
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
                                    <ListItem button onClick={() => handleModuleClick(module)} disabled={ssoLoading}>
                                        <ListItemIcon>
                                            {getIcon(module.modname)}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={module.name} 
                                            secondary={module.description ? module.description.replace(/<[^>]*>?/gm, '') : null}
                                        />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default CourseDetails;
