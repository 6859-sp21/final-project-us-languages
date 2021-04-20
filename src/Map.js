import React, { useRef, useState, useEffect } from 'react'
import * as d3 from "d3";
import './App.css';
import tip from "d3-tip";

/**
 * Source inspiration from https://dev.to/muratkemaldar/interactive-world-map-with-d3-geo-498
 * 
 * @param {Object} data GeoJson map
 * @param {Integer} size parameter used for width and height
 * @returns 
 */
export default function Map({data, size}) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const [selectedCountry, setSelectedCountry] = useState(null)
    const [isRotating, setIsRotating] = useState(true)
    const [open, setOpen] = useState(false);

    const sensitivity = 75;
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
        setSelectedCountry(d.properties.NAME);
        // const selectedISO = d.properties.ISO_A3;
        // const selectedSubmission = submissions[selectedISO] || [];
        // setSubmissionData(selectedSubmission);
    }
    const closeModal = () => {
        setOpen(false);
    }

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const globe = d3.select(wrapperRef.current)

        const projection = d3.geoOrthographic().fitSize([size, size], data);
        let path = d3.geoPath().projection(projection);

        // Add tooltip for name of each country
        const tooltip = tip()
            .attr('class', 'd3-tip')
            .offset([-5, 0])
            .html(function(event, d) {
                return d.properties.NAME || d.properties.FORMAL_EN
        })

        svg.call(tooltip);
        svg
            .selectAll('.country')
            .data(data.features)
            .join("path")
            .attr("class", "country")
            .attr("d", feature => path(feature))
            .on("mouseover", tooltip.show)
            .on("mouseout", tooltip.hide)
            .on("click", openModal)
            
        
        // const circles = svg
        //     .selectAll("circle")
        //     .data(coordData)
        //     .join("path") // has to be a path because circles don't have edge clipping
        //     .attr("class", "cities")
        //     .attr("d", geo => path(geo.coordinates))
        //     .attr("fill", "pink")
        //     .attr("point-events", "none")

        // repeat();

        //blinking circles from https://bl.ocks.org/Tak113/4a8caf75e1d3aa13132c8ad9a662a49b
        // function repeat() {
        //     circles
        //         .attr('stroke-width',1)
        //         .attr('stroke', 'pink')
        //         .attr('opacity', 1)
        //         .transition()
        //         .duration(2000)
        //         .attr('stroke-width', 25)
        //         .attr('opacity', 0)
        //         .on('end',repeat);
        // };

        svg.call(d3.drag().on('drag', (event) => {
            const rotate = projection.rotate()
            const k = sensitivity / projection.scale()
            projection.rotate([
                rotate[0] + event.dx * k,
            ])
            path = d3.geoPath().projection(projection)
            svg.selectAll("path").attr("d", feature => path(feature))
            rotateTimer.stop()
            }))
            // .call(d3.zoom().on('zoom', () => {
            // if(d3.event.transform.k > 0.3) {
            //     projection.scale(initialScale * d3.event.transform.k)
            //     path = d3.geoPath().projection(projection)
            //     svg.selectAll("path").attr("d", path)
            //     globe.attr("r", projection.scale())
            // }
            // else {
            //     d3.event.transform.k = 0.3
            // }
            // }))

            // Define the div for the tooltip
            // const tooltip = globe
            //     .selectAll(".country").append("div")	
            //     .attr("class", "tooltip")				
            //     .style("opacity", 0);

        function rotateFunction() {
            const rotate = projection.rotate()
            const k = sensitivity / projection.scale()
            projection.rotate([
                rotate[0] + 1 * k/2,
            ])
            path = d3.geoPath().projection(projection)
            svg.selectAll("path").attr("d", feature => path(feature))
            }
        const rotateTimer = d3.timer(rotateFunction,200)
    }, [ data, isRotating])


    return (
        <div id="globe" ref={wrapperRef} >
            <svg
                // onMouseEnter={stopRotate} 
                // onMouseLeave={resumeRotate} 
                width={size} 
                height={size} 
                ref={svgRef}>
                </svg>
        </div>
    )
}
