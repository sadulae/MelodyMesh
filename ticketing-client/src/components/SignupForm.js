import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Snackbar, Alert } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import addYears from 'date-fns/addYears';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';


const SignupForm = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [open, setOpen] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  const [showPassword, setShowPassword] = useState(false); 

  
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(password);
  const validateName = (name) => /^[A-Z][a-z\s]*$/.test(name);
  useEffect(() => {
    if (
      firstName &&
      lastName &&
      email &&
      password &&
      birthday &&
      !isError
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [firstName, lastName, email, password, birthday, isError]);

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    if (!validateEmail(value)) {
      setEmailError('Please enter a valid email address.');
      setIsError(true);
    } else {
      setEmailError('');
      setIsError(false);
    }
  };

  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setPassword(value);
    if (!validatePassword(value)) {
      setPasswordError(
        'Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      setIsError(true);
    } else {
      setPasswordError('');
      setIsError(false);
    }
  };

  const handleNameChange = (event, setName) => {
    const value = event.target.value;
    const formattedValue = value.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trim();
    const capitalizedValue = formattedValue.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    setName(capitalizedValue);

    if (!validateName(capitalizedValue)) {
      setNameError('Only letters are allowed, and the first letter of each word must be capitalized.');
      setIsError(true);
    } else {
      setNameError('');
      setIsError(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Selected Birthday:", birthday);
    if (isFormValid && !isError) {
      try {
        await axios.post('http://localhost:5000/api/auth/signup', {
          firstName,
          lastName,
          email,
          password,
          dob: birthday ? birthday.toISOString().slice(0, 10) : '' // Format dob
        });
        setMessage('Signup Successful!');
        setIsError(false);
        setOpen(true);
        setTimeout(() => navigate('/login'), 2000);
      } catch (error) {
        let errorMsg = 'Signup Failed!';
        if (error.response && error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMsg = error.response.data;
          } else if (error.response.data.errors) {
            errorMsg = error.response.data.errors.map(err => err.msg).join(', ');
          }
        }
        setMessage(errorMsg);
        setIsError(true);
        setOpen(true);
      }
    } else {
      setMessage('Please fill in all fields correctly.');
      setIsError(true);
      setOpen(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            variant="outlined"
            required
            fullWidth
            label="First Name"
            name="firstName"
            value={firstName}
            onChange={(e) => handleNameChange(e, setFirstName)}
            error={!!nameError}
            helperText={nameError}
            InputProps={{
              style: { borderRadius: '10px' }
            }}
            inputProps={{ maxLength: 50 }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            variant="outlined"
            required
            fullWidth
            label="Last Name"
            name="lastName"
            value={lastName}
            onChange={(e) => handleNameChange(e, setLastName)}
            error={!!nameError}
            helperText={nameError}
            InputProps={{
              style: { borderRadius: '10px' }
            }}
            inputProps={{ maxLength: 50 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            required
            fullWidth
            label="Email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            error={!!emailError}
            helperText={emailError}
            InputProps={{
              style: { borderRadius: '10px' }
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
            type={showPassword ? 'text' : 'password'} // Toggle between password and text
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
        <Grid item xs={12}>
          <DatePicker
            selected={birthday}
            onChange={(date) => setBirthday(date)}
            dateFormat="yyyy/MM/dd"
            maxDate={addYears(new Date(), -12)}
            minDate={addYears(new Date(), -117)}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={117}
            placeholderText="Select your birthday"
            customInput={
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Date Of Birth"
                name="birthday"
                InputProps={{
                  style: { borderRadius: '10px' }
                }}
                inputProps={{ readOnly: true }}
              />
            }
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{ borderRadius: '10px' }}
            disabled={!isFormValid || isError}
          >
            Sign Up
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

export default SignupForm;
