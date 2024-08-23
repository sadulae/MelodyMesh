import React from 'react';
import { Container, Typography, Paper, Link } from '@mui/material';
import SignupForm from '../components/SignupForm';

const Signup = () => {
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
        Create An Account
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
        <SignupForm />
      </Paper>
      <Typography variant="body2" color="primary" style={{ marginTop: '20px' }}>
        Already have an account? <Link href="/login" color="inherit" variant="body2">Sign In</Link>
      </Typography>
    </Container>
  );
};

export default Signup;
