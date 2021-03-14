function groupedBarChart(svg_name, data, x_field, group1, group2) {

    // General Variables
    const margin = { top: 50, right: 20, left: 60, bottom: 55 };
    let chart = d3.select(svg_name).append("svg")
    let chart_width = $(svg_name).width();
    let chart_height = $(svg_name).height();
    const innerWidth = chart_width - margin.left - margin.right;
    const innerHeight = chart_height - margin.top - margin.bottom;

    // To get average petal lengths and widths
    function avglengths(data, species) {
        let avgPWidth = 0
        let avgPLen = 0
        let count = 0
        for (const index of data) {
            if (index.Species == species) {
                avgPLen += index["Petal_length"]
                avgPWidth += index["Petal_width"]
                count += 1
            }
        }

        avgPLen /= count;
        avgPWidth /= count;

        return [avgPLen.toFixed(2), avgPWidth.toFixed(2)];
    }

    // Variables to plot
    myMap = [
        { Species: "Iris-setosa", "Petal_length": 0 },
        { Species: "Iris-setosa", "Petal_width": 0 },
        { Species: "Iris-versicolor", "Petal_length": 0 },
        { Species: "Iris-versicolor", "Petal_width": 0 },
        { Species: "Iris-virginica", "Petal_length": 0 },
        { Species: "Iris-virginica", "Petal_width": 0 }
    ]

    // Get average petal length and widths, fill myMap var
    let i = 1;
    for (const index of myMap) {
        let lens = avglengths(data, index.Species)
        if (i % 2 > 0) {
            index.Petal_length = lens[0]
        }
        else {
            index.Petal_width = lens[1]
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
        .domain(subGroup)
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
                    return { key: key["Species"], value: d["Petal_width"], value1: "Petal_width" };
                }
                else
                    return { key: key["Species"], value: d["Petal_length"], value1: "Petal_length" };
            });
        })
        .enter()
        .append("rect")
        .attr("x", function (d) { return subGroup(d.value1); })
        .attr("y", function (d) { return y(d.value); })
        .attr("width", subGroup.bandwidth())
        .attr("height", function (d) { return innerHeight - y(d.value); })
        .attr("fill", function (d) { return color(d.value); });

    // Add title
    let title = "Average Petal Width and Petal Length by Species";
    g.append('text')
        .attr('class', 'title')
        .attr('y', -15)
        .attr('x', innerWidth / 2 - 150)
        .text(title);

    // Add Legend
    g.append("circle").attr("cx",85).attr("cy",15).attr("r", 6).style("fill", "blue")
    g.append("circle").attr("cx",85).attr("cy",40).attr("r", 6).style("fill", "green")
    g.append("text").attr("x", 95).attr("y", 15).text("Petal Length").style("font-size", "15px").attr("alignment-baseline","middle")
    g.append("text").attr("x", 95).attr("y", 40).text("Petal Width").style("font-size", "15px").attr("alignment-baseline","middle")


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
