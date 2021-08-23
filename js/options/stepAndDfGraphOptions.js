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