import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';


const images = [
  {
    url:require('../Assets/sound.jpeg'),
    title: 'Sound',
    width: '30%',
    opacity: 0.5,
  },
  {
    url: require('../Assets/light.jpeg'),
    title: 'Lighting',
    width: '30%',
    opacity: 0.5,
  },
  {
    url: require('../Assets/visual.png'),
    title: 'Visual',
    width: '30%',
    opacity: 0.5,
  },
];

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: 200,
  [theme.breakpoints.down('sm')]: {
    width: '100% !important', // Overrides inline-style
    height: 100,
  },
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      border: '4px solid currentColor',
    },
  },
}));

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const Image = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
}));

const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0.4,
  transition: theme.transitions.create('opacity'),
}));

const ImageMarked = styled('span')(({ theme }) => ({
  height: 3,
  width: 18,
  backgroundColor: theme.palette.common.white,
  position: 'absolute',
  bottom: -2,
  left: 'calc(50% - 9px)',
  transition: theme.transitions.create('opacity'),
}));

const actions = [
    { icon: <FileCopyIcon />, name: 'Copy' },
    { icon: <SaveIcon />, name: 'Save' },
    { icon: <PrintIcon />, name: 'Print' },
    { icon: <ShareIcon />, name: 'Share' },
  ];

export default function HomePage() {
  return (
    <><Box
          sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center', // Center horizontally
              mt: 5, // Center vertically
              minWidth: 300,
              width: '100%',
              //height: '100vh', // Optional: Makes sure the Box takes full viewport height
          }}
      >
          {images.map((image) => (
              <ImageButton
                  focusRipple
                  key={image.title}
                  style={{
                      width: image.width,
                  }}
              >
                  <ImageSrc style={{ backgroundImage: `url(${image.url})` }} />
                  <ImageBackdrop className="MuiImageBackdrop-root" />
                  <Image>
                      <Typography
                          component="span"
                          variant="subtitle1"
                          color="inherit"
                          sx={(theme) => ({
                              position: 'relative',
                              p: 4,
                              pt: 2,
                              pb: `calc(${theme.spacing(1)} + 6px)`,
                          })}
                      >
                          {image.title}
                          <ImageMarked className="MuiImageMarked-root" />
                      </Typography>
                  </Image>
              </ImageButton>
          ))}
      </Box><Box sx={{ height: 320, transform: 'translateZ(0px)', flexGrow: 1 }}>
              <SpeedDial
                  ariaLabel="SpeedDial basic example"
                  sx={{ position: 'absolute', bottom: 16, right: 30 }}
                  icon={<SpeedDialIcon />}
              >
                  {actions.map((action) => (
                      <SpeedDialAction
                          key={action.name}
                          icon={action.icon}
                          tooltipTitle={action.name} />
                  ))}
              </SpeedDial>
          </Box></>
  );
}



  
 