import React, { useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
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
        paddingTop: 200,
    },
    heading: {
        width: '100%',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Montserrat',
        fontWeight: 700,
        fontSize: 30,
    },
    subHeading: {
        width: '100%',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Montserrat',
        fontWeight: 300,
        fontSize: 90,
        marginBottom: 40,
    },
    bodyContainer: {
        width: '100%',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Roboto',
        fontWeight: 300,
        fontSize: 16,
        display: 'flex',
        marginBottom: 70,
    },
    bodyText: {
        maxWidth: 600,
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
    const theme = useTheme();

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
                    <div className={classes.bodyText}>
                    This project is a visualization of the many languages spoken in the United States, drawn from the 2009-2013 American Community Survey 
                    which was a 5-year estimate of US census data. 
                    Select a language to see how many speakers of that language there are and where they are located.
                    </div>
                </div>
                <Button onClick={handleClick} variant="outlined" size="large" className={classes.button}>
                    View Map
                </Button>
            </div>
        </div>
    )
}
