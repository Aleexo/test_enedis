function generateGraph(fileName) {
    const splitName = fileName.substring(0, fileName.lastIndexOf(".")).split("_")
    console.log(splitName)

    const graphType = splitName[0]
    const module = splitName[1]

    switch (module) {
        case "Overall":
            var pathJson = `Overall/${fileName}`
            break

        default:
            var pathJson = `ByModule/${module}/${fileName}`
    }

    switch (graphType) {
        case "dfGraph":
            var options = dfGraphOptions
            break

        case "stepGraph":
            var options = stepGraphOptions
            break

        case "stepAndDfGraph":
            var options = stepAndDfGraphOptions
            break

        case "submoduleGraph":
            var options = submoduleGraphOptions
            break
    }

    createGraphFrom(pathJson, options)
}
