import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

const drawerWidth = 350;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    top: 64,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  title: {
    fontWeight: 400,
    marginLeft: 10,
    fontSize: 19,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textAlign: 'left',
  }, 
  titleContainer: {
    overflow: 'hidden',
    width: 280,
  },
  container: {
    margin: '0 20px',
    fontSize: '1rem',
    textAlign: 'left', 
    // padding: '0 10px',
  }
}));

/**
 * Left drawer that appears when a user clicks on a circle location on the Map
 * 
 * @param {Boolean} open whether the drawer should be open or closed
 * @param {String} selectedLocation metro area circle clicked by the user
 * @param {Object} sortedLocLanguages contains the list of languages that a metro area has and the index that corresponds to the language selected by user
 * @param {Function} handleDrawerClose closes the drawer 
 * @returns 
 */
export default function LeftDrawer({open, selectedLocation, sortedLocLanguages, handleDrawerClose}) {
  const classes = useStyles();
  const theme = useTheme();
  const {sortedLocLangData, selectedLangIndex} = sortedLocLanguages;
  const metroArea = selectedLocation.split(',')[0];
  const abbrev = ['st', 'nd', 'rd', 'th']

  function stringifyNumber(index) {
    const n = index + 1
    if (n <= 3) return `${n}${abbrev[index]}`
    else return `${n}${abbrev[3]}`
  }

  //Source: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return (
    <div className={classes.root}>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <div className={classes.titleContainer}>
            <Typography className={classes.title}>{selectedLocation.split(',')[0]}</Typography>
          </div>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <div className={classes.container}>
            {sortedLocLangData.length !== 0 ?
            (<p>
              <b>{sortedLocLangData[selectedLangIndex].Language}</b> is the <b>{stringifyNumber(selectedLangIndex)}</b> most spoken language in {metroArea} (excluding English). There 
              are {numberWithCommas(sortedLocLangData[selectedLangIndex].NumberOfSpeakers)} speakers in the area.            
            </p>)
            : null
            }
        </div>
        <Divider />
        <List>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      {/* <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
      </main> */}
    </div>
  );
}