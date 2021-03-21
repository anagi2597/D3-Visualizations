
// Helper function to bring a selcted object to the front of the display
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

function scatterPlot(svg_name, data, x_field, y_field) {
    var svg = d3.select(svg_name);
    svg.selectAll("*").remove();

    // General Variables
    const margin = { top: 50, right: 20, left: 60, bottom: 55 };
    let chart = d3.select(svg_name);
    let chart_width = $(svg_name).width();
    let chart_height = $(svg_name).height();
    const innerWidth = chart_width - margin.left - margin.right;
    const innerHeight = chart_height - margin.top - margin.bottom;

    // Axes
    const g = chart.append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // x position scale
    let x = d3.scaleLinear()
        .domain(d3.extent(data, d => d[x_field]))
        .range([5, innerWidth - 5])
        .nice();
    let xAxis = g.append("g")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(d3.axisBottom(x));

    // y position scale
    let y = d3.scaleLinear()
        .domain(d3.extent(data, d => d[y_field]))
        .range([innerHeight-5, 5])
        .nice();

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

    
    let color = d3.scaleOrdinal();
    if (data[1]["Age"] === undefined) { // Only for Iris data set
        color.domain(["Iris-versicolor", "Iris-virginica", "Iris-setosa"])
        .range(["blue", "green", "red"]);
    }
    else{
        color.domain(["male", "female"])
        .range(["blue", "pink"])
    }

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
    let points = scatter.selectAll("circle")
        .data(data).enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", function (d) { return x(d[x_field]); })
        .attr("cy", function (d) { return y(d[y_field]); })
        .style("fill", function (d) { 
            if (data[1]["Age"] === undefined) {
                return color(d["Species"]) 
            }
            else{
                return color(d["Sex"]) 
            }
        });

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
            .attr("cx", function (d) { return x(d[x_field]); })
            .attr("cy", function (d) { return y(d[y_field]); })

    }

    // Add Title
    let title = x_field.replace("_", " ") + " vs. " + y_field.replace("_", " ");
    g.append('text')
        .attr('class', 'title')
        .attr('y', -15)
        .attr('x', innerWidth / 2 - 50)
        .text(title)
        .style("font-size", 15);

    // Add Legend
    // Add Legend
    if (data[1]["Age"] === undefined) { // Only for Iris data set
        g.append("circle").attr("cx", 700).attr("cy", -30).attr("r", 5).style("fill", "blue")
        g.append("circle").attr("cx", 700).attr("cy", -12).attr("r", 5).style("fill", "green")
        g.append("circle").attr("cx", 700).attr("cy", 6).attr("r", 5).style("fill", "red")
        g.append("text").attr("x", 710).attr("y", -30).text("Iris-versicolor").style("font-size", "15px").attr("alignment-baseline", "middle")
        g.append("text").attr("x", 710).attr("y", -12).text("Iris-virginica").style("font-size", "15px").attr("alignment-baseline", "middle")
        g.append("text").attr("x", 710).attr("y", 6).text("Iris-setosa").style("font-size", "15px").attr("alignment-baseline", "middle")
    }
    else { // For titanic chart
        g.append("circle").attr("cx", 700).attr("cy", -30).attr("r", 5).style("fill", "blue")
        g.append("circle").attr("cx", 700).attr("cy", -12).attr("r", 5).style("fill", "pink")
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

function scatterFlower(svg_name, data, x_field, y_field, flower) {
    var svg = d3.select(svg_name);
    svg.selectAll("*").remove();

    let newData = [];
    let i = 0;
    for (const index of data) {
        if (index["Species"] == flower) {
            newData.push(index);
        }
    }

    // General Variables
    const margin = { top: 50, right: 20, left: 60, bottom: 55 };
    let chart = d3.select(svg_name);
    let chart_width = $(svg_name).width();
    let chart_height = $(svg_name).height();
    const innerWidth = chart_width - margin.left - margin.right;
    const innerHeight = chart_height - margin.top - margin.bottom;

    // Axes
    const g = chart.append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // x position scale
    let x = d3.scaleLinear()
        .domain(d3.extent(newData, d => d[x_field]))
        .range([5, innerWidth - 5])
        .nice();
    let xAxis = g.append("g")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(d3.axisBottom(x));

    // y position scale
    let y = d3.scaleLinear()
        .domain(d3.extent(newData, d => d[y_field]))
        .range([innerHeight-5, 5])
        .nice();

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

    
    let color = d3.scaleOrdinal();
    if (data[1]["Age"] === undefined) { // Only for Iris data set
        color.domain(["Iris-versicolor", "Iris-virginica", "Iris-setosa"])
        .range(["blue", "green", "red"]);
    }
    else{
        color.domain(["male", "female"])
        .range(["blue", "pink"])
    }

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
    let points = scatter.selectAll("circle")
        .data(newData).enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", function (d) { return x(d[x_field]); })
        .attr("cy", function (d) { return y(d[y_field]); })
        .style("fill", function (d) { 
            if (data[1]["Age"] === undefined) {
                return color(d["Species"]) 
            }
            else{
                return color(d["Sex"]) 
            }
        });

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
            .attr("cx", function (d) { return x(d[x_field]); })
            .attr("cy", function (d) { return y(d[y_field]); })

    }

    // Add Title
    let title = x_field.replace("_", " ") + " vs. " + y_field.replace("_", " ");
    g.append('text')
        .attr('class', 'title')
        .attr('y', -15)
        .attr('x', innerWidth / 2 - 50)
        .text(title)
        .style("font-size", 15);

    // Add Legend
    g.append("circle").attr("cx", 700).attr("cy", -30).attr("r", 5).style("fill", color(flower))
    g.append("text").attr("x", 710).attr("y", -30).text(flower).style("font-size", "15px").attr("alignment-baseline", "middle")


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

function sexPlot(svg_name, data, x_field, y_field, sex) {
    var svg = d3.select(svg_name);
    svg.selectAll("*").remove();

    let newData = [];
    let i = 0;
    for (const index of data) {
        if (index["Sex"] == sex) {
            newData.push(index);
        }
    }

    // General Variables
    const margin = { top: 50, right: 20, left: 60, bottom: 55 };
    let chart = d3.select(svg_name);
    let chart_width = $(svg_name).width();
    let chart_height = $(svg_name).height();
    const innerWidth = chart_width - margin.left - margin.right;
    const innerHeight = chart_height - margin.top - margin.bottom;

    // Axes
    const g = chart.append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // x position scale
    let x = d3.scaleLinear()
        .domain(d3.extent(newData, d => d[x_field]))
        .range([5, innerWidth - 5])
        .nice();
    let xAxis = g.append("g")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(d3.axisBottom(x));

    // y position scale
    let y = d3.scaleLinear()
        .domain(d3.extent(newData, d => d[y_field]))
        .range([innerHeight-5, 5])
        .nice();

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

    let color = d3.scaleOrdinal()
        .domain(["male", "female"])
        .range(["blue", "pink"])

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
    let points = scatter.selectAll("circle")
        .data(newData).enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", function (d) { return x(d[x_field]); })
        .attr("cy", function (d) { return y(d[y_field]); })
        .style("fill", function (d) { return color(sex) });

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
            .attr("cx", function (d) { return x(d[x_field]); })
            .attr("cy", function (d) { return y(d[y_field]); })

    }

    // Add Title
    let title = x_field.replace("_", " ") + " vs. " + y_field.replace("_", " ");
    g.append('text')
        .attr('class', 'title')
        .attr('y', -15)
        .attr('x', innerWidth / 2 - 50)
        .text(title)
        .style("font-size", 15);

    // Add Legend
    g.append("circle").attr("cx", 700).attr("cy", -30).attr("r", 5).style("fill", "blue")
    g.append("circle").attr("cx", 700).attr("cy", -12).attr("r", 5).style("fill", "pink")
    g.append("text").attr("x", 710).attr("y", -30).text("Male").style("font-size", "15px").attr("alignment-baseline", "middle")
    g.append("text").attr("x", 710).attr("y", -12).text("Female").style("font-size", "15px").attr("alignment-baseline", "middle")


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


/************************************************************** 
    Old plost used, no longer implemented 
***************************************************************/
function old_scatterPlot(svg_name, data, x_field, y_field) {
    var svg = d3.select(svg_name);
    svg.selectAll("*").remove();

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
        .range([5, innerWidth-5])
        .nice();

    // y position scale
    let y = d3.scaleLinear()
        .domain(d3.extent(data, d => d[y_field]))
        .range([innerHeight-5, 5])
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
                return "pink"
        })
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut);

    function onMouseOver(d, i) {
        d3.select(this)
            .attr("r", 10)
            .attr("stroke-width", "3px")
            .attr("fill-opacity", 0.85)
            .moveToFront();

        g.append("text")
            .attr('class', 'val')
            .html(function () {
                let xVal = d[x_field];
                xVal = xVal.toFixed(2);
                xVal = xVal.toString();

                let yVal = d[y_field];
                yVal = yVal.toFixed(2);
                yVal = yVal.toString();

                return [xVal + ', ' + yVal];
            })
            .attr('x', function () {
                return x(d[x_field]) - 10;
            })
            .attr('y', function () {
                return y(d[y_field]) - 15;
            })
    }

    function onMouseOut(d, i) {
        d3.select(this)
            .attr("r", 5)
            .attr("fill-opacity", 1)
            .attr("stroke-width", "0px");

        d3.selectAll('.val')
            .remove()
    }

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
    else { // For titanic chart
        g.append("circle").attr("cx", 700).attr("cy", -30).attr("r", 5).style("fill", "blue")
        g.append("circle").attr("cx", 700).attr("cy", -12).attr("r", 5).style("fill", "pink")
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