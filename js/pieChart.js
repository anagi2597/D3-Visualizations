// Helper function to bring a selcted object to the front of the display
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

function pieChart(svg_name, data) {
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

    // var div = d3.select(svg_name).append("div")
    //     .style("opacity", 1)
    //     .attr("class", "tooltip")
    //     .style("background-color", "white")
    //     .style("border", "solid")
    //     .style("border-width", "1px")
    //     .style("border-radius", "5px")
    //     .style("padding", "10px")

    console.log(entries);

    // generate points    
    let points = g.selectAll('arc')
        .data(entries).enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.key))
        .attr("stroke", "black")
        .attr('transform', 'translate(0, 0)')
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85');
            let num = (Math.round((d.data.value / 1309) * 100)).toString() + '%';

            g.append('text')
                .attr('class', 'label')
                .attr('y', -220)
                .attr('x', -120)
                .text(num);

        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1');
            g.selectAll('.label').remove();

        });

        var tooltip = d3.select(svg_name)
        .append("div")
        .style("opacity", 1)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

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