import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles({
  option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },
});

export default function LanguageSelect({mapOption, allMetroLanguages, allStateLanguages,handleLanguageChange}) {
  const classes = useStyles();
  function switchLanguages(mapOption) {
    switch (mapOption) {
      case 'Metro':
        return  allMetroLanguages;
      case 'Counties':
        return  ["Population 5 Years And Over","Speak A Language Other Than English", "Spanish", "IndoEuropean", "Asian Pacific Island", "Other"];
      case 'States':
        return  allStateLanguages;
      default:
        return [];
    }
  }
  const languages = switchLanguages(mapOption);

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", width: '100%', flexWrap: 'wrap'}}>
      <Autocomplete
        key={mapOption}
        id="language-select"
        style={{ width: 300, marginTop: 10}}
        options={languages}
        classes={{option: classes.option}}
        blurOnSelect
        clearOnEscape
        disableClearable={true}
        getOptionLabel={(option) => option}
        onChange={(event, d) => handleLanguageChange(d !== null && mapOption === "Counties" ? d.replace(/\s+/g, '') : d)}
        renderOption={(option) => (
          <React.Fragment>
            {option}
          </React.Fragment>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search for a Language"
            variant="outlined"
            inputProps={{
              ...params.inputProps,
              autoComplete: 'new-password', // disable autocomplete and autofill
            }}
          />
        )}
      />
      <p>Sorted by number of speakers (Descending)</p>
    </div>
  );
}