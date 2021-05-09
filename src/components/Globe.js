import React, { useRef, useState, useEffect } from 'react'
import * as d3 from "d3";
import tip from "d3-tip";
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 600;

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: 0,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: drawerWidth,
    },
    dynamicGlobe: {
        // width: '100vw',
        // height: '100vh',
    }
  }));

/**
 * Source inspiration from https://dev.to/muratkemaldar/interactive-world-map-with-d3-geo-498
 * 
 * @param {Object} submissions submitted data object from Google spreadsheets
 * @param {Object} data GeoJson map
 * @param {Integer} size parameter used for width and height
 * @returns 
 */
export default function Globe({open, selectedLanguage, originsData, countryCodes, handleDrawerOpen, submissions, coordData, data, sizeVw, sizeVh}) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const [selectedCountry, setSelectedCountry] = useState(null)
    const [isRotating, setIsRotating] = useState(true)
    const [originInfo, setOriginInfo] = useState({});
    const [originCountries, setOriginCountries] = useState(new Set())
    const [submissionData, setSubmissionData] = useState([])
    const classes = useStyles();
    const zoomTransitionSpeed = 750;

    useEffect(() => {
        const iso = selectedLanguage.ISO;
        if (iso in originsData) {
            console.log('items: ', iso, originsData[iso]);
            const originsCopy = Object.assign({}, originsData[iso]);
            originsCopy['country_codes'] = originsCopy['country_codes'].split(' ').map(code => countryCodes[code] || '');
            setOriginCountries(new Set(originsCopy['country_codes'].map(data => data.ISO2)));
            setOriginInfo(originsCopy);
            console.log(originsCopy);
        } else {
            setOriginCountries(new Set());
            setOriginInfo({});
        }
    }, [selectedLanguage])

    const sensitivity = 75

    const handleCountryClick = (e, d) => {
        // setOpen(true);
        handleDrawerOpen();
        setSelectedCountry(d.properties.NAME);
        const selectedISO = d.properties.ISO_A3;
        const selectedSubmission = submissions[selectedISO] || [];
        setSubmissionData(selectedSubmission);
    }
    const closeModal = () => {
        // setOpen(false);
    }


    let focused = false;
    useEffect(() => {
        const svg = d3.select(svgRef.current).attr('zoomedBounds', "");
        const globe = d3.select(wrapperRef.current)

        const projection = d3.geoOrthographic().fitSize([sizeVw, sizeVh], data);
        let path = d3.geoPath().projection(projection);

        // Add tooltip for name of each country
        const tooltip = tip()
            .attr('class', 'd3-tip')
            .offset([-5, 0])
            .html(function(event, d) {
                return d.properties.NAME || d.properties.FORMAL_EN
        })

        if (!svgRef.current['isBuilt']) {
            console.log('rebuilding');
            svgRef.current['isBuilt'] = true;
            svg.call(tooltip);
            svg
                .selectAll('.country')
                .data(data.features)
                .join("path")
                .attr("class", "country")
                .attr("d", feature => path(feature))
                .attr("fill", '#aaa')
                .on("mouseover", tooltip.show)
                .on("mouseout", tooltip.hide)
        }

        if (Object.keys(selectedLanguage).length !== 0) {
            if (svgRef.current["selectedLanguage"] !== selectedLanguage.Language) {
                svgRef.current["selectedLanguage"] = selectedLanguage.Language;
                // Iterate through countries and save the country feature that corresponds to the origin of the language
                svgRef.current["selectedFeature"] = [];
                data.features.forEach(feature => {
                    if (originCountries.has(feature.properties.ISO_A2) && originCountries.size !== 0) {
                        console.log('originCountries: ',  originCountries);
                        svgRef.current["selectedFeature"].push(feature);
                        }
                    })
                }
                if (svgRef.current["selectedFeature"].length !== 0) {
                    console.log('countries: ',  svgRef.current["selectedFeature"]);
                    rotateMe(svgRef.current["selectedFeature"][0])
                    svg.selectAll('.country').attr('fill', feature => svgRef.current["selectedFeature"].includes(feature) ? '#2b5876' : '#aaa');
                } else {
                    svg.selectAll('.country').attr('fill','#aaa');
                }
        }


            // .on("click", handleCountryClick)
            
        // repeat();

        // //blinking circles from https://bl.ocks.org/Tak113/4a8caf75e1d3aa13132c8ad9a662a49b
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

        // svg.call(d3.drag().on('drag', (event) => {
        //     const rotate = projection.rotate()
        //     const k = sensitivity / projection.scale()
        //     projection.rotate([
        //         rotate[0] + event.dx * k,
        //     ])
        //     path = d3.geoPath().projection(projection)
        //     svg.selectAll("path").attr("d", feature => path(feature))
        //     // rotateTimer.stop()
        //     }))

        // function rotateFunction(elapsed) {
        //     const rotate = projection.rotate()
        //     const k = sensitivity / projection.scale()
        //     projection.rotate([
        //         rotate[0] + 1 * k/2,
        //     ])
        //     path = d3.geoPath().projection(projection)
        //     svg.selectAll("path").attr("d", feature => path(feature))
        //     }

        // const rotateTimer = d3.timer(rotateFunction,200)

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
                // scale = .9 / Math.max(dx / sizeVw, dy / sizeVh),
                scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / sizeVw, dy / sizeVh))),
                translate = [sizeVw / 2 - scale * x, sizeVh / 2 - scale * y];

            svg.transition()
                .duration(zoomTransitionSpeed)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");            
        }
        // Adapted from https://bl.ocks.org/mbostock/4699541
        function reset() {
            // unhighlightCircles();
            svg.attr('zoomedBounds', "");
            svg.transition()
                .duration(zoomTransitionSpeed)
                .style("stroke-width", "1.5px")
                .attr("transform", "");
        }

        // Adapted from https://stackoverflow.com/questions/36526617/d3-center-the-globe-to-the-clicked-country
        function rotateMe(d) {
            const rotate = projection.rotate(),
            focusedCountry = d, //get the clicked country's details
            p = d3.geoCentroid(focusedCountry);
          
          //Globe rotating
          (function transition() {
            d3.transition()
            .duration(2500)
            .tween("rotate", function() {
                // resume from the current rotation rather than starting from the default rotation angle
                const rotation = svgRef.current['rotation'] || projection.rotate();

                const r = d3.interpolate(rotation, [-p[0], -p[1]]);
                return function(t) {
                    projection.rotate(r(t));
                    svgRef.current['rotation'] = projection.rotate();
                    svg.selectAll("path").attr("d", path)
                };
            })
            })();
          };
    }, [originCountries, coordData, data, isRotating])


    return (
        <div id="globe" ref={wrapperRef} 
            style={{maxWidth: sizeVw, maxHeight: sizeVh}}
            className={clsx(classes.content, {
            [classes.contentShift]: open,
            })}>
            <svg
                // className={classes.dynamicGlobe}
                width={sizeVw}
                height={sizeVh}
                // onMouseEnter={stopRotate} 
                // onMouseLeave={resumeRotate} 
                ref={svgRef}>
                    {/* <MosaicModal submissionData={submissionData} selectedCountry={selectedCountry} open={open || false} handleClose={closeModal}/> */}
                </svg>
        </div>
    )
}
