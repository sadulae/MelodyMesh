import React, { useState } from 'react';
import { Container, Typography, Paper, TextField, Button, Snackbar, Alert, Grid, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const validatePassword = (password) => 
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(password);

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [open, setOpen] = useState(false);

  const handlePasswordChange = (event) => {
    const { value } = event.target;
    setNewPassword(value);

    if (!validatePassword(value)) {
      setMessage('Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.');
      setIsError(true);
      setOpen(true);
    } else {
      setMessage('');
      setIsError(false);
      setOpen(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isError) {
      setMessage('Please correct the errors before submitting.');
      setOpen(true);
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { newPassword });
      setMessage('Password has been reset!');
      setIsError(false);
      setOpen(true);
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
    } catch (error) {
      setMessage(error.response ? error.response.data : 'Failed to reset password.');
      setIsError(true);
      setOpen(true);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
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
        Create Your New Password
      </Typography>
      <Typography variant="body1" style={{ marginBottom: '20px', textAlign: 'center', color: '#666' }}>
        It's time to take control! Choose a strong password and keep your account secure.
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                label="New Password"
                name="newPassword"
                type={showPassword ? 'text' : 'password'} // Toggle between password and text
                value={newPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  style: { borderRadius: '10px' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                error={isError} // Show error styling if password is invalid
                helperText={isError ? message : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                style={{ borderRadius: '10px' }}
              >
                Reset Password
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

export default ResetPasswordForm;
