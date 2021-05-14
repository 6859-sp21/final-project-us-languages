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
import MapSelect from './components/MapSelect';

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
  const [allMetroLanguages, setAllMetroLanguages] = useState({})
  const [languagesStateData, setLanguagesStateData] = useState([])
  const [allStateLanguages, setAllStateLanguages] = useState({})
  const [countriesData, setCountriesData] = useState({})
  const [selectedLanguage, setSelectedLanguage] = useState({'Language': ""})
  const [selectedLocation, setSelectedLocation] = useState("")
  const [sortedLocLanguages, setSortedLocLanguages] = useState({sortedLocLangData: [], selectedLangIndex: 0})
  const [audioMetadata, setAudioMetadata] = useState({})
  const [originsData, setOriginsData] = useState({})
  const [countryCodes, setCountryCodes] = useState({})
  const [stateIDs, setStateIDs] = useState({})

  const [hidden, setHidden] = useState(false);
  const [mapOption, setMapOption] = useState("Metro"); // either 'Metro', 'Counties', or 'States'

  const [open, setOpen] = useState(false);

  const handleLocationClick = (data) => {
    const loc = data.Location || stateIDs[data.id];
    console.log('selected loc', loc);
    setSelectedLocation(loc);
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
        axios.get('/api/datasets/country-codes'),
        axios.get('/api/datasets/global-origins'),
        axios.get('/api/datasets/id-2-state'),
      ])
      .then(res => {
        setBordersData(res[0].data.bordersData);
        setLocationsData(res[1].data.locationsData);
        setLanguagesMetroData(res[2].data.langMetroData);
        setAllMetroLanguages(res[3].data.languagesOnlyMetroData);
        setLanguagesStateData(res[4].data.langStateData);
        setAllStateLanguages(res[5].data.languagesOnlyStatesData);
        setCountriesData(res[6].data.countriesData);
        setAudioMetadata(res[7].data.metadata);
        setCountiesData(res[8].data.countyData);
        setCountryCodes(res[9].data.countryCodesData);
        setOriginsData(res[10].data.originsData);
        setStateIDs(res[11].data.id2state);
        setIsLoaded(true);
      });
    }, [])
    
  function handleLanguageChange(newLanguage) {
    if (newLanguage in allMetroLanguages) {
      console.log(newLanguage, allMetroLanguages[newLanguage]);
      setSelectedLanguage(allMetroLanguages[newLanguage]);
    } else if (newLanguage in allStateLanguages) {
      console.log(newLanguage, allStateLanguages[newLanguage]);
      setSelectedLanguage(allStateLanguages[newLanguage]);
    } else {
      console.log(newLanguage, {'Language': newLanguage});
      setSelectedLanguage({'Language': newLanguage});
    }
    handleDrawerClose();
  };

  function handleMapOptionChange(newMapOption) {
    setMapOption(newMapOption);
    setSelectedLanguage({'Language': ""});
    handleDrawerClose();
  }

  // get the max size of the user's window
  const maxVw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const maxVh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  // set the size of the map based on the size of the user's window
  const vw = maxVw / 2;
  const vh = maxVh /1.5;

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
                languagesMetroData={languagesMetroData}
                allMetroLanguages={Object.keys(allMetroLanguages)}
                languagesStateData={languagesStateData}
                allStateLanguages={Object.keys(allStateLanguages)}
                sortedLocLanguages={sortedLocLanguages}
                audioMetadata={audioMetadata}
                selectedLanguage={selectedLanguage.Language}
                mapOption={mapOption}
                />
              { isLoaded ? 
                (
                  <div className="main-container">
                    <div className="row-container">
                      <MapSelect setMapOptionParent={handleMapOptionChange}/>
                      <LanguageSelect 
                        mapOption={mapOption} 
                        allMetroLanguages={Object.keys(allMetroLanguages)}
                        allStateLanguages={Object.keys(allStateLanguages)}
                        handleLanguageChange={handleLanguageChange}
                      />
                    </div>
                    <div className="content-container">
                      <Map 
                        sizeVw={vw}
                        sizeVh={vh}
                        mapOption={mapOption}
                        handleLocationClick={handleLocationClick}
                        bordersData={bordersData}
                        locationsData={locationsData}
                        countiesData={countiesData}
                        statesData={languagesStateData}
                        stateIDs={stateIDs}
                        languagesMetroData={languagesMetroData} 
                        languagesStateData={languagesStateData}
                        setSortedLocLanguages={setSortedLocLanguages}
                        selectedLanguage={selectedLanguage.Language || selectedLanguage}
                        selectedLanguage={selectedLanguage.Language}/>
                      <Globe 
                        sizeVw={13* maxVw / 100}
                        sizeVh={13* maxVw / 100}
                        selectedLanguage={selectedLanguage}
                        originsData={originsData}
                        countryCodes={countryCodes}
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
