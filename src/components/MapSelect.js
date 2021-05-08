import React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

export default function MapSelect({setMapOptionParent}) {
  const [mapOption, setMapOption] = React.useState('Metro');

  const handleSelect = (event, newOption) => {
    setMapOption(newOption);
    setMapOptionParent(newOption);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", width: '100%', paddingRight: '10px', paddingTop:'10px'}}>
      <ToggleButtonGroup
        value={mapOption}
        exclusive
        onChange={handleSelect}
        aria-label="map options"
        size='small'
      >
        <ToggleButton value="Metro">
          Metro Areas
        </ToggleButton>
        <ToggleButton value="Counties">
          Counties
        </ToggleButton>
        <ToggleButton value="States">
          States
        </ToggleButton>
      </ToggleButtonGroup>
  </div>
  );
}