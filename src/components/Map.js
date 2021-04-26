import React, { useRef, useState, useEffect } from 'react'
import * as d3 from "d3";
import * as topojson from "topojson-client";
import '../App.css';
import tip from "d3-tip";

/**
 * Source inspiration from https://dev.to/muratkemaldar/interactive-world-map-with-d3-geo-498
 * 
 * @param {Object} statesData TopoJSON object of state borders
 * @param {Array} locationsData array of objects with location and coordinate info
 * @param {Integer} size parameter used for width and height
 * @returns 
 */
export default function Map({statesData, locationsData, languagesData, size, selectedLanguage, handleLocationClick}) {
    const width = size, height = size/2;
    const svgRef = useRef();
    const wrapperRef = useRef();

    const handleClickLocation = (data) => {
        handleLocationClick(data);
    }

    useEffect( () => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("g").remove();
        svg.selectAll("rect").remove();

        // let active = d3.select(null);
        let zoomedBounds = [];

        const statesGeoJSON = topojson.feature(statesData, statesData.objects.states);

        const projection = d3.geoAlbersUsa()
            .fitSize([width, height], statesGeoJSON);

        const path = d3.geoPath()
            .projection(projection);

        svg.append("rect")
            .attr("class", "background")
            .attr("width", size)
            .attr("height", size)
            .on("click", reset);

        const g = svg.append("g")
            .style("stroke-width", "1.5px");

        g.selectAll("path")
            .data(statesGeoJSON.features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "feature")
            .on("click", zoomClick);
        
        const tooltip = tip()
            .attr('class', 'd3-tip')
            .offset([-5, 0])
            .html(function(event, d) {
                return d.Location + "</br>" + d["NumberOfSpeakers"];
            })
        
        const filteredLocations = languagesData.filter(entry => {
            // if (entry.Language === selectedLanguage && locationsData[entry.Location] === undefined) {
            //     console.log("Improper location in languages dataset: " + entry.Location);
            // }
            return entry.Language === selectedLanguage && locationsData[entry.Location];
        }).sort((a,b) => {
            return parseInt(b["NumberOfSpeakers"]) - parseInt(a["NumberOfSpeakers"]);
        });

        svg.call(tooltip);
            
        g.append("g")
            .selectAll("g")
            .data(filteredLocations)
            .enter()
                .append("circle")
                .attr("r", d => parseInt(d["NumberOfSpeakers"])/1000)
                .attr("d", d => {
                    let containerFeature = statesGeoJSON.features.filter(feature => d3.geoContains(feature, [locationsData[d.Location].coordinates.longitude, locationsData[d.Location].coordinates.latitude]))[0];
                    d["containerFeature"] = containerFeature;
                    return d;
                })
                .on("click", (event,d) => zoomClick(event, d)) 
                .on("mouseover", tooltip.show)
                .on("mouseout", tooltip.hide)
                .attr("transform", function(d) {
                    return "translate(" + projection([locationsData[d.Location].coordinates.longitude, locationsData[d.Location].coordinates.latitude]) + ")"; 
                });

        // Adapted from https://bl.ocks.org/mbostock/4699541
        function zoomClick(event, d) {
            // if (active.node() === this) return reset();
            // active.classed("active", false);
            // active = d3.select(this).classed("active", true);
            // console.log(this);
            const containerFeature = d['containerFeature']
            let bounds = path.bounds(containerFeature);
            if (JSON.stringify(zoomedBounds) === JSON.stringify(bounds)) return reset();
            zoomedBounds = bounds;
            let dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = .9 / Math.max(dx / width, dy / height),
                translate = [width / 2 - scale * x, height / 2 - scale * y];

            g.transition()
                .ease(d3.easePoly)
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
            tooltip.hide()
            handleClickLocation(d); 
        }
            
        // Adapted from https://bl.ocks.org/mbostock/4699541
        function reset() {
            // active.classed("active", false);
            // active = d3.select(null);
            zoomedBounds = [];
            g.transition()
                .duration(750)
                .style("stroke-width", "1.5px")
                .attr("transform", "");
        }

        // // Add tooltip for name of each country
        // const tooltip = tip()
        //     .attr('class', 'd3-tip')
        //     .offset([-5, 0])
        //     .html(function(event, d) {
        //         return d.properties.NAME || d.properties.FORMAL_EN
        // })

        // svg.call(tooltip);
        // svg
        //     .selectAll('circle')
        //     .data(locationsData)
        //     .join("path")
        //     .attr("class", "country")
        //     .attr("d", feature => path(feature))
        //     .on("mouseover", tooltip.show)
        //     .on("mouseout", tooltip.hide)
        //     .on("click", openModal)
            
        
        // // const circles = svg
        // //     .selectAll("locations")
        // //     .data([{long: -75, lat: 43},{long: -78, lat: 41},{long: -70, lat: 53}])
        // //     .join("path") // has to be a path because circles don't have edge clipping
        // //     .attr("class", "locations")
        // //     .attr("trans", geo => path([geo.long, geo.lat]))
        // //     .attr("fill", "pink")
        // //     .attr("point-events", "none")
        // //     .attr("r", 40)

        // // repeat();

        // //blinking circles from https://bl.ocks.org/Tak113/4a8caf75e1d3aa13132c8ad9a662a49b
        // // function repeat() {
        // //     circles
        // //         .attr('stroke-width',1)
        // //         .attr('stroke', 'pink')
        // //         .attr('opacity', 1)
        // //         .transition()
        // //         .duration(2000)
        // //         .attr('stroke-width', 25)
        // //         .attr('opacity', 0)
        // //         .on('end',repeat);
        // // };

        // // svg.call(d3.drag().on('drag', (event) => {
        // //     const rotate = projection.rotate()
        // //     const k = sensitivity / projection.scale()
        // //     projection.rotate([
        // //         rotate[0] + event.dx * k,
        // //     ])
        // //     path = d3.geoPath().projection(projection)
        // //     svg.selectAll("path").attr("d", feature => path(feature))
        // //     rotateTimer.stop()
        // //     }))
        //     // .call(d3.zoom().on('zoom', () => {
        //     // if(d3.event.transform.k > 0.3) {
        //     //     projection.scale(initialScale * d3.event.transform.k)
        //     //     path = d3.geoPath().projection(projection)
        //     //     svg.selectAll("path").attr("d", path)
        //     //     globe.attr("r", projection.scale())
        //     // }
        //     // else {
        //     //     d3.event.transform.k = 0.3
        //     // }
        //     // }))

        //     // Define the div for the tooltip
        //     // const tooltip = globe
        //     //     .selectAll(".country").append("div")	
        //     //     .attr("class", "tooltip")				
        //     //     .style("opacity", 0);

        // // function rotateFunction() {
        // //     const rotate = projection.rotate()
        // //     const k = sensitivity / projection.scale()
        // //     projection.rotate([
        // //         rotate[0] + 1 * k/2,
        // //     ])
        // //     path = d3.geoPath().projection(projection)
        // //     svg.selectAll("path").attr("d", feature => path(feature))
        // //     }
        // // const rotateTimer = d3.timer(rotateFunction,200)
    });

    return (
        <div id="globe" ref={wrapperRef} >
            <svg
                width={width} 
                height={height} 
                ref={svgRef}>
            </svg>
        </div>
    )
}
