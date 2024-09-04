import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Grid, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const theme = useTheme();
  const primaryColorHex = theme.palette.primary.main;
  console.log('Primary Color Hex:', primaryColorHex);

  useEffect(() => {
    setIsFormValid(email && password && !emailError && !passwordError);
  }, [email, password, emailError, passwordError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      setMessage('Login Successful!');
      setIsError(false);
      setOpen(true);
      setTimeout(() => navigate('/home'), 2000);
    } catch (error) {
      setMessage('Login Failed: ' + (error.response ? error.response.data : error.message));
      setIsError(true);
      setOpen(true);
    }
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    if (!validateEmail(value)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setPassword(value);
    if (!validatePassword(value)) {
      setPasswordError('Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.');
    } else {
      setPasswordError('');
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(password);

  return (
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
            onChange={handleEmailChange}
            error={!!emailError}
            helperText={emailError}
            InputProps={{
              style: { borderRadius: '10px' },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            required
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError}
            InputProps={{
              style: { borderRadius: '10px' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} style={{ textAlign: 'right' }}>
          <Button
            color="primary"
            style={{ textTransform: 'none' }}
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{ borderRadius: '10px' }}
            disabled={!isFormValid}
          >
            Sign In
          </Button>
        </Grid>
      </Grid>
      <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity={isError ? 'error' : 'success'} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </form>
  );
};

export default LoginForm;
