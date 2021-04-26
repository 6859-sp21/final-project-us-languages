import React, { useEffect, useState } from 'react';
import './App.css';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import axios from 'axios';

import Map from './components/Map.js';
import Navbar from './components/Navbar';
import LanguageSelect from './components/LanguageSelect';

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

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [statesData, setStatesData] = useState({})
  const [locationsData, setLocationsData] = useState({})
  const [languagesData, setLanguagesData] = useState({})
  const [allLanguages, setAllLanguages] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState("")

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

  function handleLanguageChange(event) {
    setSelectedLanguage(event.target.innerText);
  };

  return (
    <div className="App">
      <MuiThemeProvider theme={theme} >
          <div className="background">
            <Navbar />
            <LanguageSelect allLanguages={allLanguages} handleLanguageChange={handleLanguageChange}/>
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
