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