import React, { useEffect, useState } from 'react';
import './App.css';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import axios from 'axios';

import Map from './Map.js';

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
  const [mapData, setMapData] = useState({})

  useEffect(() => {
    axios.get('/api/countries').then(res => {
      setMapData(res.data.mapData);
      setIsLoaded(true);
    }) 
  }, [])

  return (
    <div className="App">
      <MuiThemeProvider theme={theme} >
          <div className="background">
            { isLoaded ? 
                <Map size={800} data={mapData}/>
                : null
            }
          </div>
      </MuiThemeProvider>
    </div>
  );
}

export default App;
