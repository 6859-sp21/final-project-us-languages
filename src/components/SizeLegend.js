import React from 'react'
import * as d3 from "d3";

export default function SizeLegend() {
  const defaultCircleColor = "#2b5876";
  const width = 210, height = 140;

  function genRadius(val) {
    val = parseInt(val);
    if (isNaN(val)) {return 0};

    if (val <= 1000) {
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
  d3.select("#sizeLegend").selectAll('svg').remove();

  const legendSvg = d3.select("#sizeLegend")
    .append("svg")
      .attr("width", width)
      .attr("height", height);

  const legendLabels = ["<= 1,000", "<= 10,000", "<= 100,000", "<= 1,000,000", "<= 10,000,000"];
  const legendValues = [1000, 10000, 100000, 1000000, 10000001];
  legendValues.reverse();
  legendLabels.reverse();
  const xCircle = 64;
  const yCircle = height;
  const xLabel = 140;

  legendSvg
    .selectAll("legend")
    .data(legendValues)
    .enter()
    .append("circle")
      .attr('class', 'circle')
      .attr("cx", xCircle)
      .attr("cy", function(d, i){ return yCircle - genRadius(d)} )
      .attr("r", function(d){ return genRadius(d) })
      .style("fill", defaultCircleColor)
      .style("stroke-width", 1.5);

  // Add legend: segments
  legendSvg
    .selectAll("legend")
    .data(legendValues)
    .enter()
    .append("line")
      .attr('x1', function(d){ return xCircle } )
      .attr('x2', xLabel)
      .attr('y1', function(d){ return  yCircle - 2*genRadius(d)} )
      .attr('y2', function(d){ return  yCircle - 2*genRadius(d) } )
      .attr('stroke', 'black')
      .style('stroke-dasharray', ('2,2'));

  // Add legend: labels
  legendSvg
    .selectAll("legend")
    .data(legendValues)
    .enter()
    .append("text")
      .attr('x', xLabel)
      .attr('y', function(d){ return  yCircle - 2*genRadius(d) } )
      .text( function(d, i){ return legendLabels[i] } )
      .style("font-size", 10)
      .style("fill", "black")
      .attr('alignment-baseline', 'middle');

  return (
    <div id="sizeLegend" />
  )
}
