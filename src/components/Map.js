import React, { useRef, useEffect } from 'react'
import * as d3 from "d3";
import * as topojson from "topojson-client";
import '../App.css';

/** 
 * Map of the US that displays the communities where a specified language is present.
 * 
 * @param {String} mapOption either 'Metro', 'Counties', 'States'
 * @param {Object} bordersData TopoJSON object of state and county borders
 * @param {Array} locationsData array of objects with location and coordinate info
 * @param {Object} countiesData object where keys are county codes and values are objects with county data
 * @param {Array} allMetroLanguages array of all languages in the dataset
 * @param {Integer} size parameter used for width=size and height=size/2
 * @param {String} selectedLanguage the language for which to display data on the map
 * @param {Function} handleLocationClick callback to pass the clicked location to parent
 * @returns 
 */
export default function Map(props) {
    const {
        mapOption = "Metro", 
        bordersData, 
        locationsData, 
        countiesData, 
        allMetroLanguages, 
        allStateLanguages,
        languagesMetroData, 
        languagesStateData,
        sizeVw, 
        sizeVh, 
        selectedLanguage, 
        setSortedLocLanguages, 
        handleLocationClick
    } = props;
    const width = sizeVw*1.35, height = sizeVh*1.35;
    const svgRef = useRef();
    const wrapperRef = useRef();
    const circleTransitionSpeed = 400;
    const countyTransitionSpeed = 500;
    const histogramTransitionSpeed = 500;
    const zoomTransitionSpeed = 750;
    const defaultCountyColor = "#ccc";
    const defaultStateColor = "#ccc";
    const defaultCircleColor = "#2b5876";
    const highlightedCircleColor = "#4e4376";
    const allMetroLanguagesSet = new Set(allMetroLanguages);
    let sortedLocLangData = [];
    let selectedLangIndex = 0;

    function genRadius(val) {
        val = parseInt(val);
        if (isNaN(val)) {return 0};

        if (val <= 100) {
            return 2;
        } else if (val <= 1000) {
            return 4;
        } else if (val <= 10000) {
            return 8;
        } else if (val <= 100000) {
            return 16;
        } else if (val <= 1000000) {
            return 32;
        } else {
            return 64;
        }
    }

    function createLegend() {
        // Add legend
        const legendSvg = d3.create('svg')
            .attr('width', 300)
            .attr('height', height)
            .attr('class', 'legend');

        const legendLabels = ["<= 100", "<= 1,000", "<= 10,000", "<= 100,000", "<= 1,000,000", "> 1,000,000"];
        const legendValues = [100, 1000, 10000, 100000, 1000000, 10000001];
        legendValues.reverse();
        legendLabels.reverse();
        const xCircle = 66;
        const yCircle = 130;
        const xLabel = 150;

        legendSvg
            .selectAll("legend")
            .data(legendValues)
            .enter()
            .append("circle")
                .attr("cx", 66)
                .attr("cy", function(d, i){ return 4*genRadius(d)} )
                .attr("r", function(d){ return genRadius(d) })
                .style("fill", defaultCircleColor)
                .style("stroke-width", 1.5)

        // Add legend: segments
        legendSvg
            .selectAll("legend")
            .data(legendValues)
            .enter()
            .append("line")
                .attr('x1', function(d){ return xCircle + genRadius(d) } )
                .attr('x2', xLabel)
                .attr('y1', function(d){ return 4*genRadius(d)} )
                .attr('y2', function(d){ return 4*genRadius(d) } )
                .attr('stroke', 'black')
                .style('stroke-dasharray', ('2,2'))

        // Add legend: labels
        legendSvg
            .selectAll("legend")
            .data(legendValues)
            .enter()
            .append("text")
                .attr('x', xLabel)
                .attr('y', function(d){ return 4*genRadius(d) } )
                .text( function(d, i){ return legendLabels[i] } )
                .style("font-size", 10)
                .style("fill", "black")
                .attr('alignment-baseline', 'middle')
        
        document.getElementById("map").appendChild(legendSvg.node());
    }

    //Source: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function showHistogram(event, d) {
        console.log('d in map: ', d);
        d3.select("#bar-tooltip").selectAll("svg").remove();

        const height = 200, width = 400;
        const margin = ({top: 30, right: 70, bottom: 20, left: 80});

        const selectedLocLangData = languagesMetroData.filter(entry => entry.Location === d.Location && !isNaN(parseInt(entry.NumberOfSpeakers)) && allMetroLanguagesSet.has(entry.Language));
        sortedLocLangData = selectedLocLangData.sort((a,b) => parseInt(b['NumberOfSpeakers']) - parseInt(a['NumberOfSpeakers']));
        selectedLangIndex = sortedLocLangData.findIndex(e => e.Language === d.Language);
        const dataToGraph = sortedLocLangData.slice(Math.max(selectedLangIndex-2, 0), Math.max(selectedLangIndex+3, 5));
        
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

        const svg = d3.create('svg')
            .attr('width', width)
            .attr('height', height);
        
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

        d3.select("#bar-tooltip")
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 15) + "px")
            .style("opacity", 1);

        document.getElementById("bar-tooltip").appendChild(svg.node());
    }

    function hideHistogram(event, d) {
        d3.select("#bar-tooltip").style("opacity", 0);
    }

    function unhighlightCircles() {
        d3.selectAll('circle').style("fill", defaultCircleColor);
    }

    function highlightClickedCircle(event) {
        d3.select(event.target).style("fill", highlightedCircleColor);
    }

    const countyColor = d3.scaleThreshold()
        // .domain([1, 100, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 10000])
        // .range(d3.schemeBlues[9]);
        .domain([1, 100, 1000, 10000, 10000, 100000, 1000000])
        .range(d3.schemeBlues[7]);

    function fillCounty(d) {
        if (selectedLanguage.length === 0) {
            return defaultCountyColor;
        } else {
            const county = countiesData[d.id.toString()];
            if (county) {
                return countyColor(county[selectedLanguage]);
            } else {
                return defaultCountyColor;
            }
        }
    }

    useEffect( () => {
        const svg = d3.select(svgRef.current).attr('zoomedBounds', "");
        const statesGeoJSON = topojson.feature(bordersData, bordersData.objects.states);
        const countiesGeoJSON = topojson.feature(bordersData, bordersData.objects.counties);
        const projection = d3.geoAlbersUsa().fitSize([width, height], statesGeoJSON);
        const path = d3.geoPath().projection(projection);

        if (svg.selectAll("rect").size() === 0) { // Check if the background is already drawn
            svg.append("rect")
                .attr("class", "background")
                .attr("width", width)
                .attr("height", height)
                .on("click", reset);
            // createLegend();
        }

        if (svgRef.current["mapOption"] !== mapOption) {
            svg.selectAll("g").remove();
            svgRef.current["mapOption"] = mapOption;
        }

        let g = d3.select(null);
        if (svg.selectAll("g").size() === 0) { // Check if the states are already drawn
            g = svg.append("g");

            if (mapOption === "Counties") {
                g.style("stroke-width", "1px");

                g.selectAll("path")
                    .data(countiesGeoJSON.features)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("fill", d => fillCounty(d))
                    .attr("class", "feature")
                    .on("click", zoomClick);
            } else {
                g.style("stroke-width", "1.5px");

                g.selectAll("path")
                    .data(statesGeoJSON.features)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("fill", defaultStateColor)
                    .attr("class", "feature")
                    .on("click", zoomClick);
            }
        } else {
            g = svg.select("g");
        }

        if (mapOption === "Counties") {
            g.selectAll("path")
                .transition()
                .duration(countyTransitionSpeed)
                .attr("fill", d => fillCounty(d));
        } else {
            // Remove any previous tooltip and add a new one
            d3.selectAll("#bar-tooltip").remove();
            d3.select(wrapperRef.current)
                .append("div")
                .attr("id", "bar-tooltip")
                .style("opacity", 0);

            const filteredLocations = languagesMetroData.filter(entry => {
                return entry.Language === selectedLanguage && locationsData[entry.Location];
            }).sort((a,b) => {
                return parseInt(b["NumberOfSpeakers"]) - parseInt(a["NumberOfSpeakers"]);
            });
        
            // Shrink & remove any previous circles, then add the new circles
            let prevCircles = g.selectAll("circle");
            if (prevCircles.size() === 0) {
                addNewCircles();
            } else {
                prevCircles.transition()
                    .duration(circleTransitionSpeed)
                    .attr("r", 0)
                    .style("stroke-width", 0)
                    .remove().end()
                    .then(() => addNewCircles());
            }

            function addNewCircles() {
                const circles = g
                    .selectAll("circle")
                    .data(filteredLocations)
                    .enter()
                        .append("circle")
                        .attr("r", 0)
                        .style("stroke-width", 0)
                        .style("fill", defaultCircleColor)
                        .attr("d", d => {
                            let containerFeature = statesGeoJSON.features.filter(feature => d3.geoContains(feature, [locationsData[d.Location].coordinates.longitude, locationsData[d.Location].coordinates.latitude]))[0];
                            d["containerFeature"] = containerFeature;
                            return d;
                        })
                        .on("click", (event,d) => handleClickLocation(event, d))
                        .on("mouseover", (event,d) => showHistogram(event, d))
                        .on("mouseout", (event, d) => hideHistogram(event, d))
                        .attr("transform", function(d) {
                            return "translate(" + projection([locationsData[d.Location].coordinates.longitude, locationsData[d.Location].coordinates.latitude]) + ")"; 
                        });
                        
                circles.transition()
                    .duration(circleTransitionSpeed)
                    .attr("r", d => genRadius(d["NumberOfSpeakers"]))
                    .style("stroke-width", 1.5);
            }
        }

        const handleClickLocation = (event, data) => {
            setSortedLocLanguages({selectedLangIndex, sortedLocLangData});
            handleLocationClick(data);
            unhighlightCircles();
            highlightClickedCircle(event);
            if (data['containerFeature'] !== undefined) {
                zoomClick(event, data['containerFeature'])
            }
        }

        // Adapted from https://bl.ocks.org/mbostock/4699541
        function zoomClick(event, d) {
            let bounds = path.bounds(d);
            // const boundingClientRect = event.target.getBoundingClientRect();
            // const customBounds = [[boundingClientRect.left, boundingClientRect.top],[boundingClientRect.right, boundingClientRect.bottom]];
            if (svg.attr('zoomedBounds') === JSON.stringify(bounds) && this !== undefined) return reset();
            svg.attr('zoomedBounds', JSON.stringify(bounds));
            let dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = .9 / Math.max(dx / width, dy / height),
                translate = [width / 2 - scale * x, height / 2 - scale * y];

            g.transition()
                .duration(zoomTransitionSpeed)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");            
        }
            
        // Adapted from https://bl.ocks.org/mbostock/4699541
        function reset() {
            unhighlightCircles();
            svg.attr('zoomedBounds', "");
            g.transition()
                .duration(zoomTransitionSpeed)
                .style("stroke-width", "1.5px")
                .attr("transform", "");
        }
    }, [bordersData, locationsData, allMetroLanguages, languagesMetroData, width, height, selectedLanguage, mapOption]);

    return (
        <div id="map" ref={wrapperRef} style={{width: width}} >
            <svg
                width={width} 
                height={height} 
                ref={svgRef}>
            </svg>
        </div>
    )
}
