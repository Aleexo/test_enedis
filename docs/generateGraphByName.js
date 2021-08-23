function generateGraph(fileName) {
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

    createGraphFrom(pathJson, options)
}