import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    width: '200px',
    position: 'absolute',
    left: '50%',
    marginLeft: '-100px',
    fontFamily: 'Poppins',
    fontWeight: 600,
    fontSize: 20,
    color: 'white',
  },
  tab: {
    fontFamily: 'Roboto',
    fontWeight: 300,
    fontSize: 16,
    color: 'white',
    cursor: 'pointer',
  },
  navigation: {
      justifyContent: 'space-between',
      display: 'flex',
      minWidth: '150px',
      marginRight: '50px',
      position: 'absolute',
      right: '10px'
  },
  container: {
    // backgroundColor: '#526355',
    background: 'linear-gradient(125deg, #FFE8D6, #D67474)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    opacity: 0.8,
  }
}));

export default function Navbar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.container}>
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            US Languages
          </Typography>
          <div className={classes.navigation}>
            {/* <Typography variant="h6" className={classes.tab}>
                Map
            </Typography>
            <Typography variant="h6" className={classes.tab}>
                Grid
            </Typography> */}
          </div>
          {/* <Button color="inherit">Login</Button> */}
        </Toolbar>
      </AppBar>
    </div>
  );
}