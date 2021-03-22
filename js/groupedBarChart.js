function groupedBarChart(svg_name, data, x_field) {
    let svg = d3.select(svg_name);
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

    // To get average petal lengths and widths
    function avglengths(data, species) {
        let avgPWidth = 0
        let avgPLen = 0
        let count = 0
        let maxL = 0, maxW = 0, minL = data[1].Petal_length, minW = data[1].Petal_width;
        for (const index of data) {
            if (index.Species == species) {
                if (index["Petal_length"] > maxL)
                    maxL = index["Petal_length"]
                else if (index["Petal_length"] < minL)
                    minL = index["Petal_length"]

                if (index["Petal_width"] > maxW)
                    maxW = index["Petal_width"]
                if (index["Petal_width"] < minW)
                    minW = index["Petal_width"]

                avgPLen += index["Petal_length"]
                avgPWidth += index["Petal_width"]
                count += 1
            }
        }

        avgPLen /= count;
        avgPWidth /= count;

        return [avgPLen.toFixed(2), avgPWidth.toFixed(2), maxL, minL, maxW, minW];
    }

    // Variables to plot
    myMap = [
        { Species: "Iris-setosa", "Petal_length": 0, "Max": 0, "Min": 0 },
        { Species: "Iris-setosa", "Petal_width": 0, "Max": 0, "Min": 0 },
        { Species: "Iris-versicolor", "Petal_length": 0, "Max": 0, "Min": 0 },
        { Species: "Iris-versicolor", "Petal_width": 0, "Max": 0, "Min": 0 },
        { Species: "Iris-virginica", "Petal_length": 0, "Max": 0, "Min": 0 },
        { Species: "Iris-virginica", "Petal_width": 0, "Max": 0, "Min": 0 }
    ]

    // Get average petal length and widths, fill myMap var
    let i = 1;
    for (const index of myMap) {
        let lens = avglengths(data, index.Species)

        if (i % 2 > 0) {
            index.Petal_length = lens[0]
            index.Max = lens[2]
            index.Min = lens[3]
        }
        else {
            index.Petal_width = lens[1]
            index.Max = lens[4]
            index.Min = lens[5]
        }
        i++;
    }


    // x position scale
    let x = d3.scaleBand()
        .domain(myMap.map(d => d[x_field]))
        .range([0, innerWidth])
        .padding(0.5);

    // y position scale
    let y = d3.scaleLinear()
        .domain([0, 6])
        .range([innerHeight, 0]);

    // Groups length and width seperately to go with each species
    let subGroup = d3.scaleBand()
        .domain(["Petal_width", "Petal_length"])
        .range([0, x.bandwidth()])
        .padding(0.2)

    // Change color based on length or width
    let color = d3.scaleOrdinal()
        .domain(["Petal_width", "Petal_length"])
        .range(["green", "blue"])


    // Y Axis
    g.append('g').call(d3.axisLeft(y))
        .append('text')
        .attr('class', 'axis-label')
        .attr('y', -40)
        .attr('x', -innerHeight / 2)
        .attr('fill', 'black')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .text("Length / Width (cm)")
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
    let points = g.append("g")
        .selectAll("g")
        .data(myMap)
        .enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + x(d[x_field]) + ",0)"; })
        .selectAll("rect")
        .data(function (d) {
            return myMap.map(function (key) { // Whether data point has length or width, it will look exactly the same for the rest of the chained function
                if (key["Petal_length"] === undefined) {
                    return { key: d["Species"], value: d["Petal_width"], value1: "Petal_width", max: d["Max"], min: d["Min"] };
                }
                else
                    return { key: d["Species"], value: d["Petal_length"], value1: "Petal_length", max: d["Max"], min: d["Min"] };
            });
        })
        .enter()
        .append("rect")
        .attr("x", function (d) { return subGroup(d.value1); })
        .attr("y", function (d) { return y(d.value); })
        .attr("width", subGroup.bandwidth())
        .attr("height", function (d) {
            if (d.value == undefined)
                return 0;
            else
                return innerHeight - y(d.value);
        })
        .attr("length", 0)
        .attr("fill", function (d) { return color(d.value1); })
        .style("stroke", "black")
        .on("mouseover", onMouseOver)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseOut)
        .on("click", onClick);

    let tooltip = d3.select(svg_name)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    function onMouseOver(d, i) {
        d3.select(this).style("opacity", "0.80");

        tooltip
        .html("Maximum Value: " + d.max + "<br>" + "Average Value: " + d.value + "<br>" + "Minimum Value: " + d.min)
        .style("opacity", 1)
        .style("color", "blue")
    }

    function onMouseMove(d, i) {
        tooltip
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 15) + "px")
    }

    function onMouseOut(d, i) {
        d3.select(this).style("opacity", "1");
		tooltip
			.style("opacity", 0)
    }

    function onClick(d, i) {
        zoomGraph(svg_name, data, x_field, d.key);

        let xAxis = "Sepal_length"
        let yAxis = "Sepal_width"
        scatterFlower("#vis_2", data, xAxis, yAxis, d.key);
    }

    // Add title
    let title = "Average Petal Width and Petal Length by Species";
    g.append('text')
        .attr('class', 'title')
        .attr('y', -15)
        .attr('x', innerWidth / 2 - 150)
        .text(title);

    // Add Legend
    g.append("circle").attr("cx", 85).attr("cy", 15).attr("r", 6).style("fill", "blue");
    g.append("circle").attr("cx", 85).attr("cy", 40).attr("r", 6).style("fill", "green");
    g.append("text").attr("x", 95).attr("y", 15).text("Petal Length").style("font-size", "15px").attr("alignment-baseline", "middle");
    g.append("text").attr("x", 95).attr("y", 40).text("Petal Width").style("font-size", "15px").attr("alignment-baseline", "middle");


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

function zoomGraph(svg_name, data, x_field, zoomSpecies) {
    let svg = d3.select(svg_name);
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

    // To get average petal lengths and widths
    function avglengths(data, species) {
        let avgPWidth = 0
        let avgPLen = 0
        let count = 0
        let maxL = 0, maxW = 0, minL = data[1].Petal_length, minW = data[1].Petal_width;
        for (const index of data) {
            if (index.Species == species) {
                if (index["Petal_length"] > maxL)
                    maxL = index["Petal_length"]
                else if (index["Petal_length"] < minL)
                    minL = index["Petal_length"]

                if (index["Petal_width"] > maxW)
                    maxW = index["Petal_width"]
                if (index["Petal_width"] < minW)
                    minW = index["Petal_width"]

                avgPLen += index["Petal_length"]
                avgPWidth += index["Petal_width"]
                count += 1
            }
        }

        avgPLen /= count;
        avgPWidth /= count;

        return [avgPLen.toFixed(2), avgPWidth.toFixed(2), maxL, minL, maxW, minW];
    }

    // Variables to plot
    myMap = [
        { Species: "Iris-setosa", "Petal_length": 0, "Max": 0, "Min": 0 },
        { Species: "Iris-setosa", "Petal_width": 0, "Max": 0, "Min": 0 },
        { Species: "Iris-versicolor", "Petal_length": 0, "Max": 0, "Min": 0 },
        { Species: "Iris-versicolor", "Petal_width": 0, "Max": 0, "Min": 0 },
        { Species: "Iris-virginica", "Petal_length": 0, "Max": 0, "Min": 0 },
        { Species: "Iris-virginica", "Petal_width": 0, "Max": 0, "Min": 0 }
    ]


    // Get average petal length and widths, fill myMap var
    let i = 1;
    let yScale = 0;
    for (const index of myMap) {
        let lens = avglengths(data, index.Species)

        if (index.Species == zoomSpecies && lens[0] > yScale)
            yScale = lens[0];

        if (index.Species == zoomSpecies && lens[1] > yScale)
            yScale = lens[1];

        if (i % 2 > 0) {
            index.Petal_length = lens[0]
            index.Max = lens[2]
            index.Min = lens[3]
        }
        else {
            index.Petal_width = lens[1]
            index.Max = lens[4]
            index.Min = lens[5]
        }
        i++;
    }


    myMap = myMap.filter(function (item) {
        return item["Species"] == zoomSpecies
    })


    // x position scale
    let x = d3.scaleBand()
        .domain(myMap.map(d => d[x_field]))
        .range([0, innerWidth])
        .padding(0.5);

    // y position scale
    let y = d3.scaleLinear()
        .domain([0, yScale])
        .range([innerHeight, 0]);

    // Groups length and width seperately to go with each species
    let subGroup = d3.scaleBand()
        .domain(["Petal_width", "Petal_length"])
        .range([0, x.bandwidth()])
        .padding(0.2)

    // Change color based on length or width
    let color = d3.scaleOrdinal()
        .domain(["Petal_width", "Petal_length"])
        .range(["green", "blue"])

    // Y Axis
    g.append('g').call(d3.axisLeft(y))
        .append('text')
        .attr('class', 'axis-label')
        .attr('y', -40)
        .attr('x', -innerHeight / 2)
        .attr('fill', 'black')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .text("Length / Width (cm)")
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
    let points = g.append("g")
        .selectAll("g")
        .data(myMap)
        .enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + x(d[x_field]) + ",0)"; })
        .selectAll("rect")
        .data(function (d) {
            return myMap.map(function (key) { // Whether data point has length or width, it will look exactly the same for the rest of the chained function
                if (key["Petal_length"] === undefined) {
                    return { key: key["Species"], value: d["Petal_width"], value1: "Petal_width", max: d["Max"], min: d["Min"] };
                }
                else
                    return { key: key["Species"], value: d["Petal_length"], value1: "Petal_length", max: d["Max"], min: d["Min"] };
            });
        })
        .enter()
        .append("rect")
        .attr("x", function (d) { return subGroup(d.value1); })
        .attr("y", function (d) { return y(d.value); })
        .attr("width", subGroup.bandwidth())
        .attr("height", function (d) {
            if (d.value == undefined)
                return 0;
            else
                return innerHeight - y(d.value);
        })
        .attr("length", 0)
        .attr("fill", function (d) { return color(d.value1); })
        .on("mouseover", onMouseOver)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseOut)
        .on("click", onClick)

        let tooltip = d3.select(svg_name)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    function onMouseOver(d, i) {
        d3.select(this).style("opacity", "0.80");

        tooltip
        .html("Maximum Value: " + d.max + "<br>" + "Average Value: " + d.value + "<br>" + "Minimum Value: " + d.min)
        .style("opacity", 1)
        .style("color", "blue")
    }

    function onMouseMove(d, i) {
        tooltip
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 15) + "px")
    }

    function onMouseOut(d, i) {
        d3.select(this).style("opacity", "1");
		tooltip
			.style("opacity", 0)
    }


    function onClick(d, i) {
        groupedBarChart(svg_name, data, x_field);

        let xAxis = "Sepal_length"
        let yAxis = "Sepal_width"
        scatterPlot("#vis_2", data, xAxis, yAxis)
    }

    // Add title
    let title = "Average Petal Width and Petal Length by Species";
    g.append('text')
        .attr('class', 'title')
        .attr('y', -15)
        .attr('x', innerWidth / 2 - 150)
        .text(title);

    // Add Legend
    g.append("circle").attr("cx", 85).attr("cy", 15).attr("r", 6).style("fill", "blue")
    g.append("circle").attr("cx", 85).attr("cy", 40).attr("r", 6).style("fill", "green")
    g.append("text").attr("x", 95).attr("y", 15).text("Petal Length").style("font-size", "15px").attr("alignment-baseline", "middle")
    g.append("text").attr("x", 95).attr("y", 40).text("Petal Width").style("font-size", "15px").attr("alignment-baseline", "middle")


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
