import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, Box, List, ListItem, ListItemText } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMediaQuery, useTheme } from '@mui/material';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // Use navigate to handle redirection
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
      }
    }else {
      setFirstName('');
    }
  }, [setFirstName, location]);

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
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <Link to="/home" style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
              MelodyMesh
            </Link>
          </Typography>

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

          {!isMobile && firstName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.primary.main,
                  fontFamily: "'Poppins', sans-serif",
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
            !isMobile && location.pathname !== '/login' && location.pathname !== '/signup' && (
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

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            width: '100%',
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
                    width: '100%',
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
                    width: '100%',
                    borderRadius: '20px',
                    padding: '6px 20px',
                    fontSize: '1rem',
                  }}
                >
                  Sign Up
                </Button>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
