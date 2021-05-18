import React, { useState, useEffect, useRef } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import * as d3 from "d3";
import { Box } from '@material-ui/core';

const drawerWidth = 350;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    // top: 64,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    marginTop: 40,
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
  title: {
    fontWeight: 600,
    marginLeft: 10,
    fontSize: 23,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textAlign: 'left',
  }, 
  titleContainer: {
    overflow: 'hidden',
    width: 280,
  },
  container: {
    margin: '0 20px',
    fontSize: '1rem',
    textAlign: 'left', 
    // padding: '0 10px',
  },
  subHeading: {
    marginBottom: 0,
  },
  anchor: {
    textDecoration: 'none',
    color: '#2b5876',
    textAlign: 'right',
  },
  heading: {
    marginTop: 10,
  }
}));

/**
 * Left drawer that appears when a user clicks on a circle location on the Map
 * 
 * @param {Boolean} open whether the drawer should be open or closed
 * @param {String} selectedLocation metro area circle clicked by the user
 * @param {Object} sortedLocLanguages contains the list of languages that a metro area has and the index that corresponds to the language selected by user
 * @param {Function} handleDrawerClose closes the drawer 
 * @returns 
 */
export default function LeftDrawer(props) {
  const {
    open, 
    audioMetadata, 
    selectedLanguage, 
    selectedLocation, 
    handleDrawerClose,
    countiesData,
    languagesMetroData,
    allMetroLanguages,
    languagesStateData,
    allStateLanguages,
    mapOption,
  } = props;
  

  const [audioClipUrl, setAudioClipUrl] = useState('')
  const [audioClipDetails, setAudioClipDetails] = useState({})
  const [audioClipAvailible, setAudioClipAvailible] = useState(false);
  const [sortedLocLangData, setSortedLocLangData] = useState([]);
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);

  const wrapperRef = useRef()
  const classes = useStyles();
  const theme = useTheme();
  // const {sortedLocLangData, selectedLangIndex} = sortedLocLanguages;
  // let sortedLocLangData = [];
  const abbrev = ['st', 'nd', 'rd', 'th']
  const histogramTransitionSpeed = 500;

  function stringifyNumber(index) {
    const n = index + 1;
    const idx = Math.min(index, 3);
    if (n >= 11) {
      const stringIdx = index.toString()
      const onesDigit = stringIdx[stringIdx.length-1];
      if (parseInt(onesDigit) <= 3) return `${n}${abbrev[parseInt(onesDigit)]}`
      else return `${n}${abbrev[3]}`
    }
    if (n <= 3) return `${n}${abbrev[idx]}`
    else return `${n}${abbrev[3]}`
  }

  //Source: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function sortLanguages(languageData, allLanguages) {
    const filteredLocations = languageData.filter(entry => {
      return entry.Language === selectedLanguage && entry.Location === selectedLocation;
    }).sort((a,b) => {
        return parseInt(b["NumberOfSpeakers"]) - parseInt(a["NumberOfSpeakers"]);
    });

    if (filteredLocations.length !== 0) {
      const locData = filteredLocations[0];

      const allLanguagesSet = new Set(allLanguages);
      const selectedLocLangData = languageData.filter(entry => entry.Location === locData.Location && !isNaN(parseInt(entry.NumberOfSpeakers)) && allLanguagesSet.has(entry.Language));
      const sortedLocLangData = selectedLocLangData.sort((a,b) => parseInt(b['NumberOfSpeakers']) - parseInt(a['NumberOfSpeakers']));
      const selectedLangIndex = sortedLocLangData.findIndex(e => e.Language === locData.Language);
      const dataToGraph = sortedLocLangData.slice(Math.max(selectedLangIndex-2, 0), Math.max(selectedLangIndex+3, 5));
      const graphedLanguages = dataToGraph.map(entry => entry.Language);
      setSortedLocLangData(sortedLocLangData);
      setSelectedLangIndex(selectedLangIndex);
      return {dataToGraph, graphedLanguages, filteredLocations};
    }

  }

  function validateData(languageData, allLanguages, selectedLocation) {
    return languageData.length !== 0 && allLanguages.length !== 0 && selectedLocation !== '';
  }

  useEffect(() => {
    // console.log('in use ', Object.keys(locationsData).length !== 0 && languagesMetroData.length !== 0 && selectedLocation !== '');

      if (mapOption === 'Metro') {
        // ensure a location is selected and metro languages available 
        if (validateData(languagesMetroData, allMetroLanguages, selectedLocation)){
          const sortedData = sortLanguages(languagesMetroData, allMetroLanguages);
          if (sortedData) {
            const {dataToGraph, graphedLanguages, filteredLocations} = sortedData;
            if (filteredLocations.length !== 0) {
              showHistogram(dataToGraph, graphedLanguages, filteredLocations[0])
            }
          }
        } else {

        }
      } else if (mapOption === 'States') {
        if (validateData(languagesStateData, allStateLanguages, selectedLocation)) {
          const sortedData = sortLanguages(languagesStateData, allStateLanguages);
          if (sortedData) {
            const {dataToGraph, graphedLanguages, filteredLocations} = sortedData;
            if (filteredLocations.length !== 0) {
              showHistogram(dataToGraph, graphedLanguages, filteredLocations[0])
            }
          }
        }

      } else if (mapOption === 'Counties') {
        const allCountyLanguages = ["Population 5 Years And Over","Speak A Language Other Than English", "Spanish", "IndoEuropean", "Asian Pacific Island", "Other"];
        console.log(countiesData[selectedLocation], selectedLocation, selectedLanguage);
        if (validateData(countiesData, allCountyLanguages, selectedLocation)) {
        }
      }
      
      function showHistogram(dataToGraph, graphedLanguages, d) {
        d3.select("#drawer-histogram").selectAll("svg").remove();
        d3.select(wrapperRef.current)
          .append("div")
          .attr("id", "drawer-histogram")
          .style("opacity", 0);
        
        const longestLanguageLength = Math.max(...dataToGraph.map(obj => obj.Language.length));  
        let adjustedMargin = 0;
        if (longestLanguageLength > 8) {
          adjustedMargin += longestLanguageLength * 4.5;
        }
  
        const height = 200, width = 300 + adjustedMargin;
        const margin = ({top: 30, right: 70, bottom: 20, left: 80 + adjustedMargin});

        const svg = d3.create('svg')
          .attr('width', width)
          .attr('height', height);

        const colorScale = language => language === d.Language ? "#2b5876" : "#ccc";
  
        const xScale = d3.scaleLinear()
            .domain([0, parseInt(dataToGraph[0].NumberOfSpeakers)])
            .range([0, width]);
        const xMargin = xScale.copy().range([margin.left, width - margin.right]);
  
        const yScale = d3.scaleBand()
            .domain(graphedLanguages)
            .range([height, 0])
            .paddingInner(0.25);
        const yMargin = yScale.copy().range([height - margin.bottom, margin.top]);

        
        const g = svg.selectAll('g')
            .data(dataToGraph)
            .enter() 
            .append('g')
                .attr('transform', d => `translate(${margin.left}, ${yMargin(d.Language)})`);
        
        g.append('rect')
            .attr('width', 0)
            .attr('height', yMargin.bandwidth())
            .style('fill', d => colorScale(d.Language))
            .style('padding-bottom', 5)
            .style('stroke', '#fff');
        
        g.append('text')
            .attr('x', 0)
            .attr('dx', 4)
            .attr('dy', '1.25em')
            .attr('fill', 'black')
            .style('font-size', 'small')
            .text(d => numberWithCommas(d.NumberOfSpeakers))
  
        const axis = svg.append('g')
            .style('color', "black")
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yMargin).tickSize(0));
  
        const adjustedIdx = [-2, -1, 0, 1, 2];

        function determineIdx(language, idx) {
          if (selectedLangIndex < 2) {
            return `${idx + 1}. ` + language
          }
          return `${selectedLangIndex - adjustedIdx[adjustedIdx.length - 1 - idx] + 1}. ` + language
        }

        axis.select(".domain").remove();
        axis.selectAll('text')
            .attr('dx', -2)
            .style("font-size", 'small')
            .text((d, idx) => determineIdx(d, idx));
  
        setTimeout(() => {
          g.selectAll('rect')
              .transition()
              .duration(histogramTransitionSpeed)
              .attr('width', (d) => xMargin(parseInt(d.NumberOfSpeakers)) - xMargin(0))
    
          g.selectAll('text')
              .transition()
              .duration(histogramTransitionSpeed)
              .attr('x', (d) => xMargin(parseInt(d.NumberOfSpeakers)) - xMargin(0))
        }, 500)
  
        d3.select("#drawer-histogram")
            .style("left", (15) + "px")
            .style("top", (255) + "px")
            .style("overflow-x", 'auto')
            .style("opacity", 1);
  
        document.getElementById("drawer-histogram").appendChild(svg.node());
    }

  }, [selectedLocation, selectedLangIndex, selectedLanguage, mapOption])

  useEffect(() => {
    const language = selectedLanguage ? selectedLanguage.toLowerCase() : "";
    if (language in audioMetadata) {
      const id = audioMetadata[language].DriveID;
      const details = audioMetadata[language];
      const url = `https://docs.google.com/uc?export=download&id=${id}`
      setAudioClipUrl(url);
      setAudioClipDetails(details);
      setAudioClipAvailible(true);
    } else {
      setAudioClipAvailible(false);
    }
    }, [audioMetadata, selectedLanguage])

  return (
    <div className={classes.root}>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <div className={classes.titleContainer}>
            {
              mapOption === 'Metro' || mapOption === 'States' ? 
              <Typography variant='h2' className={classes.title} title={selectedLocation.split(',')[0]}>{selectedLocation.split(',')[0]}</Typography>
              : null
            }
            {
              mapOption === 'Counties' && countiesData[selectedLocation] ?
              <Typography variant='h2' className={classes.title} title={countiesData[selectedLocation].County}>{countiesData[selectedLocation].County}</Typography>
              : null
            }
          </div>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <div className={classes.container} id="description">
            {selectedLanguage !== ''&& sortedLocLangData.length !== 0 && (mapOption === 'Metro' || mapOption === 'States') ?
            (<p> 
              <b>{sortedLocLangData[selectedLangIndex].Language}</b> is the <b>{stringifyNumber(selectedLangIndex)}</b> most spoken language in {selectedLocation.split(',')[0]}. There 
              are {numberWithCommas(sortedLocLangData[selectedLangIndex].NumberOfSpeakers)} speakers in the area.            
            </p>)
            : null
            }
            {
              countiesData[selectedLocation] && mapOption === 'Counties' && selectedLanguage !== ''? 
              (
                <div>
                  <p>
                    There are {countiesData[selectedLocation][selectedLanguage]} speakers in the area.
                  </p>
                  <br/>
                  {selectedLanguage === 'IndoEuropean' ? 
                  <a className={classes.anchor} rel="noreferrer" target="_blank" href="https://www.worldhistory.org/Indo-European_Languages/">
                    What are Indo-European languages?</a> 
                  : null}
                  {selectedLanguage === 'AsianPacificIsland' ? 
                  <a className={classes.anchor} rel="noreferrer" target="_blank" href="https://www.languagescientific.com/asia-pacific-languages-translation-and-localization//">
                    What are Asian/Pacific Islander Languages languages?</a> 
                  : null}
                  
                </div>
              )
              : null
            }
        </div>
        <br />
        <div className={classes.container} >
          {selectedLanguage !== "" && (mapOption === 'Metro' || mapOption === 'States') ?
            (
              <div>
                <p>Nearest neighbors of this language by number of speakers</p>
                <div ref={wrapperRef}></div>
              </div>
            ) : null
          }
          {
            selectedLanguage === "" ? <p>Select a language to get started</p> : null
          }
        </div>
        <div className={classes.container}>
          {audioClipAvailible ? 
            (
              <div>
                <p className={classes.subHeading}>Audio clip translation: </p> 
                <h3 className={classes.heading}>{audioClipDetails.Translation}</h3>
                <p className={classes.subHeading}>Audio clip transliteration:</p> 
                <h3 className={classes.heading}>{audioClipDetails.Script}</h3>
                <audio src={audioClipUrl} type="audio/mp3" controls="controls"></audio>
                <Box style={{textAlign: 'right', padding: 10}}>
                  <a rel="noreferrer" target="_blank" className={classes.anchor} href={audioClipDetails.Source}>Learn more</a> 
                </Box>
              </div>
            )
          : <p>No audioclip availible</p>
          }

        </div>
        
      </Drawer>
    </div>
  );
}