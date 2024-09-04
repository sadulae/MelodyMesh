import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, TextField, Button, Snackbar, Alert, Grid } from '@mui/material';
import axios from 'axios';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    setIsEmailValid(validateEmail(email));
  }, [email]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage('Password reset email sent!');
      setIsError(false);
      setOpen(true);
    } catch (error) {
      setMessage(error.response ? error.response.data : 'Failed to send email.');
      setIsError(true);
      setOpen(true);
    }
  };

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
      <Typography variant="h4" color="primary" style={{ marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>
        Forgot Your Password?
      </Typography>
      <Typography variant="body1" style={{ marginBottom: '20px', textAlign: 'center', color: '#666' }}>
        No worries, we'll send you a reset link to your email.
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  style: { borderRadius: '10px' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                style={{ borderRadius: '10px' }}
                disabled={!isEmailValid}
              >
                Send Reset Link
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity={isError ? 'error' : 'success'} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ForgotPasswordForm;
