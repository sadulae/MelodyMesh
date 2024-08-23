import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import addYears from 'date-fns/addYears';
import axios from 'axios';

const SignupForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    // Check if all fields are filled and valid
    if (
      firstName &&
      lastName &&
      email &&
      password &&
      birthday &&
      !emailError &&
      !passwordError &&
      !nameError
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [firstName, lastName, email, password, birthday, emailError, passwordError, nameError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        firstName,
        lastName,
        email,
        password,
        birthday: birthday.toISOString().slice(0, 10) // Assuming your backend expects a date string
      });
      console.log('Signup Success:', response.data);
      alert('Signup Successful!');
    } catch (error) {
      console.error('Signup Error:', error.response ? error.response.data : error.message);
      alert('Signup Failed: ' + (error.response ? error.response.data : error.message));
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
      setPasswordError(
        'Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
    } else {
      setPasswordError('');
    }
  };

  const handleNameChange = (event, setName) => {
    const value = event.target.value;
  
    // Remove non-alphabetic characters except spaces
    const formattedValue = value
      .replace(/[^a-zA-Z\s]/g, '') // Remove all non-alphabetic characters except spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim(); // Remove leading and trailing spaces
    
    // Capitalize the first letter of each word and make the rest lowercase
    const capitalizedValue = formattedValue
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  
    setName(capitalizedValue);
    
    if (!validateName(capitalizedValue)) {
      setNameError('Only letters are allowed, and the first letter of each word must be capitalized.');
    } else {
      setNameError('');
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return passwordRegex.test(password);
  };

  const validateName = (name) => {
    const nameRegex = /^[A-Z][a-zA-Z]*$/;
    return nameRegex.test(name);
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
            inputProps={{ maxLength: 50 }} // Set maximum length if needed
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
            inputProps={{ maxLength: 50 }} // Set maximum length if needed
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
            type="password"
            value={password}
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError}
            InputProps={{
              style: { borderRadius: '10px' }
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
                label="Date Of Birth *"
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
            disabled={!isFormValid}
          >
            Sign Up
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default SignupForm;
