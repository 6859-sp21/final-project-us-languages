import React, { useEffect, useState } from 'react';
import './App.css';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import axios from 'axios';

import Map from './components/Map.js';
import Navbar from './components/Navbar';

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

  useEffect(() => {
    axios
      .all([
        axios.get('/api/datasets/states'),
        axios.get('/api/datasets/locations'),
        axios.get('/api/datasets/languages'),
      ])
      .then(res => {
        setStatesData(res[0].data.statesData);
        setLocationsData(res[1].data.locationsData);
        setLanguagesData(res[2].data.langData);
        setIsLoaded(true);
      });
  }, [])

  return (
    <div className="App">
      <MuiThemeProvider theme={theme} >
          <div className="background">
            <Navbar />
            { isLoaded ? 
                <Map size={1200} statesData={statesData} locationsData={locationsData} languagesData={languagesData}/>
                : null
            }
          </div>
      </MuiThemeProvider>
    </div>
  );
}

export default App;
