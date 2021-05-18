import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { animations } from 'react-animation'
import Button from '@material-ui/core/Button';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    overlay: {
        background: 'linear-gradient(125deg,#2b5876, #4e4376)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        opacity: 0.8,
        color : 'white',
        height: '100%',
        width: '100%',
        flexFlow: 'wrap',
    },
    container: {
        justifyContent: 'center',
        alignContent: 'center',
        display: 'flex',
        flexFlow: 'wrap',
        paddingTop: '20vh',
    },
    heading: {
        width: '100%',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Montserrat',
        fontWeight: 700,
        fontSize: '4vh',
    },
    subHeading: {
        width: '100%',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Montserrat',
        fontWeight: 300,
        fontSize: '14vh',
        marginBottom: 40,
    },
    bodyContainer: {
        width: '100%',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Roboto',
        fontWeight: 300,
        fontSize: '2vh',
        display: 'flex',
        marginBottom: '5vh',
    },
    bodyText: {
        color: 'white',
        maxWidth: '50vw',
    },
    hidden: {
        display: 'none',
    },
    button: {
        margin: theme.spacing(1),
        color: 'white',
        border: '1px solid #b0c8d9'
    },
  }));
  

export default function LandingOverlay({hidden, setHidden}) {
    const [clicked, setClicked] = useState(false)
    const classes = useStyles();

    const handleClick = (e) => {
        setClicked(true);
        setTimeout(
            () => setHidden(true), 
            350
          );
    }

    return (
        <div className={clsx(classes.overlay, {[classes.hidden]: hidden})} style={clicked ? { animation: animations.fadeOut, animationDuration: 3000 } : {}}>
            <div className={classes.container}>
                <div className={classes.heading}>
                    THE DIVERSITY OF
                </div>
                <div className={classes.subHeading}>
                    US Languages
                </div>
                <div className={classes.bodyContainer}>
                    <p className={classes.bodyText}>
                        This project is a visualization of the many languages spoken in the United States, divided by metro areas, states, and counties, using 
                        data provided by the US Census Bureau and compiled by the American Community Survey.
                        It captures the number of speakers by region as well as where the main population of those speakers are in the world. 
                        To explore the visual, click and drag to pan across the map and scroll to zoom.
                        Select a language and location to start exploring the diversity of languages in the United States.  
                    </p>
                </div>
                <Button onClick={handleClick} variant="outlined" size="large" className={classes.button}>
                    View Map
                </Button>
            </div>
        </div>
    )
}
