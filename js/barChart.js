function irisStackedBarChart(svg_name, data, x_field) {

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
		index.Sepal_length = lens[0]
	}


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
	// ----------------
	// Create a tooltip
	// ----------------
	var tooltip = d3.select("#my_dataviz")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "1px")
		.style("border-radius", "5px")
		.style("padding", "10px")

	// Three function that change the tooltip when user hover / move / leave a cell
	var mouseover = function (d) {
		var subgroupName = d3.select(this.parentNode).datum().key;
		var subgroupValue = d.data[subgroupName];
		tooltip
			.html("subgroup: " + subgroupName + "<br>" + "Value: " + subgroupValue)
			.style("opacity", 1)
	}
	var mousemove = function (d) {
		tooltip
			.style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
			.style("top", (d3.mouse(this)[1]) + "px")
	}
	var mouseleave = function (d) {
		tooltip
			.style("opacity", 0)
	}


	// generate points
	let points = g.append("g")
		.selectAll("g")
		.data(d3.stack().keys(keys)(myMap))
		.enter().append("g")
		.attr("fill", function (d) { return color(d.key); })
		.selectAll("rect")
		.data(function (d) { return d; })
		.enter().append("rect")
		.attr("x", function (d) { return x(d.data["Species"]); })
		.attr("y", function (d) { return y(d[1]); })
		.attr("height", function (d) { return y(d[0]) - y(d[1]); })
		.attr("width", x.bandwidth())
		.on('click', function (d, i) {
			d3.select(this)
				.transition()
				.attr('fill', 'black');
		})
		.on('mouseover', function (d, i) {
			d3.select(this)
				.attr('fill', '#ff0000');
		})
		.on('mouseout', function (d, i) {
			console.log("mouseout", d);
			d3.select(this)
				.attr('fill', 'black');
		})


	// .on("mouseover", mouseover)
	// .on("mousemove", mousemove)
	// .on("mouseleave", mouseleave)


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

	// General letiables
	const margin = { top: 50, right: 20, left: 60, bottom: 55 };
	let chart = d3.select(svg_name).append("svg")
	let chart_width = $(svg_name).width();
	let chart_height = $(svg_name).height();
	const innerWidth = chart_width - margin.left - margin.right;
	const innerHeight = chart_height - margin.top - margin.bottom;

	// x position scale
	let x = d3.scaleBand()
		.domain(data.map(function (d, i) { return i; }))
		.range([0, innerWidth])
		.padding(0.1);

	// y position scale
	let y = d3.scaleLinear()
		.domain(d3.extent(data, function (d) { return d[x_field]; }))
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
		.data(data).enter()
		.append("rect")
		.attr("width", x.bandwidth())
		.attr("height", function (d) { return innerHeight - y(d[x_field]); })
		.attr("x", function (d, i) { return x(i); })
		.attr("y", function (d) { return y(d[x_field]); })
		.attr("fill", "#0000be")

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
