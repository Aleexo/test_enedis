function createGraphFrom(pathJson, options) {

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        const svg = d3.select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height");

        d3.json(`https://raw.githubusercontent.com/Aleexo/test_enedis/main/json/${pathJson}`, function(error, graph) {

            if (error) throw error;

            const typeNoeud = options.getTypeNoeud(graph)
            const typeUse = options.getTypeUse(graph)
            const colorn = options.colorn
            const colorl = options.colorl
            const colorChoice = options.getColorChoice(typeNoeud, typeUse, colorn, colorl)
            const nodeColor = options.getNodeColor(colorChoice)
            const linkColor = options.getLinkColor(colorChoice)
            const radius = options.getRadiusFunction(graph)

            const simulation = d3.forceSimulation(graph.nodes) //Modify link distance/strength here
                .force("link", d3.forceLink().id(function(d) {
                    return d.id;
                }).distance(80).strength(1.5))
                .force("charge", d3.forceManyBody().strength(-800)) //Charge strength is here
                .force("center", d3.forceCenter(width / 2, height / 2));


            svg.append("svg:defs").selectAll("marker")
                .data(["end"]) // Different link/path types can be defined here
                .enter().append("svg:marker") // This section adds in the arrows
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", -1.5)
                .attr("markerWidth", 20)
                .attr("markerHeight", 20)
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
                    tooltip.html(options.linkToolTip(d))
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


            const node = svg.append("g")
                .attr("class", "nodes")
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
                .style("fill", nodeColor)
                .on('mouseover.tooltip', function(d) {
                    tooltip.transition()
                        .duration(300)
                        .style("opacity", .8);
                    tooltip.html(options.nodeToolTip(d))
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

            console.log(link)
            console.log(node)
            console.log(svg)


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
                        this.setAttribute('fill-opacity', thisOpacity)
                        this.setAttribute('stroke-opacity', thisOpacity)
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

            if (options.needLabel) {
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

    function getPath_Title_Options(fileName) {
        const splitName = fileName.substring(0, fileName.lastIndexOf(".")).split("_")
        console.log(splitName)

        const graphType = splitName[0]
        const module = splitName[1]

        switch (module) {
            case "Overall":
                document.getElementById("h2").innerHTML = ""
                var pathJson = `Overall/${nameJsonFile}`
                break

            default:
                document.getElementById("h2").innerHTML = `Module : ${module}`
                var pathJson = `ByModule/${module}/${nameJsonFile}`
        }

        switch (graphType) {
            case "dfGraph":
                document.getElementById("h1").innerHTML = "Graphe de dépendances des Dataframes"
                var options = dfGraphOptions
                break

            case "stepGraph":
                document.getElementById("h1").innerHTML = "Graphe de dépendances des Steps"
                var options = stepGraphOptions
                break

            case "stepAndDfGraph":
                document.getElementById("h1").innerHTML = "Graphe de dépendances entre Steps et Dataframes"
                var options = stepAndDfGraphOptions
                break

            case "submoduleGraph":
                document.getElementById("h1").innerHTML = "Graphe de dépendances des Sous-Modules"
                var options = submoduleGraphOptions
                break
        }

        return [pathJson, options]
    }

    function options(getTypeNoeud, getTypeUse, colorn, colorl, getColorChoice, getNodeColor, getLinkColor, linkToolTip, nodeToolTip, getRadiusFunction, needLabel) {
        this.getTypeNoeud = getTypeNoeud
        this.getTypeUse = getTypeUse
        this.colorn = colorn
        this.colorl = colorl
        this.getColorChoice = getColorChoice
        this.getNodeColor = getNodeColor
        this.getLinkColor = getLinkColor
        this.linkToolTip = linkToolTip
        this.nodeToolTip = nodeToolTip
        this.getRadiusFunction = getRadiusFunction
        this.needLabel = needLabel
    }

    const dfGraphOptions = new options(

        function getTypeNoeud(graph) {
            const submodules = [];
            for (let i = 0; i < graph.nodes.length; i++) {
                submodules.push(graph.nodes[i].submodule)
            };

            const typeNoeud = Array.from(new Set(submodules));
            console.log(typeNoeud)
            return typeNoeud
        },
        function getTypeUse(graph) {

        },

        d3.scaleOrdinal(d3.schemeCategory10),

        [],

        function getColorChoice(typeNoeud, typeUse, colorn, colorl) {
            return function(d) {
                return colorn(typeNoeud.indexOf(d))
            };
        },

        function getNodeColor(colorChoice) {
            return function(d) {
                return colorChoice(d.submodule)
            };
        },

        function getLinkColor() {
            return function(d) {
                return 'rgba(218, 145, 10, 0.686)'
            };
        },

        function linkToolTip(d) {
            return "Source:" + d.source.id +
                "<p/>Target:" + d.target.id
        },

        function nodeToolTip(d) {
            return "Name:" + d.id +
                "<p/>Submodule:" + d.submodule +
                "<p/>Group:" + d.group
        },

        function getRadiusFunction(graph) {
            return function(d) {
                return 14
            }

        },

        false)

    const stepGraphOptions = new options(

        function getTypeNoeud(graph) {
            const submodules = [];
            for (let i = 0; i < graph.nodes.length; i++) {
                submodules.push(graph.nodes[i].submodule)
            };

            const typeNoeud = Array.from(new Set(submodules));
            console.log(typeNoeud)
            return typeNoeud
        },

        function getTypeUse(graph) {

        },

        d3.scaleOrdinal(d3.schemeCategory10),

        [],

        function getColorChoice(typeNoeud, typeUse, colorn, colorl) {
            return function(d) {
                return colorn(typeNoeud.indexOf(d))
            };
        },

        function getNodeColor(colorChoice) {
            return function(d) {
                return colorChoice(d.submodule)
            };
        },

        function getLinkColor() {
            return function(d) {
                return 'rgba(218, 145, 10, 0.686)'
            };
        },

        function linkToolTip(d) {
            return "Source:" + d.source.id +
                "<p/>Target:" + d.target.id
        },

        function nodeToolTip(d) {
            return "Name:" + d.id +
                "<p/>Submodule:" + d.submodule
        },

        function getRadiusFunction(graph) {
            return function(d) {
                return 14
            }

        },

        false
    )

    const stepAndDfGraphOptions = new options(
        function getTypeNoeud(graph) {
            return [
                'FinalDataframeDescriptor',
                'ImportDataframeDescriptor',
                'WorkDataframeDescriptor',
                'OutputDataframeDescriptor',
                'Scala_class_Step',
                'Scala_class_Check',
                'Scala_class_from_makebusinessdataframes'
            ];
        },

        function getTypeUse(graph) {
            return ['load', 'save'];
        },

        ['Gold', 'SeaGreen', 'Navy', 'Crimson', 'Black', 'DarkGray', 'SaddleBrown'],

        d3.scaleOrdinal(["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"]),

        function getColorChoice(typeNoeud, typeUse, colorn, colorl) {
            return function(d) {
                if (typeNoeud.includes(d)) {
                    var color = colorn[typeNoeud.indexOf(d)]
                } else if (typeUse.includes(d)) {
                    var color = colorl(typeUse.indexOf(d))
                } else {
                    var color = 'black'
                }
                return color
            }
        },

        function getNodeColor(colorChoice) {
            return function(d) {
                return colorChoice(d.group)
            };
        },

        function getLinkColor(colorChoice) {
            return function(d) {
                return colorChoice(d.use)
            };
        },

        function linkToolTip(d) {
            return "Source:" + d.source.id +
                "<p/>Target: " + d.target.id +
                "<p/>Size: " + d.size
        },

        function nodeToolTip(d) {
            if (d.type === "dataframe") {
                return "Name:" + d.id +
                    "<p/>Group: " + d.group +
                    "<p/>Size: " + d.weight +
                    "<p/>Module:" + d.module +
                    "<p/>Submodule:" + d.submodule
            } else {
                return "Name:" + d.id +
                    "<p/>Group: " + d.group +
                    "<p/>Module:" + d.module +
                    "<p/>Submodule:" + d.submodule
            }
        },

        function getRadiusFunction(graph) {
            return function(d) {
                if (d.type === "dataframe") {
                    d.weight = graph.links.filter(function(l) {
                        return (l.source.id === d.id || l.target.id === d.id)
                    }).map(link => link.size)[0]
                } else {
                    d.weight = 1000
                }
                const minRadius = 6;

                return minRadius + Math.log10(d.weight) / Math.log10(5);
            }

        },

        true
    )

    submoduleGraphOptions = new options(

        function getTypeNoeud(graph) {
            const modules = [];
            for (let i = 0; i < graph.nodes.length; i++) {
                modules.push(graph.nodes[i].module)
            };

            const typeNoeud = Array.from(new Set(modules));
            console.log(typeNoeud)
            return typeNoeud
        },

        function getTypeUse(graph) {

        },

        d3.scaleOrdinal(d3.schemeCategory10),

        [],

        function getColorChoice(typeNoeud, typeUse, colorn, colorl) {
            return function(d) {
                return colorn(typeNoeud.indexOf(d))
            };
        },

        function getNodeColor(colorChoice) {
            return function(d) {
                return colorChoice(d.module)
            };
        },

        function getLinkColor() {
            return function(d) {
                return 'rgba(218, 145, 10, 0.686)'
            };
        },

        function linkToolTip(d) {
            return "Source:" + d.source.id +
                "<p/>Target:" + d.target.id
        },

        function nodeToolTip(d) {
            return "Module:" + d.module +
                "<p/>Submodule:" + d.submodule
        },

        function getRadiusFunction(graph) {
            return function(d) {
                return 14
            }

        },

        false
    )
