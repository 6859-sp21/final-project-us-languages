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



    useEffect( () => {
        const svg = d3.select(svgRef.current);
        // svg.selectAll("g").remove();
        // svg.selectAll("rect").remove();

        // let active = d3.select(null);
        let zoomedBounds = [];

        const statesGeoJSON = topojson.feature(statesData, statesData.objects.states);

        const projection = d3.geoAlbersUsa()
            .fitSize([width, height], statesGeoJSON);

        const path = d3.geoPath()
            .projection(projection);

        if (svg.selectAll("rect").size() === 0) {
            svg.append("rect")
                .attr("class", "background")
                .attr("width", size)
                .attr("height", size)
                .on("click", reset);
        }
        
        let g = d3.select(null);
        if (svg.selectAll("g").size() === 0) {
            g = svg.append("g")
                .style("stroke-width", "1.5px");

            g.selectAll("path")
                .data(statesGeoJSON.features)
                .enter().append("path")
                .attr("d", path)
                .attr("class", "feature")
                .on("click", zoomClick);
        } else {
            g = svg.select("g");
        }
        
        const tooltip = tip()
            .attr('class', 'd3-tip')
            .offset([-5, 0])
            .html(function(event, d) {
                return d.Location + "</br>" + d["NumberOfSpeakers"];
            })
        
        const filteredLocations = languagesData.filter(entry => {
            return entry.Language === selectedLanguage && locationsData[entry.Location];
        }).sort((a,b) => {
            return parseInt(b["NumberOfSpeakers"]) - parseInt(a["NumberOfSpeakers"]);
        });

        let prevCircles = g.selectAll("circle");

        prevCircles.transition().duration(400).attr("r", 0).style("stroke-width", 0).remove().end().then( () => addNewCircles());
        
        function addNewCircles() {
            svg.call(tooltip);

            let circles = g
                .selectAll("circle")
                .data(filteredLocations)
                .enter()
                    .append("circle")
                    .attr("r", 0)
                    .style("stroke-width", 0)
                    .attr("d", d => {
                        let containerFeature = statesGeoJSON.features.filter(feature => d3.geoContains(feature, [locationsData[d.Location].coordinates.longitude, locationsData[d.Location].coordinates.latitude]))[0];
                        d["containerFeature"] = containerFeature;
                        return d;
                    })
                    .on("click", (event,d) => handleClickLocation(event, d))
                    .on("mouseover", tooltip.show)
                    .on("mouseout", tooltip.hide)
                    .attr("transform", function(d) {
                        return "translate(" + projection([locationsData[d.Location].coordinates.longitude, locationsData[d.Location].coordinates.latitude]) + ")"; 
                    });
                    
            circles.transition().duration(400).attr("r", d => parseInt(d["NumberOfSpeakers"])/1000).style("stroke-width", 1.5);
        }

        const handleClickLocation = (event, data) => {
            handleLocationClick(data);
            zoomClick(event, data['containerFeature'])
        }

        // Adapted from https://bl.ocks.org/mbostock/4699541
        function zoomClick(event, d) {
            // if (active.node() === this) return reset();
            // active.classed("active", false);
            // active = d3.select(this).classed("active", true);
            // console.log(this);
            // const containerFeature = d['containerFeature']
            let bounds = path.bounds(d);
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
            // tooltip.hide()
            
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
