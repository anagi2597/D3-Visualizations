function irisBarChart(svg_name, data, x_field) {

	// General Variables
	const margin = { top: 50, right: 20, left: 60, bottom: 55 };
	let chart = d3.select(svg_name).append("svg")
	let chart_width = $(svg_name).width();
	let chart_height = $(svg_name).height();
	const innerWidth = chart_width - margin.left - margin.right;
	const innerHeight = chart_height - margin.top - margin.bottom;

	function sumSpecies(data){
		let map = {"Iris-setosa": 0, "Iris-versicolor": 0, "Iris-virginica": 0}
		for(const index of data){
			if(index[x_field] == "Iris-setosa"){
				map["Iris-setosa"] += 1
			}
			else if(index[x_field] == "Iris-versicolor"){
				map["Iris-versicolor"] += 1
			}
			else{
				map["Iris-virginica"] += 1
			}
		}
		return map
	}

	let d1 = sumSpecies(data)
	// x position scale
	let x = d3.scaleBand()
		.domain(data.map(d => d[x_field]))
		.range([0, innerWidth])
		.padding(0.2);

	// y position scale
	let y = d3.scaleLinear()
		.domain([0, 75])
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
		.text("Count")
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

	// generate points
	let points = g.selectAll("rect")
		.data(data).enter()
		.append("rect")
		.attr("width", x.bandwidth())
		.attr("height", function (d) { return innerHeight - y(d1[d[x_field]]) })
		.attr("x", d => x(d[x_field]))
		.attr("y", d => y(d1[d[x_field]]))
		.attr("fill", "#add8e6")

	// Add title
	let title = "Count of Each Flower by Species";
	g.append('text')
		.attr('class', 'title')
		.attr('y', -15)
		.attr('x', innerWidth / 2 - 50)
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

function titanicBarChart(svg_name, data, x_field) {

	// General Variables
	const margin = { top: 50, right: 20, left: 60, bottom: 55 };
	let chart = d3.select(svg_name).append("svg")
	let chart_width = $(svg_name).width();
	let chart_height = $(svg_name).height();
	const innerWidth = chart_width - margin.left - margin.right;
	const innerHeight = chart_height - margin.top - margin.bottom;
	
	// x position scale
	let x = d3.scaleBand()
		.domain(data.map(function(d,i){ return i; }))
		.range([0, innerWidth])
		.padding(0.1);

	// y position scale
	let y = d3.scaleLinear()
		.domain(d3.extent(data,function(d){ return d[x_field]; }))
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
		.attr("height", function(d){ return innerHeight - y(d[x_field]); })
		.attr("x", function(d,i){ return x(i); })
		.attr("y", function(d){ return y(d[x_field]); })
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
 * 	Old bar chart was bivariate, not univariate. Function below is not used
 * 
*******************************************************************************/

// Summed Fare on y axis vs Survived(y/n) on x axis to get plot sum of fares from total survived and died (not used)
function Old_titanicBarChart(svg_name, data, x_field, y_field) {

	// General Variables
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
