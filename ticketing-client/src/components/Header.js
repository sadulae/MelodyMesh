import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Corrected import
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMediaQuery, useTheme } from '@mui/material';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    // Check for JWT token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setFirstName(decodedToken.firstName);
      } catch (error) {
        console.error('Invalid token:', error);
        setFirstName('');
      }
    } else {
      setFirstName('');
    }
  }, [location]);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setFirstName('');
    navigate('/login'); // Redirect to login page
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#FFFFFF',
          boxShadow: 'none',
          padding: '0 20px',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '70px',
          }}
        >
          {/* Logo/Title */}
          <Typography
            variant="h4"
            sx={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <Link
              to="/home"
              style={{
                textDecoration: 'none',
                color: theme.palette.primary.main,
              }}
            >
              MelodyMesh
            </Link>
          </Typography>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: '2rem' }}>
              <Link
                to="/home"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                  fontSize: '1.1rem',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Home
              </Link>
              <Link
                to="/contact"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                  fontSize: '1.1rem',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Contact Us
              </Link>
              {/* New Feedbacks Link */}
              <Link
                to="/public-feedback"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                  fontSize: '1.1rem',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Feedbacks
              </Link>
              <Link
                to="/about"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                  fontSize: '1.1rem',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                About
              </Link>
            </Box>
          )}

          {/* User Authentication Buttons */}
          {!isMobile && firstName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Typography
                variant="h6"
                onClick={() => navigate('/profile')} // Redirect to profile page
                sx={{
                  color: theme.palette.primary.main,
                  fontFamily: "'Poppins', sans-serif",
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Welcome, {firstName}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleSignOut}
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  textTransform: 'none',
                  fontFamily: "'Poppins', sans-serif",
                  borderRadius: '20px',
                  padding: '6px 20px',
                  fontSize: '1rem',
                  transition: 'box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)',
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                Sign Out
              </Button>
            </Box>
          ) : (
            !isMobile &&
            location.pathname !== '/login' &&
            location.pathname !== '/signup' && (
              <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    disabled={location.pathname === '/login'}
                    sx={{
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      textTransform: 'none',
                      fontFamily: "'Poppins', sans-serif",
                      borderRadius: '20px',
                      padding: '6px 20px',
                      fontSize: '1rem',
                      transition: 'box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)',
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    disabled={location.pathname === '/signup'}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: '#FFFFFF',
                      textTransform: 'none',
                      fontFamily: "'Poppins', sans-serif",
                      borderRadius: '20px',
                      padding: '6px 20px',
                      fontSize: '1rem',
                      transition: 'box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)',
                        backgroundColor: theme.palette.primary.dark,
                        color: '#FFFFFF',
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </Box>
            )
          )}

          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ color: theme.palette.primary.main }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            width: '75%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Close Icon */}
          <IconButton
            sx={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              color: theme.palette.primary.main,
            }}
            onClick={toggleDrawer(false)}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* Navigation Links */}
          <List sx={{ width: '100%', textAlign: 'center' }}>
            <ListItem
              button
              component={Link}
              to="/home"
              onClick={toggleDrawer(false)}
              sx={{ marginBottom: '2rem', justifyContent: 'center' }}
            >
              <ListItemText
                primary="Home"
                sx={{
                  color: theme.palette.primary.main,
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/contact"
              onClick={toggleDrawer(false)}
              sx={{ marginBottom: '2rem', justifyContent: 'center' }}
            >
              <ListItemText
                primary="Contact Us"
                sx={{
                  color: theme.palette.primary.main,
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </ListItem>
            {/* New Feedbacks Link */}
            <ListItem
              button
              component={Link}
              to="/public-feedback"
              onClick={toggleDrawer(false)}
              sx={{ marginBottom: '2rem', justifyContent: 'center' }}
            >
              <ListItemText
                primary="Feedbacks"
                sx={{
                  color: theme.palette.primary.main,
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/about"
              onClick={toggleDrawer(false)}
              sx={{ marginBottom: '2rem', justifyContent: 'center' }}
            >
              <ListItemText
                primary="About"
                sx={{
                  color: theme.palette.primary.main,
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </ListItem>
            {/* User Authentication Links */}
            {firstName ? (
              <>
                <ListItem sx={{ marginBottom: '2rem', justifyContent: 'center' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.palette.primary.main,
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Welcome, {firstName}
                  </Typography>
                </ListItem>
                <ListItem sx={{ justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleSignOut();
                      toggleDrawer(false)();
                    }}
                    sx={{
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      textTransform: 'none',
                      fontFamily: "'Poppins', sans-serif",
                      width: '80%',
                      borderRadius: '20px',
                      padding: '6px 20px',
                      fontSize: '1rem',
                    }}
                  >
                    Sign Out
                  </Button>
                </ListItem>
              </>
            ) : (
              <>
                {location.pathname !== '/login' && (
                  <ListItem
                    button
                    component={Link}
                    to="/login"
                    onClick={toggleDrawer(false)}
                    sx={{ marginBottom: '2rem', justifyContent: 'center' }}
                  >
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        textTransform: 'none',
                        fontFamily: "'Poppins', sans-serif",
                        width: '80%',
                        borderRadius: '20px',
                        padding: '6px 20px',
                        fontSize: '1rem',
                      }}
                    >
                      Sign In
                    </Button>
                  </ListItem>
                )}
                {location.pathname !== '/signup' && (
                  <ListItem
                    button
                    component={Link}
                    to="/signup"
                    onClick={toggleDrawer(false)}
                    sx={{ justifyContent: 'center' }}
                  >
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        textTransform: 'none',
                        fontFamily: "'Poppins', sans-serif",
                        width: '80%',
                        borderRadius: '20px',
                        padding: '6px 20px',
                        fontSize: '1rem',
                      }}
                    >
                      Sign Up
                    </Button>
                  </ListItem>
                )}
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
