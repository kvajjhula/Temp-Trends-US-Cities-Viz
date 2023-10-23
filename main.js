var margin = { top: 50, right: 190, bottom: 90, left: 70 },
    width = 1500 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("KSEA.csv").then(function (data) {
    console.log(data);
    // List of groups (here I have one group per column)
    var allGroup = ["actual_mean_temp", "actual_min_temp", "actual_max_temp"]

    // Reformat the data: we need an array of arrays of {x, y} tuples
    var dataReady = allGroup.map(function (grpName) { // .map allows to do something for each element of the list
        return {
            name: grpName,
            values: data.map(function (d) {
                return { date: d3.timeParse("%Y-%m-%d")(d.date), value: +d[grpName] };
            })
        };
    });
    // I strongly advise to have a look to dataReady with
    console.log(dataReady)

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(d3.schemeSet2);

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
        .domain(d3.extent(dataReady[0].values, function (d) { return d.date; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%b")) // Format tick labels as abbreviated month names
            .ticks(d3.timeMonth.every(1)) // Display tick marks every month
        );


    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the lines
    var line = d3.line()
        .x(function (d) { return x(+d.date) })
        .y(function (d) { return y(+d.value) })
    svg.selectAll("myLines")
        .data(dataReady)
        .enter()
        .append("path")
        .attr("class", function (d) { return d.name })
        .attr("d", function (d) { return line(d.values) })
        .attr("stroke", function (d) { return myColor(d.name) })
        .style("stroke-width", 2)
        .style("fill", "none")

    // Define tooltip
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("font-size", "17px")

    // Add the points
    svg.selectAll("myDots")
        .data(dataReady)
        .enter()
        .append('g')
        .style("fill", function (d) { return myColor(d.name) })
        .attr("class", function (d) { return d.name })
        .selectAll("myPoints")
        .data(function (d) { return d.values })
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.date) })
        .attr("cy", function (d) { return y(d.value) })
        .attr("r", 3)
        .attr("stroke", "white")
        .on("mouseover", function (d) {
            tooltip.style("opacity", 0.9);
            tooltip.html("" + d.date.toLocaleDateString() + " " + d.value + "°F")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.style("opacity", 0);
        })
        .append("title")
        .text(function (d) {
            return ("" + d.date.toLocaleDateString() + " " + d.value + "°F");
        });

    // Add a legend (interactive)
    svg
        .selectAll("myLegend")
        .data(dataReady)
        .enter()
        .append('g')
        .append("text")
        .attr('x', 40)
        .attr('y', function (d, i) { return 400 + i * 20 })
        .text(function (d) {
            if (d.name === "actual_mean_temp") {
                return "Actual Mean Temperature";
            } else if (d.name === "actual_min_temp") {
                return "Actual Min Temperature";
            } else if (d.name === "actual_max_temp") {
                return "Actual Max Temperature";
            } else {
                return d.name;
            }
        })
        .style("fill", function (d) { return myColor(d.name) })
        .style("font-size", 15)
        .on("click", function (d) {
            // is the element currently visible ?
            currentOpacity = d3.selectAll("." + d.name).style("opacity")
            // Change the opacity: from 0 to 1 or from 1 to 0
            d3.selectAll("." + d.name).transition().style("opacity", currentOpacity == 1 ? 0 : 1)

        })

    // Append a title to the graph
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "19px")
        .text("Spread of Daily Max & Min Temperatures in Seattle in 2014-15");

    // Append y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Temperature (°F)");

    // Append x axis label
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top - 10) + ")")
        .style("text-anchor", "middle")
        .text("Date");
})

