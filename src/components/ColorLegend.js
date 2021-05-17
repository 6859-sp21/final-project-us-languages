import React from 'react'
import * as d3 from "d3";

export default function ColorLegend({width}) {
	// Adapted from https://observablehq.com/@d3/color-legend
	function legend({
		color,
		title,
		tickSize = 6,
		width,
		height = 44 + tickSize,
		marginTop = 18,
		marginRight = 0,
		marginBottom = 16 + tickSize,
		marginLeft = 0,
		ticks = width / 64,
		tickFormat,
		tickValues
	} = {}) {
	
		const svg = d3.select("#colorLegend").append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("viewBox", [0, 0, width, height])
				.style("overflow", "visible")
				.style("display", "block");
	
		let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
		let x;
	
		// Threshold
		const thresholds
				= color.thresholds ? color.thresholds() // scaleQuantize
				: color.quantiles ? color.quantiles() // scaleQuantile
				: color.domain(); // scaleThreshold

		const thresholdFormat
				= tickFormat === undefined ? d => d
				: typeof tickFormat === "string" ? d3.format(tickFormat)
				: tickFormat;

		x = d3.scaleLinear()
				.domain([-1, color.range().length - 1])
				.rangeRound([marginLeft, width - marginRight]);

		svg.append("g")
			.selectAll("rect")
			.data(color.range())
			.join("rect")
				.attr("x", (d, i) => x(i - 1))
				.attr("y", marginTop)
				.attr("width", (d, i) => x(i) - x(i - 1))
				.attr("height", height - marginTop - marginBottom)
				.attr("fill", d => d);

		tickValues = d3.range(thresholds.length);
		tickFormat = i => thresholdFormat(thresholds[i], i);
	
		svg.append("g")
				.attr("transform", `translate(0,${height - marginBottom})`)
				.call(d3.axisBottom(x)
					.ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
					.tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
					.tickSize(tickSize)
					.tickValues(tickValues))
				.call(tickAdjust)
				.call(g => g.select(".domain").remove())
				.call(g => g.append("text")
					.attr("x", marginLeft)
					.attr("y", marginTop + marginBottom - height - 6)
					.attr("fill", "currentColor")
					.attr("text-anchor", "start")
					.attr("font-weight", "bold")
					.attr("class", "title")
					.text(title));
	}

	d3.select("#colorLegend").selectAll('svg').remove();
	legend({
		width: width,
		color: d3.scaleThreshold(["10", "", "1,000", "", "100,000", "", "10,000,000"], d3.schemeBlues[7]),
	});

	return (
		<div id="colorLegend" />
	)
}
