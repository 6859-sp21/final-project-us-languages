import React, { useEffect, useState } from 'react';
import './App.css';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import axios from 'axios';

import Map from './components/Map.js';
import Navbar from './components/Navbar';
import LanguageSelect from './components/LanguageSelect';
import LeftDrawer from './components/LeftDrawer';
import LandingOverlay from './components/LandingOverlay';
import Globe from './components/Globe';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2b5876'
    },
    secondary: {
      main: '#4e4376'
    }
  }
});

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [statesData, setStatesData] = useState({})
  const [locationsData, setLocationsData] = useState({})
  const [languagesData, setLanguagesData] = useState({})
  const [allLanguages, setAllLanguages] = useState([])
  const [countriesData, setCountriesData] = useState({})
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [sortedLocLanguages, setSortedLocLanguages] = useState({sortedLocLangData: [], selectedLangIndex: 0})
  const [audioMetadata, setAudioMetadta] = useState({})
  const [hidden, setHidden] = useState(false);
  
  const [open, setOpen] = useState(false);

  const handleLocationClick = (data) => {
    setSelectedLocation(data.Location);
    handleDrawerOpen()
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    axios
      .all([
        axios.get('/api/datasets/states'),
        axios.get('/api/datasets/locations'),
        axios.get('/api/datasets/languages'),
        axios.get('/api/datasets/allLanguages'),
        axios.get('/api/datasets/countries'),
        axios.get('/api/audioclips/metadata'),
      ])
      .then(res => {
        setStatesData(res[0].data.statesData);
        setLocationsData(res[1].data.locationsData);
        setLanguagesData(res[2].data.langData);
        setAllLanguages(res[3].data.allLanguagesData);
        setCountriesData(res[4].data.countriesData);
        setAudioMetadta(res[5].data.metadata);
        setIsLoaded(true);
      });
    }, [])
    
  function handleLanguageChange(newLanguage) {
    setSelectedLanguage(newLanguage);
  };

  // set the size of the map based on the size of the user's window
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 2;
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) /1.5;

  return (
    <div className="App">
      <MuiThemeProvider theme={theme} >
          <div className="block">
            <div className={hidden ? 'foreground-overlay' : 'foreground-overlay foreground-zIndex'}>
              <LandingOverlay hidden={hidden} setHidden={setHidden}></LandingOverlay>
            </div>
            <div className="background-overlay">
              {/* <Navbar /> */}
              <LeftDrawer 
                open={open} 
                selectedLocation={selectedLocation} 
                languagesData={languagesData} 
                handleDrawerClose={handleDrawerClose}
                sortedLocLanguages={sortedLocLanguages}
                audioMetadata={audioMetadata}
                selectedLanguage={selectedLanguage}
                />
              { isLoaded ? 
                (
                  <div className="main-container">
                    <LanguageSelect allLanguages={allLanguages} handleLanguageChange={handleLanguageChange}/>
                    <div className="content-container">
                      <Map 
                        sizeVw={vw*1.35}
                        sizeVh={vh*1.35}
                        handleLocationClick={handleLocationClick}
                        allLanguages={allLanguages}
                        statesData={statesData} 
                        locationsData={locationsData} 
                        languagesData={languagesData} 
                        setSortedLocLanguages={setSortedLocLanguages}
                        selectedLanguage={selectedLanguage}/>
                      <Globe 
                        sizeVw={vw/4}
                        sizeVh={vw/4}
                        data={countriesData}/>
                    </div>
                  </div>
                )
                  : null
              }
            </div>
          </div>
      </MuiThemeProvider>
    </div>
  );
}

export default App;
