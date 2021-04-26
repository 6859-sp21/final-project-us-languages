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

export default function LanguageSelect({allLanguages, handleLanguageChange}) {
  const classes = useStyles();

  return (
    <div style={{ display: "flex", justifyContent: "center"}}>
      <Autocomplete
        id="language-select"
        style={{ width: 300, marginTop: 10}}
        options={allLanguages}
        classes={{option: classes.option}}
        
        getOptionLabel={(option) => option}
        onChange={handleLanguageChange}
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
  );
}