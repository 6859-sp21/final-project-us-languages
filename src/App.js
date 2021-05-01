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
      ])
      .then(res => {
        setStatesData(res[0].data.statesData);
        setLocationsData(res[1].data.locationsData);
        setLanguagesData(res[2].data.langData);
        setAllLanguages(res[3].data.allLanguagesData);
        setCountriesData(res[4].data.countriesData);
        setIsLoaded(true);
        console.log('countries', countriesData);
      });
    }, [])
    
  function handleLanguageChange(newLanguage) {
    setSelectedLanguage(newLanguage);
  };

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
                />
              { isLoaded ? 
                (
                  <div>
                    <LanguageSelect allLanguages={allLanguages} handleLanguageChange={handleLanguageChange}/>
                    <Map 
                      size={1200} 
                      handleLocationClick={handleLocationClick}
                      allLanguages={allLanguages}
                      statesData={statesData} 
                      locationsData={locationsData} 
                      languagesData={languagesData} 
                      setSortedLocLanguages={setSortedLocLanguages}
                      selectedLanguage={selectedLanguage}/>
                    <Globe 
                      sizeVw={250}
                      sizeVh={250}
                      data={countriesData}/>
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
