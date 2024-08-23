import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Toolbar>
        <Typography variant="h4" style={{ flexGrow: 1, fontSize: '2rem', color: '#1E90FF' }}>
          <Link to="/home" style={{ textDecoration: 'none', color: '#1E90FF' }}>
            MusicMesh
          </Link>
        </Typography>
        {isMobile ? (
          <div>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuClick}
              style={{ color: '#1E90FF' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <Link to="/home" style={{ textDecoration: 'none', color: '#1E90FF' }}>Home</Link>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Link to="/contact" style={{ textDecoration: 'none', color: '#1E90FF' }}>Contact Us</Link>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Link to="/about" style={{ textDecoration: 'none', color: '#1E90FF' }}>About</Link>
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link to="/home" style={{ textDecoration: 'none', color: '#1E90FF', fontSize: '1.2rem' }}>Home</Link>
            <Link to="/contact" style={{ textDecoration: 'none', color: '#1E90FF', fontSize: '1.2rem' }}>Contact Us</Link>
            <Link to="/about" style={{ textDecoration: 'none', color: '#1E90FF', fontSize: '1.2rem' }}>About</Link>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
