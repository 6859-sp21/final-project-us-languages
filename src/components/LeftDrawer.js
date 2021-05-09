import React, { useState, useEffect, useRef } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import useSound from 'use-sound';
import axios from 'axios';
import ReactPlayer from 'react-player';

const drawerWidth = 350;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    // top: 64,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    marginTop: 40,
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
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
export default function LeftDrawer({open, audioMetadata, selectedLanguage, selectedLocation, sortedLocLanguages, handleDrawerClose}) {
  const [audioClipUrl, setAudioClipUrl] = useState('')
  const [audioClipTranslation, setAudioClipTranslation] = useState('')
  const [audioClipAvailible, setAudioClipAvailible] = useState(false);
  const myRef = useRef(null)
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
  const playAudio = () => {
    myRef.current.src = window.URL.createObjectURL(audioClipUrl)
    myRef.current.play()
  }
  useEffect(() => {
    const language = selectedLanguage ? selectedLanguage.toLowerCase() : "";
    if (language in audioMetadata) {
      const id = audioMetadata[language].DriveID;
      const translation = audioMetadata[language].Translation;
      const url = `https://docs.google.com/uc?export=download&id=${id}`
      setAudioClipUrl(url);
      setAudioClipTranslation(translation);
      setAudioClipAvailible(true);
    } else {
      setAudioClipAvailible(false);
    }
    }, [audioMetadata, selectedLanguage])
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
        <div className={classes.container}>
          {audioClipAvailible ? 
            (
              <div>
                <p>Audio clip translation: {audioClipTranslation}</p> 
                <audio src={audioClipUrl} type="audio/mp3" controls="controls"></audio>
              </div>
            )
          : <p>No audiocips availible</p>
          }

        </div>
        
      </Drawer>
    </div>
  );
}