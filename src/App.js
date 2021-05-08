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
  const [bordersData, setBordersData] = useState({})
  const [locationsData, setLocationsData] = useState({})
  const [countiesData, setCountiesData] = useState({})
  const [languagesMetroData, setLanguagesMetroData] = useState([])
  const [allMetroLanguages, setAllMetroLanguages] = useState([])
  const [languagesStateData, setLanguagesStateData] = useState([])
  const [allStateLanguages, setAllStateLanguages] = useState([])
  const [countriesData, setCountriesData] = useState({})
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [sortedLocLanguages, setSortedLocLanguages] = useState({sortedLocLangData: [], selectedLangIndex: 0})
  const [audioMetadata, setAudioMetadata] = useState({})
  const [hidden, setHidden] = useState(false);
  const mapOption = "Counties"; // either 'Metro', 'Counties', or 'States'

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
        axios.get('/api/datasets/borders'),
        axios.get('/api/datasets/locations'),
        axios.get('/api/datasets/metro-languages'),
        axios.get('/api/datasets/metro-languages-only'),
        axios.get('/api/datasets/state-languages'),
        axios.get('/api/datasets/state-languages-only'),
        axios.get('/api/datasets/countries'),
        axios.get('/api/audioclips/metadata'),
        axios.get('/api/datasets/counties-languages'),
      ])
      .then(res => {
        setBordersData(res[0].data.bordersData);
        setLocationsData(res[1].data.locationsData);
        setLanguagesMetroData(res[2].data.langMetroData);
        setAllMetroLanguages(res[3].data.languagesOnlyMetroData);
        setLanguagesStateData(res[4].data.langStateData);
        setAllStateLanguages(res[5].data.languagesOnlyMetroData);
        setCountriesData(res[6].data.countriesData);
        setAudioMetadata(res[7].data.metadata);
        setCountiesData(res[8].data.countyData);
        setIsLoaded(true);
      });
    }, [])
    
  function handleLanguageChange(newLanguage) {
    console.log(newLanguage);
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
                languagesMetroData={languagesMetroData} 
                handleDrawerClose={handleDrawerClose}
                sortedLocLanguages={sortedLocLanguages}
                audioMetadata={audioMetadata}
                selectedLanguage={selectedLanguage}
                />
              { isLoaded ? 
                (
                  <div className="main-container">
                    <LanguageSelect mapOption={mapOption} allMetroLanguages={allMetroLanguages} handleLanguageChange={handleLanguageChange}/>
                    <div className="content-container">
                      <Map 
                        sizeVw={vw}
                        sizeVh={vh}
                        mapOption={mapOption}
                        handleLocationClick={handleLocationClick}
                        allMetroLanguages={allMetroLanguages}
                        allStateLanguages={allStateLanguages}
                        bordersData={bordersData}
                        locationsData={locationsData}
                        countiesData={countiesData}
                        languagesMetroData={languagesMetroData} 
                        languagesStateData={languagesStateData}
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
