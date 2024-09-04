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
        minHeight: '100vh',
      }}
    >
      <Typography variant="h4" color="primary" style={{ marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>
        Welcome Back!
      </Typography>
      <Typography variant="body1" style={{ marginBottom: '20px', textAlign: 'center', color: '#666' }}>
        Sign in to continue to your account.
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
        <LoginForm />
      </Paper>
      <Typography variant="body2" color="primary" style={{ marginTop: '20px', textAlign: 'center' }}>
        Don't have an account? <Link href="/signup" color="inherit" variant="body2">Sign Up</Link>
      </Typography>
    </Container>
  );
};

export default Login;
