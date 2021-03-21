// Helper function to bring a selcted object to the front of the display
d3.selection.prototype.moveToFront = function () {
	return this.each(function () {
		this.parentNode.appendChild(this);
	});
};

function irisStackedBarChart(svg_name, data, x_field) {
	var svg = d3.select(svg_name);
	svg.selectAll("*").remove();

	// General letiables
	const margin = { top: 50, right: 20, left: 60, bottom: 55 };
	let chart = d3.select(svg_name).append("svg")
	let chart_width = $(svg_name).width();
	let chart_height = $(svg_name).height();
	const innerWidth = chart_width - margin.left - margin.right;
	const innerHeight = chart_height - margin.top - margin.bottom;

	// To get average petal lengths and widths
	function avglengths(data, species) {
		let avgSlen = 0
		let avgPLen = 0
		let count = 0
		for (const index of data) {
			if (index.Species == species) {
				avgPLen += index["Petal_length"]
				avgSlen += index["Sepal_length"]
				count += 1
			}
		}

		avgPLen /= count;
		avgSlen /= count;

		return [avgPLen.toFixed(2), avgSlen.toFixed(2)];
	}

	// letiables to plot
	myMap = [
		{ Species: "Iris-setosa", "Petal_length": 0, "Sepal_length": 0 },
		{ Species: "Iris-versicolor", "Petal_length": 0, "Sepal_length": 0 },
		{ Species: "Iris-virginica", "Petal_length": 0, "Sepal_length": 0 }
	]

	// Get average petal length and widths, fill myMap let
	let i = 1;
	for (const index of myMap) {
		let lens = avglengths(data, index.Species)
		index.Petal_length = lens[0]
		index.Sepal_length = lens[1]
	}

	//console.log(myMap);
	//let d1 = sumSpecies(data)
	// x position scale
	let x = d3.scaleBand()
		.domain(myMap.map(d => d[x_field]))
		.range([0, innerWidth])
		.padding(0.2);

	// y position scale
	let y = d3.scaleLinear()
		.domain([0, 15])
		.range([innerHeight, 0]);

	// Groups length and width seperately to go with each species
	let subGroup = d3.scaleBand()
		.domain(["Sepal_length", "Petal_length"])
		.range([0, x.bandwidth()])
		.padding(0.2)

	// Change color based on length or width
	let color = d3.scaleOrdinal()
		.domain(subGroup.domain())
		.range(["green", "blue"])

	// Axes
	const g = chart.append('g')
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	// Y Axis
	g.append('g').call(d3.axisLeft(y))
		.append('text')
		.attr('class', 'axis-label')
		.attr('y', -40)
		.attr('x', -innerHeight / 2)
		.attr('fill', 'black')
		.attr('transform', `rotate(-90)`)
		.attr('text-anchor', 'middle')
		.text("Sepal/Petal Length (cm)")
		.style("font-size", 15);

	// X Axis
	g.append("g")
		.attr("transform", "translate(" + 0 + "," + innerHeight + ")")
		.call(d3.axisBottom(x))
		.append('text')
		.attr('class', 'axis-label')
		.attr('y', 50)
		.attr('x', innerWidth / 2)
		.attr('fill', 'black')
		.text(x_field)
		.style("font-size", 15);

	let keys = ["Petal_length", "Sepal_length"]

	// generate points
	let points = g.selectAll("rect")
		.data(d3.stack().keys(keys)(myMap))
		.enter().append("g")
		.attr("fill", function (d) { return color(d.key); })
		.selectAll("rect")
		.data(function (d) { return d; })
		.enter().append("rect")
		.attr("stroke-width", 20)
		.attr("x", function (d) { return x(d.data["Species"]); })
		.attr("y", function (d) { return y(d[1]); })
		.attr("height", function (d) { return y(d[0]) - y(d[1]); })
		.attr("width", x.bandwidth())
		.on("mouseover", onMouseOver)
		//.on("mousemove", onMouseMove)
		.on("mouseleave", onMouseOut);

	function onMouseOver(d, i) {
		//d3.select(this).style("opacity", "0.85");
		g.append("text")
			.attr('class', 'val')
			.html(function () {
				let value = d[1] - d[0];
				value = value.toFixed(2);
				value = value.toString();
				return ['$' + value];
			})
			.attr('x', function () {
				return x(d.data["Species"]) - 10;
			})
			.attr('y', function () {
				return y(d[1]) - 15;
			})
	}

	// function onMouseMove(d, i) {
	// 	g.append("text")
	// 		.attr('class', 'val')
	// 		.html(function () {
	// 			let value = d[1] - d[0];
	// 			value = value.toFixed(2);
	// 			value = value.toString();
	// 			return ['$' + value];
	// 		})
	// 		.attr('x', function() {
	// 			return x(d.data["Species"]) -10;
	// 		})
	// 		.attr('y', function() {
	// 			return y(d[1]) - 15;
	// 		})
	// 		.moveToFront()
	//   }

	function onMouseOut(d, i) {
		//d3.select(this).style("opacity", "1");
		d3.selectAll('.val')
			.remove()
	}

	// Add title
	let title = "Average Petal and Sepal Lengths by Species";
	g.append('text')
		.attr('class', 'title')
		.attr('y', -15)
		.attr('x', innerWidth / 2 - 100)
		.text(title);

	// Add Legend
	g.append("circle").attr("cx", 85).attr("cy", 15).attr("r", 6).style("fill", "blue")
	g.append("circle").attr("cx", 85).attr("cy", 40).attr("r", 6).style("fill", "green")
	g.append("text").attr("x", 95).attr("y", 15).text("Petal Length").style("font-size", "15px").attr("alignment-baseline", "middle")
	g.append("text").attr("x", 95).attr("y", 40).text("Sepal Length").style("font-size", "15px").attr("alignment-baseline", "middle")


	// return chart data that can be used later
	return {
		chart: chart,
		chart_width: chart_width,
		chart_height: chart_height,
		x_scale: x,
		y_scale: y,
		points: points
	}
}

function titanicBarChart(svg_name, data, x_field) {
	var svg = d3.select(svg_name);
	svg.selectAll("*").remove();

	// General variables
	const margin = { top: 50, right: 20, left: 60, bottom: 55 };
	let chart_width = 900;
	let chart_height = 500;
	let chart = d3.select(svg_name).append("svg")
		.attr("width", chart_width)
		.attr("height", chart_height);
	const innerWidth = chart_width - margin.left - margin.right;
	const innerHeight = chart_height - margin.top - margin.bottom;

	// Axes
	const g = chart.append('g')
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	// x position scale
	let x = d3.scaleBand()
		.domain(data.map(function (d, i) { return i; }))
		.range([0, innerWidth])
		.padding(0.1);

	// X Axis
	let xAxis = g.append("g")
		.attr("transform", "translate(0," + innerHeight + ")")
		.call(d3.axisBottom(x));

	// y position scale
	let y = d3.scaleLinear()
		.domain(d3.extent(data, function (d) { return d[x_field]; }))
		.range([innerHeight, 0]);

	// Y Axis
	g.append('g').call(d3.axisLeft(y))
		.append('text')
		.attr('class', 'axis-label')
		.attr('y', -40)
		.attr('x', -innerHeight / 2)
		.attr('fill', 'black')
		.attr('transform', `rotate(-90)`)
		.attr('text-anchor', 'middle')
		.text(x_field + " (USD)")
		.style("font-size", 15);

	// // X Axis Title
	g.append('text')
		.attr('class', 'axis-label')
		.attr("transform", "translate(0," + innerHeight + ")")
		.attr('y', 45)
		.attr('x', innerWidth / 2)
		.attr('fill', 'black')
		.text(x_field.replace("_", " "))
		.style("font-size", 15);

	// Add a clipPath: everything out of this area won't be drawn.
	let clip = g.append("defs").append("svg:clipPath")
		.attr("id", "clip")
		.append("svg:rect")
		.attr("width", innerWidth)
		.attr("height", innerHeight)
		.attr("x", 0)
		.attr("y", 0);

	// Add brushing
	let brush = d3.brushX()
		.extent([[0, 0], [innerWidth, innerHeight]])
		.on("end", updateChart)

	// Create the scatter variable: where both the circles and the brush take place
	let scatter = g.append('g')
		.attr("clip-path", "url(#clip)")

	// generate points
	let points = g.selectAll("rect")
		.data(data).enter()
		.append("rect")
		.attr("width", x.bandwidth())
		.attr("height", function (d) { return innerHeight - y(d[x_field]); })
		.attr("x", function (d, i) { return x(i); })
		.attr("y", function (d) { return y(d[x_field]); })
		.attr("fill", "#0000be")

	// Add the brushing
	scatter
		.append("g")
		.attr("class", "brush")
		.call(brush);

	// A function that set idleTimeOut to null
	let idleTimeout
	function idled() { idleTimeout = null; }
	function updateChart() {

		let extent = d3.event.selection

		// If no selection, back to initial coordinate. Otherwise, update X axis domain
		if (!extent) {
			if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
			x.domain(d3.extent(data, d => d[x_field]))
		} else {
			x.domain([x.invert(extent[0]), x.invert(extent[1])])
			scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
		}

		// Update axis and circle position
		xAxis.transition().duration(1000).call(d3.axisBottom(x))
		scatter
			.selectAll("circle")
			.transition().duration(1000)
			.attr("x", function (d, i) { return x(i); })
			.attr("y", function (d) { return y(d[x_field]); })

	}

	// 	.on('mouseover', mouseover)
	// 	.on('mousemove', mousemove)
	// 	.on('mouseout', mouseleave)
	// 	.on("click", mouseClick);

	// let tooltip = d3.select(svg_name)
	// 	.append("div")
	// 	.style("opacity", 0)
	// 	.attr("class", "tooltip")
	// 	.style("background-color", "white")
	// 	.style("border", "solid")
	// 	.style("border-width", "1px")
	// 	.style("border-radius", "5px")
	// 	.style("padding", "10px");

	// function mouseover(d) {
	// 	let price = d[x_field].toFixed(2);
	// 	let age = d['Age'];
	// 	let sex = d['Sex'];
	// 	tooltip
	// 		.html("Price: " + price + "<br>" + "Age: " + age + "<br>" + "Sex: " + sex)
	// 		.style("opacity", 1)
	// 		.style("color", "blue")
	// }

	// function mousemove(d) {
	// 	tooltip
	// 		.style("left", (d3.event.pageX + 15) + "px")
	// 		.style("top", (d3.event.pageY - 15) + "px")
	// }

	// function mouseleave(d) {
	// 	tooltip
	// 		.style("opacity", 0)
	// }

	// function mouseClick(d, i) {
	// 	zoomTitanicBarChart(svg_name, data, x_field, i);
	// }

	// Add title
	let title = "Fare Amount Paid by Each Passenger";
	g.append('text')
		.attr('class', 'title')
		.attr('y', -15)
		.attr('x', innerWidth / 2 - 100)
		.text(title)
		.style("font-size", 15);

	// return chart data that can be used later
	return {
		chart: chart,
		chart_width: chart_width,
		chart_height: chart_height,
		x_scale: x,
		y_scale: y,
		points: points
	}
}


function zoomTitanicBarChart(svg_name, data, x_field, stop) {
	var svg = d3.select(svg_name);
	svg.selectAll("*").remove();

	let newData = []
	let i = 0;
	for (const index of data) {
		if (i <= stop) {
			newData.push(index);
		}
		else
			break;
		i++;
	}

	console.log(stop, i, newData);

	// General variables
	const margin = { top: 50, right: 20, left: 60, bottom: 55 };
	let chart_width = 900;
	let chart_height = 500;
	let chart = d3.select(svg_name).append("svg")
		.attr("width", chart_width)
		.attr("height", chart_height);
	const innerWidth = chart_width - margin.left - margin.right;
	const innerHeight = chart_height - margin.top - margin.bottom;

	// x position scale
	let x = d3.scaleBand()
		.domain(newData.map(function (d, i) { return i; }))
		.range([0, innerWidth])
		.padding(0.1);

	// y position scale
	let y = d3.scaleLinear()
		.domain(d3.extent(newData, function (d) { return d[x_field]; }))
		.range([innerHeight, 0]);

	// Axes
	const g = chart.append('g')
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	// Y Axis
	g.append('g').call(d3.axisLeft(y))
		.append('text')
		.attr('class', 'axis-label')
		.attr('y', -40)
		.attr('x', -innerHeight / 2)
		.attr('fill', 'black')
		.attr('transform', `rotate(-90)`)
		.attr('text-anchor', 'middle')
		.text(x_field + " (USD)")
		.style("font-size", 15);

	// X Axis
	g.append("g")
		.attr("transform", "translate(" + 0 + "," + innerHeight + ")")
		.call(d3.axisBottom(x))
		.append('text')
		.attr('class', 'axis-label')
		.attr('y', 50)
		.attr('x', innerWidth / 2)
		.attr('fill', 'black')
		.text("Passenger (from Cheapest to most Expensive)")
		.style("font-size", 15);

	// generate points
	let points = g.selectAll("rect")
		.data(newData).enter()
		.append("rect")
		.attr("width", x.bandwidth())
		.attr("height", function (d) { return innerHeight - y(d[x_field]); })
		.attr("x", function (d, i) { return x(i); })
		.attr("y", function (d) { return y(d[x_field]); })
		.attr("fill", "#0000be")
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseout', mouseleave)
		.on("click", mouseClick);

	let tooltip = d3.select(svg_name)
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "1px")
		.style("border-radius", "5px")
		.style("padding", "10px");

	function mouseover(d) {
		let price = d[x_field].toFixed(2);
		let age = d['Age'];
		let sex = d['Sex'];
		tooltip
			.html("Price: " + price + "<br>" + "Age: " + age + "<br>" + "Sex: " + sex)
			.style("opacity", 1)
			.style("color", "blue")
	}

	function mousemove(d) {
		tooltip
			.style("left", (d3.event.pageX + 15) + "px")
			.style("top", (d3.event.pageY - 15) + "px")
	}

	function mouseleave(d) {
		tooltip
			.style("opacity", 0)
	}

	function mouseClick(d, i) {
		zoomTitanicBarChart(svg_name, data, x_field, i);
	}

	// Add title
	let title = "Fare Amount Paid by Each Passenger";
	g.append('text')
		.attr('class', 'title')
		.attr('y', -15)
		.attr('x', innerWidth / 2 - 100)
		.text(title)
		.style("font-size", 15);

	// return chart data that can be used later
	return {
		chart: chart,
		chart_width: chart_width,
		chart_height: chart_height,
		x_scale: x,
		y_scale: y,
		points: points
	}
}



/****************************************************************************** 
 * 	Old bar chart was biletiate, not uniletiate. Function below is not used
 * 
*******************************************************************************/

// Summed Fare on y axis vs Survived(y/n) on x axis to get plot sum of fares from total survived and died
function Old_titanicBarChart(svg_name, data, x_field, y_field) {

	// General letiables
	const margin = { top: 50, right: 20, left: 60, bottom: 55 };
	let chart = d3.select(svg_name).append("svg")
	let chart_width = $(svg_name).width();
	let chart_height = $(svg_name).height();
	const innerWidth = chart_width - margin.left - margin.right;
	const innerHeight = chart_height - margin.top - margin.bottom;

	// Get the sum of fares to plot
	function survivedSum(d) {
		let sum = 0
		for (let i = 0; i < d.length; i++) {
			if (d[i][x_field] == "Yes")
				sum += d[i][y_field];
		}
		return sum
	}

	function diedSum(d) {
		let sum = 0
		for (let i = 0; i < d.length; i++) {
			if (d[i][x_field] == "No")
				sum += d[i][y_field];
		}
		return sum
	}

	let dSum = diedSum(data)
	let sSum = survivedSum(data)

	// x position scale
	let x = d3.scaleBand()
		.domain(data.map(d => d[x_field]))
		.range([0, innerWidth])
		.padding(0.2);

	// y position scale
	let yDomain = Math.max(dSum, sSum)
	let y = d3.scaleLinear()
		.domain([0, Math.max(dSum, sSum)])
		.range([innerHeight, 0]); // chart_height - innerHeight

	// Axes
	const g = chart.append('g')
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	// Y Axis
	g.append('g').call(d3.axisLeft(y))
		.append('text')
		.attr('class', 'axis-label')
		.attr('y', -50)
		.attr('x', -innerHeight / 2)
		.attr('fill', 'black')
		.attr('transform', `rotate(-90)`)
		.attr('text-anchor', 'middle')
		.text(y_field.charAt(0).toUpperCase() + y_field.slice(1));

	// X Axis
	g.append("g")
		.attr("transform", "translate(" + 0 + "," + innerHeight + ")")
		.call(d3.axisBottom(x))
		.append('text')
		.attr('class', 'axis-label')
		.attr('y', 50)
		.attr('x', innerWidth / 2)
		.attr('fill', 'black')
		.text(x_field.charAt(0).toUpperCase() + x_field.slice(1));

	// Generate points
	let points = g.selectAll("rect")
		.data(data).enter()
		.append("rect")
		.merge(g)
		.transition()
		.duration(1000)
		.attr("width", x.bandwidth())
		.attr("height", function (d) {
			if (d[x_field] == "No") {
				return innerHeight - y(dSum)
			}
			else if (d[x_field] == "Yes") {
				return innerHeight - y(sSum)
			}
		})
		.attr("x", d => x(d[x_field]))
		.attr("fill", "#69b3a2")
		.attr("y", function (d) {
			if (d[x_field] == "No") {
				return y(dSum)
			}
			else {
				return y(sSum)
			}
		})
	//.attr("y", d => y(d[y_field]))

	// Add Title
	let title = x_field.charAt(0).toUpperCase() + x_field.slice(1) + " vs. " + y_field.charAt(0).toUpperCase() + y_field.slice(1);
	g.append('text')
		.attr('class', 'title')
		.attr('y', -15)
		.attr('x', innerWidth / 2)
		.text(title);

	// return chart data that can be used later
	return {
		chart: chart,
		chart_width: chart_width,
		chart_height: chart_height,
		x_scale: x,
		y_scale: y,
		points: points
	}
}
