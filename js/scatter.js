function scatterPlot(svg_name, data, x_field, y_field) {

    // General Variables
    const margin = { top: 50, right: 20, left: 60, bottom: 55 };
    let chart = d3.select(svg_name);
    let chart_width = $(svg_name).width();
    let chart_height = $(svg_name).height();
    const innerWidth = chart_width - margin.left - margin.right;
    const innerHeight = chart_height - margin.top - margin.bottom;

    // x position scale
    let x = d3.scaleLinear()
        .domain(d3.extent(data, d => d[x_field]))
        .range([0, innerWidth])
        .nice();

    // y position scale
    let y = d3.scaleLinear()
        .domain(d3.extent(data, d => d[y_field]))
        .range([innerHeight, 0])
        .nice();

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
        .text(y_field.replace("_", " "))
        .style("font-size", 15);

    // X Axis
    g.append("g")
        .attr("transform", "translate(" + 0 + "," + innerHeight + ")")
        .call(d3.axisBottom(x))
        .append('text')
        .attr('class', 'axis-label')
        .attr('y', 45)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text(x_field.replace("_", " "))
        .style("font-size", 15);

    // generate points
    let points = g.selectAll("circle")
        .data(data).enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", function (d) { return x(d[x_field]); })
        .attr("cy", function (d) { return y(d[y_field]); })
        .style("fill", function (d) {
            if (d["Species"] == "Iris-versicolor")
                return "blue";
            else if (d["Species"] == "Iris-setosa")
                return "red";
            else if (d["Species"] == "Iris-virginica")
                return "green"
            else if (d["Sex"] == "male")
                return "blue";
            else
                return "red"
        })

    // Add Title
    let title = x_field.replace("_", " ") + " vs. " + y_field.replace("_", " ");
    g.append('text')
        .attr('class', 'title')
        .attr('y', -15)
        .attr('x', innerWidth / 2 - 50)
        .text(title)
        .style("font-size", 15);

    // Add Legend
    if (data[1]["Age"] === undefined) { // Only for Iris data set
        g.append("circle").attr("cx", 700).attr("cy", -30).attr("r", 5).style("fill", "blue")
        g.append("circle").attr("cx", 700).attr("cy", -12).attr("r", 5).style("fill", "green")
        g.append("circle").attr("cx", 700).attr("cy", 6).attr("r", 5).style("fill", "red")
        g.append("text").attr("x", 710).attr("y", -30).text("Iris-versicolor").style("font-size", "15px").attr("alignment-baseline", "middle")
        g.append("text").attr("x", 710).attr("y", -12).text("Iris-virginica").style("font-size", "15px").attr("alignment-baseline", "middle")
        g.append("text").attr("x", 710).attr("y", 6).text("Iris-setosa").style("font-size", "15px").attr("alignment-baseline", "middle")
    }
    else{ // For titanic chart
        g.append("circle").attr("cx", 700).attr("cy", -30).attr("r", 5).style("fill", "blue")
        g.append("circle").attr("cx", 700).attr("cy", -12).attr("r", 5).style("fill", "red")
        g.append("text").attr("x", 710).attr("y", -30).text("Male").style("font-size", "15px").attr("alignment-baseline", "middle")
        g.append("text").attr("x", 710).attr("y", -12).text("Female").style("font-size", "15px").attr("alignment-baseline", "middle")
    }
    
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