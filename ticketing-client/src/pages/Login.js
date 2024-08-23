import React from 'react';
import { Container, Typography, Paper, Link } from '@mui/material';
import LoginForm from '../components/LoginForm';

const Login = () => {
  return (
    <Container 
      component="main" 
      maxWidth="xs" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}
    >
      <Typography variant="h5" color="primary" style={{ marginBottom: '20px' }}>
        Sign In
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
        <LoginForm />
      </Paper>
      <Typography variant="body2" color="primary" style={{ marginTop: '20px' }}>
        Don't have an account? <Link href="/signup" color="inherit" variant="body2">Sign Up</Link>
      </Typography>
    </Container>
  );
};

export default Login;
