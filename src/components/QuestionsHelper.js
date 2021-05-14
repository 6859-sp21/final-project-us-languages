import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import HelpIcon from '@material-ui/icons/Help';
import IconButton from '@material-ui/core/IconButton';
import { Box, List, ListItem, ListItemText, Paper } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    maxWidth: '40vw',
    // border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  iconBtn: {
      position: 'absolute',
      bottom: '3vh',
      right: '3vh',
  }, 
  bodyText: {
      maxWidth: '40vw',
  },
  anchor: {
      textDecoration: 'none',
      color: '#2b5876',
  }
}));

export default function QuestionsHelper() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
        <div className={classes.iconBtn}>
            <IconButton onClick={handleOpen} aria-label="delete" className={classes.margin}>
                <HelpIcon fontSize="large" />
            </IconButton>
        </div>
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={open}>
                <Paper className={classes.paper}>
                    <h2 id="transition-modal-title">What is this project?</h2>
                    <p className={classes.bodyText}>
                        This project is a visualization of the many languages spoken in the United States, divided by metro areas, states, and counties.
                        You can see how many speakers of that language there are and where they are located in the U.S. 
                        as well as where the main population of those speakers are in the world.
                        Select a language and location to start exploring the diversity of languages in the United States.  
                    </p>
                    <h3 style={{ marginBottom: 0 }} id="transition-modal-subtitle">Sources used</h3>
                    <Box display="flex" justifyContent="flex-start" flexWrap="wrap" alignItems="flex-start">
                        <List>
                            <ListItem>
                                <a target="_blank" className={classes.anchor} href="https://www.kaggle.com/rtatman/world-atlas-of-language-structures">
                                    Dryer, Matthew S. & Haspelmath, 
                                    Martin (eds.) 2013. The World Atlas of Language Structures Online. 
                                    Leipzig: Max Planck Institute for Evolutionary Anthropology. (Available online at http://wals.info)</a>
                            </ListItem>
                            <ListItem>
                                <a target="_blank" className={classes.anchor} href="www.omniglot.com">
                                    Ager, Simon. "Omniglot - writing systems and languages of the world".10th May 2021.
                                </a>
                            </ListItem>
                            <ListItem>
                                <a target="_blank" className={classes.anchor} href="https://www.census.gov/data/tables/2013/demo/2009-2013-lang-tables.html">
                                    Detailed Languages Spoken at Home and Ability to Speak English for the Population 5 Years and Over: 2009-2013
                                </a>
                            </ListItem>
                            <ListItem>
                                <a target="_blank" className={classes.anchor} href="https://www.census.gov/programs-surveys/acs/microdata/access.html">
                                ACS 1-Year Estimates-Public Use Microdata Sample 2019
                                </a>
                            </ListItem>
                        </List>
                    </Box>
                </Paper>
            </Fade>
        </Modal>
    </div>
  );
}