function createGraphFrom(cheminJson, getTypeNoeud, getTypeUse, getColorChoice, getNodeColor, getLinkColor, linkToolTip, nodeToolTip, needLabel, getRadiusFunction) {

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    d3.json(`https://raw.githubusercontent.com/Aleexo/test_enedis/main/json/${cheminJson}`, function(error, graph) {

        if (error) throw error;

        const typeNoeud = getTypeNoeud(graph)
        const typeUse = getTypeUse(graph)
        const colorChoice = getColorChoice(typeNoeud, typeUse)
        const nodeColor = getNodeColor(colorChoice)
        const linkColor = getLinkColor(colorChoice)
        const radius = getRadiusFunction(graph)

        const simulation = d3.forceSimulation(graph.nodes) //Modify link distance/strength here
            .force("link", d3.forceLink().id(function(d) {
                return d.id;
            }).distance(80).strength(1.5))
            .force("charge", d3.forceManyBody().strength(-300)) //Charge strength is here
            .force("center", d3.forceCenter(width / 2, height / 2));


        svg.append("svg:defs").selectAll("marker")
            .data(["end"]) // Different link/path types can be defined here
            .enter().append("svg:marker") // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -1.5)
            .attr("markerWidth", 15)
            .attr("markerHeight", 15)
            .attr("orient", "auto")
            .style("fill", colorChoice)
            .style("opacity", 0.4)
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");


        simulation.force("link")
            .links(graph.links);

        for (let i = 0; i < 1000; ++i) simulation.tick();

        simulation.restart();
        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            })
            .attr("stroke", linkColor)
            .attr("marker-end", "url(#end)")
            .on('mouseover.tooltip', function(d) {
                tooltip.transition()
                    .duration(300)
                    .style("opacity", 0.8);
                tooltip.html(linkToolTip(d))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            })
            .on("mouseout.tooltip", function() {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0);
            })
            .on('mouseout.fade', fade(1))
            .on("mousemove", function() {
                tooltip.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            });

        console.log(graph.links)
        console.log(graph.nodes)
        const node = svg.append("g")
            .attr("module", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("cx", function(d) {
                return d.x;
            })
            .attr("cy", function(d) {
                return d.y;
            })
            .attr("r", radius)
            .attr("fill", nodeColor)
            .on('mouseover.tooltip', function(d) {
                tooltip.transition()
                    .duration(300)
                    .style("opacity", .8);
                tooltip.html(nodeToolTip(d))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            })
            .on('mouseover.fade', fade(0.1))
            .on("mouseout.tooltip", function() {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0);
            })
            .on('mouseout.fade', fade(1))
            .on("mousemove", function() {
                tooltip.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
        node.on('dblclick', releasenode)


        const linkedByIndex = {};
        graph.links.forEach(d => {
            linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
        });

        function isConnected(a, b) {
            return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
        }

        function fade(opacity) {
            return d => {
                node.style('stroke-opacity', function(o) {
                    const thisOpacity = isConnected(d, o) ? 1 : opacity;
                    this.setAttribute('fill-opacity', thisOpacity);
                });

                link.style('stroke-opacity', function(o) {
                    const thisOpacity = (o.source === d || o.target === d) ? 1 : opacity;
                    this.setAttribute('opacity', thisOpacity);

                });

            };
        }


        function ticked() {

            link
                .attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                });

            node.attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }


        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(_) {
            if (!d3.event.active) simulation.alphaTarget(0);
            //d.fx = null;
            //d.fy = null;
        }

        function releasenode(d) {
            d.fx = null;
            d.fy = null;
        }

        function mean(numbers) {
            var total = 0,
                i;
            for (i = 0; i < numbers.length; i += 1) {
                total += numbers[i];
            }
            return total / numbers.length;
        }

        svg.selectAll("myDots")
            .data(typeNoeud)
            .enter()
            .append("circle")
            .attr("cx", 10)
            .attr("cy", function(d, i) {
                return 28 + i * 25
            }) // 30 is where the first dot appears. 25 is the distance between dots
            .attr("r", 8)
            .style("fill", colorChoice);

        svg.selectAll("myLabelNode")
            .data(typeNoeud)
            .enter()
            .append("text")
            .attr('x', 30)
            .attr('y', function(d, i) {
                return 34 + i * 25
            })
            .text(function(d) {
                return d;
            })
            .style("fill", colorChoice)
            .style("font-size", 15);

        if (needLabel) {
            svg.selectAll("myLines")
                .data(typeUse)
                .enter()
                .append("rect")
                .attr("stroke-width", 5)
                .attr("x", 2)
                .attr("y", function(d, i) {
                    return 204 + i * 25
                })
                .attr("width", 20)
                .attr("height", 3) // 30 is where the first dot appears. 25 is the distance between dots
                .style("fill", colorChoice);

            svg.selectAll("myLabelUse").data(typeUse)
                .enter()
                .append("text")
                .attr('x', 30)
                .attr('y', function(d, i) {
                    return 209 + i * 25
                })
                .text(function(d) {
                    return d;
                })
                .style("fill", colorChoice)
                .style("font-size", 15);
        }

    });

}
