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
 * @param {Integer} size parameter used for width=size and height=size/2
 * @param {String} selectedLanguage the language for which to display data on the map
 * @param {Function} handleLocationClick callback to pass the clicked location to parent
 * @returns 
 */
export default function Map(props) {
    const {
        mapOption, 
        bordersData, 
        locationsData, 
        countiesData,
        statesData,
        languagesMetroData,
        stateIDs,
        sizeVw, 
        sizeVh, 
        selectedLanguage, 
        handleLocationClick
    } = props;
    const width = sizeVw*1.35, height = sizeVh*1.35;
    const svgRef = useRef();
    const wrapperRef = useRef();
    const circleTransitionSpeed = 400;
    const countyTransitionSpeed = 500;
    const zoomTransitionSpeed = 750;
    const defaultCountyColor = "#ccc";
    const defaultStateColor = "#ccc";
    const defaultCircleColor = "#2b5876";
    const highlightedCircleColor = "#4e4376";
    let active = d3.select(null);

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

    const countyColor = d3.scaleThreshold()
        .domain([1, 100, 1000, 10000, 10000, 100000, 1000000])
        .range(d3.schemeBlues[7]);

    function fillCounty(d) {
        if (selectedLanguage.length !== 0) {
            const county = countiesData[d.id.toString()];
            if (county) {
                return countyColor(county[selectedLanguage]);
            }
        }
        return defaultCountyColor;
    }

    const stateColor = d3.scaleThreshold()
        .domain([1, 100, 1000, 10000, 10000, 100000, 1000000])
        .range(d3.schemeBlues[7]);

    function fillState(d) {
        if (selectedLanguage.length !== 0) {
            const stateName = stateIDs[d.id];
            const stateSelectedLangData = statesData.filter(e => e.Language === selectedLanguage && e.Location === stateName)[0];
            if (stateSelectedLangData) {
                return stateColor(stateSelectedLangData['NumberOfSpeakers']);
            }
        }
        return defaultStateColor;
    }

    useEffect( () => {
        const svg = d3.select(svgRef.current);
        const statesGeoJSON = topojson.feature(bordersData, bordersData.objects.states);
        const countiesGeoJSON = topojson.feature(bordersData, bordersData.objects.counties);
        const landGeoJSON = topojson.feature(bordersData, bordersData.objects.land);
        const projection = d3.geoAlbersUsa().fitSize([width, height], statesGeoJSON);
        const path = d3.geoPath().projection(projection);
        
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", event => zoomed(event));

        if (svg.selectAll("rect").size() === 0) { // Check if the background is already drawn
            svg.append("rect")
                .attr("class", "background")
                .attr("width", width)
                .attr("height", height)
                .on("click", reset);
            // createLegend();
        }
        
        // If mapOption changed, clear previous map & redraw rect
        if (svgRef.current["mapOption"] !== mapOption) {
            svg.selectAll("g").remove();
            svg.selectAll("rect").remove();
            svgRef.current["mapOption"] = mapOption;
            svg.append("rect")
                .attr("class", "background")
                .attr("width", width)
                .attr("height", height)
                .on("click", reset);
        }

        let g = svg.select("g");
        if (g.node() === null) { // Check if the states are already drawn
            g = svg.append("g");
            if (mapOption === "Counties") {
                g.selectAll("path")
                    .data(countiesGeoJSON.features)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("fill", d => fillCounty(d))
                    .attr("class", "feature")
                    .on("click", (event, d) => zoomClickFeature(d));
            } else if (mapOption === "States") {
                g.selectAll("path")
                    .data(statesGeoJSON.features)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("fill", defaultStateColor)
                    .attr("class", "feature")
                    .on("click", (event, d) => handleLocationClick(d));
            } else {
                g.selectAll("path")
                    .data([landGeoJSON])
                    .enter().append("path")
                    .attr("d", path)
                    .attr("fill", defaultStateColor)
                    .attr("class", "land-feature")
                    .on("click", reset);
            }
        }

        svg.call(zoom)

        // Remove any previous tooltip and add a new one
        d3.selectAll("#bar-tooltip").remove();
        d3.select(wrapperRef.current)
            .append("div")
            .attr("id", "bar-tooltip")
            .style("opacity", 0);

        if (mapOption === "Counties") {
            g.selectAll("path")
                .transition()
                .duration(countyTransitionSpeed)
                .attr("fill", d => fillCounty(d));
        } else if (mapOption === "States") {
            g.selectAll("path")
                .transition()
                .duration(countyTransitionSpeed)
                .attr("fill", d => fillState(d));
        } else {
            const filteredLocations = languagesMetroData.filter(entry => {
                return entry.Language === selectedLanguage && locationsData[entry.Location];
            }).sort((a,b) => {
                return parseInt(b["NumberOfSpeakers"]) - parseInt(a["NumberOfSpeakers"]);
            });
        
            // Shrink & remove any previous circles, then add the new circles
            let prevCircles = g.selectAll("circle");
            if (prevCircles.size() === 0) {
                addNewCircles();
            } else if (svgRef.current["selectedLanguage"] !== selectedLanguage) {
                prevCircles
                    .transition()
                    .duration(circleTransitionSpeed)
                    .attr("r", 0)
                    .style("stroke-width", 0)
                    .remove().end()
                    .then(() => addNewCircles());
            }

            function addNewCircles() {
                svgRef.current["selectedLanguage"] = selectedLanguage;
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
                        .on("mouseover", (event,d) => {
                            d3.select(event.target).style("fill", highlightedCircleColor);
                        })
                        .on("mouseout", (event, d) => {
                            if (svgRef.current["activeLocation"] !== d.Location) {
                                d3.select(event.target).style("fill", defaultCircleColor);
                            }
                        })
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
            svgRef.current["activeLocation"] = data.Location;
            d3.selectAll('circle').style("fill", defaultCircleColor);
            d3.select(event.target).style("fill", highlightedCircleColor);
            handleLocationClick(data);
            if (data['containerFeature'] !== undefined) {
                zoomClickCircle(event, data)
            }
        }

        // Adapted from https://bl.ocks.org/mbostock/4699541
        function zoomClickCircle(event, d) {
            if (svgRef.current["zoomedLocation"] === d.Location) return reset();
            svgRef.current["zoomedLocation"] = d.Location;
            let bounds = path.bounds(d.containerFeature),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = .9 / Math.max(dx / width, dy / height),
                translate = [width / 2 - scale * x, height / 2 - scale * y];

            svg.transition()
                .duration(zoomTransitionSpeed)
                .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );       
        }

        function zoomClickFeature(d) {
            if (active.node() === d) return reset();
            active = d3.select(d);
            let bounds = path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
                translate = [width / 2 - scale * x, height / 2 - scale * y];
          
            svg.transition()
                .duration(zoomTransitionSpeed)
                .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );
          }
            
        // Adapted from https://bl.ocks.org/mbostock/4699541
        function reset() {
            // d3.selectAll('circle').style("fill", defaultCircleColor);
            // svgRef.current["zoomedLocation"] = "";
            // svgRef.current["activeLocation"] = "";
            svg.transition()
                .duration(zoomTransitionSpeed)
                .call( zoom.transform, d3.zoomIdentity ); 
        }

        function zoomed(event) {
            g.attr("transform", event.transform);
        }
    });

    return (
        <div id="map" ref={wrapperRef} style={{width: width, zIndex: 0}}>
            <svg
                width={width} 
                height={height} 
                ref={svgRef}>
            </svg>
        </div>
    )
}
