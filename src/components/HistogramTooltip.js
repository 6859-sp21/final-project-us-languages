import React, { useRef} from 'react'
import * as d3 from "d3";
import '../App.css';

/** 
 * 
 * @param {Array} allLanguages array of all languages in the dataset
 * @param {String} selectedLanguage the language for which to display data on the map
 * @param {Object} event object with 'event' and 'd' properties
 * @returns 
 */
export default function HistogramTooltip({allLanguages, languagesData, eventD}) {
  //Source: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const event = eventD.event;
  const d = eventD.d;

  const wrapperRef = useRef();
  const histogramTransitionSpeed = 500;
  const height = 200, width = 400;
  const margin = ({top: 30, right: 70, bottom: 20, left: 80});

  d3.select(wrapperRef.current).selectAll('svg').remove();

  if (d !== undefined && event !== undefined) {
    const svg = d3.select(wrapperRef.current)
      .append('svg')
        .attr('width', width)
        .attr('height', height);
    const allLanguagesSet = new Set(allLanguages);

    const selectedLocLangData = languagesData.filter(entry => entry.Location === d.Location && !isNaN(parseInt(entry.NumberOfSpeakers)) && allLanguagesSet.has(entry.Language));
    const sortedLocLangData = selectedLocLangData.sort((a,b) => parseInt(b['NumberOfSpeakers']) - parseInt(a['NumberOfSpeakers']));
    const selectedLangIndex = sortedLocLangData.findIndex(e => e.Language === d.Language);
    const dataToGraph = sortedLocLangData.slice(Math.max(selectedLangIndex-2, 0), Math.max(selectedLangIndex+3, 5));
    
    const graphedLanguages = dataToGraph.map(entry => entry.Language);
    const colorScale = language => language === d.Language ? "darkred" : "#ccc";

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
      .attr('fill', 'white')
      .style('font-size', 'small')
      .text(d => numberWithCommas(d.NumberOfSpeakers))

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .style('font-size', 'medium')
      .attr('x', width/2)
      .attr('y', margin.top)
      .attr('dy', '-0.5em')
      .text(d.Location);
    
    const axis = svg.append('g')
      .style('color', "white")
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yMargin).tickSize(0));

    axis.select(".domain").remove();
    axis.selectAll('text')
      .attr('dx', -2)
      .style("font-size", 'small');

    g.selectAll('rect')
      .transition()
      .duration(histogramTransitionSpeed)
      .attr('width', (d) => xMargin(parseInt(d.NumberOfSpeakers)) - xMargin(0))

    g.selectAll('text')
      .transition()
      .duration(histogramTransitionSpeed)
      .attr('x', (d) => xMargin(parseInt(d.NumberOfSpeakers)) - xMargin(0))

    d3.select(wrapperRef.current)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 15) + "px");
  }

  return <div id="bar-tooltip" ref={wrapperRef} />
}
