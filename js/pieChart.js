// Helper function to bring a selcted object to the front of the display
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

function pieChart(svg_name, data, count) {
    var svg = d3.select(svg_name);
	svg.selectAll("*").remove();

    // General variables
    const margin = 50
    let chart_width = 900;
    let chart_height = 500;
    let chart = d3.select(svg_name).append("svg")
        .attr("width", chart_width)
        .attr("height", chart_height);
    let radius = Math.min(chart_width, chart_height) / 2 - margin


    // Color scale
    let color = d3.scaleOrdinal()
        .domain(["male", "female"])
        .range(d3.schemeSet2);

    // Pie function 
    let pie = d3.pie()
        .value(function (d) { return d.value; })

    // Get the entries of the data to hold "key" and "value"
    let entries = pie(d3.entries(data))

    // shape helper to build arcs:
    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Give chart dimensions and place it correctly
    chart.attr("width", chart_width)
        .attr("height", chart_height);

    const g = chart.append("g")
        .attr("transform", "translate(" + chart_width / 2 + "," + chart_height / 2 + ")");

    // generate points    
    let points = g.selectAll('arc')
        .data(entries).enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.key))
        .attr("stroke", "black")
        .attr('transform', 'translate(0, 0)')
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseleave);

    var tooltip = d3.select(svg_name)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    function mouseover(d) {
        let percent = (Math.round((d.data.value / count) * 100)).toString() + '%';
        tooltip
            .html("Category: " + d.data.key + "<br>" + "Count: " + d.data.value + "<br>" + "Percent: " + percent)
            .style("opacity", 1)
            .style("color", "blue")

    }

    function mousemove(d) {
        tooltip
            .style("left",(d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 15) + "px")
    }

    function mouseleave(d) {
        tooltip
            .style("opacity", 0)
    }
    // Add labels 
    g.selectAll('arc')
        .data(entries).enter()
        .append('text')
        .text(d => d.data.key.charAt(0).toUpperCase() + d.data.key.slice(1))
        .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .style("font-size", 15
        );

    // Add title
    let title = "All Passengers Survived or not by Gender"
    g.append('text')
        .attr('class', 'title')
        .attr('y', -220)
        .attr('x', -120)
        .text(title);


    // return chart data that can be used later
    return {
        chart: chart,
        chart_width: chart_width,
        chart_height: chart_height,
        points: points
    }
}