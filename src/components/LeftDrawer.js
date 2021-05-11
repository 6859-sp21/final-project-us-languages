import React, { useState, useEffect, useRef } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import * as d3 from "d3";

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
    fontWeight: 400,
    marginLeft: 10,
    fontSize: 19,
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
    sortedLocLanguages, 
    handleDrawerClose,
    languagesMetroData,
    allMetroLanguages,
    locationsData,
  } = props;
  const allMetroLanguagesSet = new Set(allMetroLanguages);

  const [audioClipUrl, setAudioClipUrl] = useState('')
  const [audioClipTranslation, setAudioClipTranslation] = useState('')
  const [audioClipAvailible, setAudioClipAvailible] = useState(false);
  const histoRef = useRef()
  const wrapperRef = useRef()
  const classes = useStyles();
  const theme = useTheme();
  const {sortedLocLangData, selectedLangIndex} = sortedLocLanguages;
  // let sortedLocLangData = [];
  const metroArea = selectedLocation.split(',')[0];
  const abbrev = ['st', 'nd', 'rd', 'th']
  const histogramTransitionSpeed = 500;

  function stringifyNumber(index) {
    const n = index + 1
    if (n <= 3) return `${n}${abbrev[index]}`
    else return `${n}${abbrev[3]}`
  }

  //Source: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  useEffect(() => {
    if (sortedLocLangData.length && languagesMetroData.length) {

  
      // const filteredLocations = languagesMetroData.filter(entry => {
      //     return entry.Language === selectedLanguage && locationsData[entry.Location];
      // }).sort((a,b) => {
      //     return parseInt(b["NumberOfSpeakers"]) - parseInt(a["NumberOfSpeakers"]);
      // });
      
      function showHistogram(d) {
        d3.select("#drawer-histogram").selectAll("svg").remove();
        d3.select(wrapperRef.current)
          .append("div")
          .attr("id", "drawer-histogram")
          .style("opacity", 0);
  
        const height = 200, width = 300;
        const margin = ({top: 30, right: 70, bottom: 20, left: 80});

        const svg = d3.create('svg')
          .attr('width', width)
          .attr('height', height);

        // const selectedLocLangData = languagesMetroData.filter(entry => entry.Location === d.Location && !isNaN(parseInt(entry.NumberOfSpeakers)) && allMetroLanguagesSet.has(entry.Language));
        // sortedLocLangData = selectedLocLangData.sort((a,b) => parseInt(b['NumberOfSpeakers']) - parseInt(a['NumberOfSpeakers']));
        // selectedLangIndex = sortedLocLangData.findIndex(e => e.Language === d.Language);
        const dataToGraph = sortedLocLangData.slice(Math.max(selectedLangIndex-2, 0), Math.max(selectedLangIndex+3, 5));
        console.log('data to graph: ', dataToGraph, sortedLocLangData);
        const graphedLanguages = dataToGraph.map(entry => entry.Language);
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
  
        // svg.append('text')
        //     .attr('text-anchor', 'middle')
        //     .attr('fill', '#fff')
        //     .style('font-size', 'medium')
        //     .attr('x', width/2)
        //     .attr('y', margin.top)
        //     .attr('dy', '-0.5em')
        //     .text(d.Location);
        
        const axis = svg.append('g')
            .style('color', "black")
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yMargin).tickSize(0));
  
        axis.select(".domain").remove();
        axis.selectAll('text')
            .attr('dx', -2)
            .style("font-size", 'small');
  
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
            .style("opacity", 1);
  
        document.getElementById("drawer-histogram").appendChild(svg.node());
      }
  
      showHistogram(sortedLocLangData[selectedLangIndex]);
    }
  }, [selectedLanguage, sortedLocLangData])

  useEffect(() => {
    const language = selectedLanguage ? selectedLanguage.toLowerCase() : "";
    if (language in audioMetadata) {
      const id = audioMetadata[language].DriveID;
      const translation = audioMetadata[language].Translation;
      const url = `https://docs.google.com/uc?export=download&id=${id}`
      setAudioClipUrl(url);
      setAudioClipTranslation(translation);
      setAudioClipAvailible(true);
    } else {
      setAudioClipAvailible(false);
    }
    }, [audioMetadata, selectedLanguage])
  //Source: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
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
            <Typography className={classes.title}>{selectedLocation.split(',')[0]}</Typography>
          </div>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <div className={classes.container} id="description">
            {sortedLocLangData.length !== 0 ?
            (<p>
              <b>{sortedLocLangData[selectedLangIndex].Language}</b> is the <b>{stringifyNumber(selectedLangIndex)}</b> most spoken language in {metroArea} (excluding English). There 
              are {numberWithCommas(sortedLocLangData[selectedLangIndex].NumberOfSpeakers)} speakers in the area.            
            </p>)
            : null
            }
        </div>
        <div className={classes.container} >
            <div>Nearest neighbors of this language by number of speakers</div>
            <div ref={wrapperRef}></div>
        </div>
        <div className={classes.container}>
          {audioClipAvailible ? 
            (
              <div>
                <p>Audio clip translation: {audioClipTranslation}</p> 
                <audio src={audioClipUrl} type="audio/mp3" controls="controls"></audio>
              </div>
            )
          : <p>No audiocips availible</p>
          }

        </div>
        
      </Drawer>
    </div>
  );
}