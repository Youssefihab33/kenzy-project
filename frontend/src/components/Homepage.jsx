import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent, CardActions, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTitle } from 'react-use';
import axiosInstance from './APIs/Axios.jsx';

export default function Homepage() {
    const [courses, setCourses] = useState([]);
    useTitle('Home - Kenzy Project');

    useEffect(() => {
        axiosInstance.get('courses/')
            .then(res => setCourses(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Welcome to Kenzy Project
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                    The Student Information Management System for modern learning.
                </Typography>
                <Box sx={{ mt: 4 }}>
                    <Button variant="contained" color="primary" size="large" component={RouterLink} to="/register" sx={{ mr: 2 }}>
                        Get Started
                    </Button>
                    <Button variant="outlined" color="primary" size="large" component={RouterLink} to="/login">
                        Sign In
                    </Button>
                </Box>
            </Box>

            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Available Courses
            </Typography>
            <Grid container spacing={4}>
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {course.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {course.description.substring(0, 100)}...
                                    </Typography>
                                    <Chip label={course.tutor_name || 'Tutor'} size="small" variant="outlined" />
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={RouterLink} to="/login">
                                        Enroll Now
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography color="text.secondary">No courses available yet.</Typography>
                    </Grid>
                )}
            </Grid>

            <Box sx={{ mt: 10 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    For Students
                                </Typography>
                                <Typography variant="body1">
                                    Access your courses, track your progress, and communicate with your tutors effortlessly.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    For Tutors
                                </Typography>
                                <Typography variant="body1">
                                    Manage your students, create course materials, and streamline your teaching workflow.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    Real-time Analytics
                                </Typography>
                                <Typography variant="body1">
                                    Get insights into performance and attendance with our built-in dashboard.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}
