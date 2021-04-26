import React, { useEffect, useState } from 'react';
import './App.css';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import axios from 'axios';

import Map from './components/Map.js';
import Navbar from './components/Navbar';

import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#D67474'
    },
    secondary: {
      main: '#FFE8D6'
    }
  }
});

const useStyles = makeStyles({
  option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },
});

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [statesData, setStatesData] = useState({})
  const [locationsData, setLocationsData] = useState({})
  const [languagesData, setLanguagesData] = useState({})
  const [allLanguages, setAllLanguages] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState("")

  const classes = useStyles();

  useEffect(() => {
    axios
      .all([
        axios.get('/api/datasets/states'),
        axios.get('/api/datasets/locations'),
        axios.get('/api/datasets/languages'),
        axios.get('/api/datasets/allLanguages'),
      ])
      .then(res => {
        setStatesData(res[0].data.statesData);
        setLocationsData(res[1].data.locationsData);
        setLanguagesData(res[2].data.langData);
        setAllLanguages(res[3].data.allLanguagesData);
        setIsLoaded(true);
      });
  }, [])

  function handleChange(event) {
    console.log(event.target.innerText);
    setSelectedLanguage(event.target.innerText);
  };

  return (
    <div className="App">
      <MuiThemeProvider theme={theme} >
          <div className="background">
            <Navbar />
            <div style={{ display: "flex", justifyContent: "center"}}>
              <Autocomplete
                id="language-select"
                style={{ width: 300, marginTop: 10}}
                options={allLanguages}
                classes={{option: classes.option}}
                autoHighlight
                getOptionLabel={(option) => option}
                onChange={handleChange}
                renderOption={(option) => (
                  <React.Fragment>
                    {option}
                  </React.Fragment>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Choose a Language"
                    variant="outlined"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password', // disable autocomplete and autofill
                    }}
                  />
                )}
              />
            </div>
            { isLoaded ? 
                <Map size={1200} statesData={statesData} locationsData={locationsData} languagesData={languagesData} selectedLanguage={selectedLanguage}/>
                : null
            }
          </div>
      </MuiThemeProvider>
    </div>
  );
}

export default App;
