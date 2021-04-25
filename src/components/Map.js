import React, { useRef, useState, useEffect } from 'react'
import * as d3 from "d3";
import * as topojson from "topojson";
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
export default function Map({statesData, locationsData, size}) {
    const width = size, height = size/2;
    const svgRef = useRef();
    const wrapperRef = useRef();
    const [selectedLocation, setSelectedLocation] = useState(null)
    // const [isRotating, setIsRotating] = useState(true)
    const [open, setOpen] = useState(false);

    // const sensitivity = 75;
    // function stopRotate() {
    //     setIsRotating(false)
    //     // isRotating.stop();
    // }
    // function resumeRotate() {
    //     setIsRotating(true)
    //     // isRotating.restart();
    // }
    const openModal = (e, d) => {
        setOpen(true);
        setSelectedLocation(d.Location);
        // const selectedISO = d.properties.ISO_A3;
        // const selectedSubmission = submissions[selectedISO] || [];
        // setSubmissionData(selectedSubmission);
    }
    const closeModal = () => {
        setOpen(false);
    }

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const statesGeoJSON = topojson.feature(statesData, statesData.objects.states);

        const projection = d3.geoAlbersUsa()
            .fitSize([width, height], statesGeoJSON);

        const path = d3.geoPath()
            .projection(projection);

        svg.append("rect")
            .attr("class", "background")
            .attr("width", size)
            .attr("height", size)

        const g = svg.append("g")
            .style("stroke-width", "1.5px");

        g.selectAll("path")
            .data(statesGeoJSON.features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "feature");

        g.append("path")
            .datum(topojson.mesh(statesData, statesData.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "mesh")
            .attr("d", path);

        const tooltip = tip()
            .attr('class', 'd3-tip')
            .offset([-5, 0])
            .html(function(event, d) {
                return d.Location;
        })

        svg.call(tooltip);
        
        svg.append("g")
            .selectAll("g")
            .data(locationsData)
            .enter()
                .append("circle")
                .attr("r", 20)
                .attr("d", d => d)
                .on("mouseover", tooltip.show)
                .on("mouseout", tooltip.hide)
                .on("click", openModal)
                .attr("transform", function(d) {
                    return "translate(" + projection([d.Longitude, d.Latitude]) + ")"; 
                });


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
                // onMouseEnter={stopRotate} 
                // onMouseLeave={resumeRotate} 
                width={width} 
                height={height} 
                ref={svgRef}>
                </svg>
        </div>
    )
}
