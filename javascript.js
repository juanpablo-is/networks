var botones = document.getElementById("botones").children;
var pickColor = [];
var cantidadNodos = 0;
var valoresTexto = [];
var valoresRelacion = [];
var valoresNumero = [];
let clickAnterior = "";
let ejecutando = false;

let arraysLabel = [];
let arraysLabelCorrecto = [];
let arrayValores = [];
let anteriorEdge;
var network;
let nodes = [];
let edges = [];
let arrayBellmanFord = [];

// loadJSON()

botones[1].addEventListener('click', calcularArbol, true);
botones[2].addEventListener('click', ejecutarRecorridoTotal, true);
botones[3].addEventListener('click', ejecutarRecorrido, true);
botones[4].addEventListener('click', popUpSetting, true);
botones[5].addEventListener('click', cargarGrafos, true);

function popUpSetting() {
    crearDivPopUp("ADD VALUES FOR TREE");
    infoSetting();
}

function cargarGrafos() {
    crearDivPopUp("LOAD SOME GRAPHS");
    let info = document.getElementById("infoPop");
    let divMainGraphs = document.createElement("div");
    divMainGraphs.classList.add("listGraphs");

    let labelFile = document.createElement("label");
    labelFile.innerHTML = "Load file JSON";

    let select = document.createElement("select");
    select.setAttribute('id', 'selectJSON');
    for (let i = 0; i < 5; i++) {
        let option = document.createElement('option');
        option.setAttribute('value', (i + 1));
        option.setAttribute('class', 'arbol');
        option.innerHTML = 'Arbol #' + (i + 1);
        select.appendChild(option);
    }

    divMainGraphs.appendChild(labelFile);
    divMainGraphs.appendChild(select);

    var submit = document.createElement("button");
    submit.innerHTML = "GENERATE TREE";
    submit.id = "submitTree";
    submit.addEventListener('click', () => {
        let value = select.options[select.selectedIndex].value;
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', `JSON/arbol_${value}.json`, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                generarJSONGraph(JSON.parse(xobj.responseText));
            }
        };
        xobj.send();
    }, false);

    info.appendChild(divMainGraphs);
    info.appendChild(submit);
}

function generarJSONGraph(jsonText) {
    let grafo = jsonText;
    nodes = [];
    edges = [];
    let nodesAgregados = [];
    clickAnterior = "";
    ejecutando = false;

    pickColor.push(grafo.colorNode);
    pickColor.push(grafo.colorEdge);
    cantidadNodos = grafo.nodes.length;

    let txtNodos = grafo.nodes;
    let txtRelacion = grafo.edges;
    let valorRelacion = grafo.values;

    for (let i = 0; i < cantidadNodos; i++) {
        nodes.push({ id: txtNodos[i], label: txtNodos[i], color: pickColor[0], font: { color: 'white' } });
        let split = txtRelacion[i].split(",");
        let splitTxt = valorRelacion[i].split(",");
        for (let j = 0; j < split.length; j++) {

            if (!nodesAgregados.some(item => item.node === txtNodos[i] && item.valor === splitTxt[j]) || !nodesAgregados.some(item => item.node === split[j] && item.valor === splitTxt[j])) {
                edges.push({ from: txtNodos[i], to: split[j], label: splitTxt[j], color: pickColor[1], arrows: "to" });
                nodesAgregados.push({ node: txtNodos[i], valor: splitTxt[j] });
                nodesAgregados.push({ node: split[j], valor: splitTxt[j] });
            }
        }
    }

    document.getElementById("posicionAbsoluta").style.display = "none";

    nodes = new vis.DataSet(nodes);
    edges = new vis.DataSet(edges);

    var container = document.getElementById("mynetwork");
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
    };
    network = new vis.Network(container, data, options);

    network.on("click", function (params) {
        if (!ejecutando) {
            if (params.nodes.length > 0) {
                let nodeId = params.nodes[0];
                if (clickAnterior !== "") {
                    nodes.update({ id: clickAnterior, color: pickColor[0] });
                }
                nodes.update({ id: nodeId, color: pickColor[1] });
                clickAnterior = nodeId;
            }
        }
    });
}

function crearDivPopUp(tituloPopUp) {
    let divPrincipal = document.createElement("div");
    divPrincipal.id = "posicionAbsoluta";
    let divSecundario = document.createElement("div");
    divSecundario.id = "infoPop";

    let salir = document.createElement("h4");
    salir.innerHTML = "X";
    salir.id = "salir";
    divSecundario.appendChild(salir);

    divPrincipal.appendChild(divSecundario);
    document.body.prepend(divPrincipal);

    let h2 = document.createElement("h2");
    h2.innerHTML = tituloPopUp;
    divSecundario.appendChild(h2);
    divSecundario.appendChild(document.createElement("hr"));

    salir.addEventListener('click', function (e) {
        document.getElementById("posicionAbsoluta").remove();
    }, true);
}

function infoSetting() {

    let info = document.getElementById("infoPop");

    let divColorRow = document.createElement("div");
    divColorRow.classList.add("row2");
    let divColorColumna1 = document.createElement("div");
    divColorColumna1.classList.add("columna2");
    let divColorColumna2 = document.createElement("div");
    divColorColumna2.classList.add("columna2");

    let inputColor1 = document.createElement("input");
    let labelColor1 = document.createElement("label");
    inputColor1.setAttribute("type", "color");
    inputColor1.setAttribute("value", "#00ff00");
    inputColor1.setAttribute("id", "colorNodo");
    labelColor1.setAttribute("for", "colorNodo");
    labelColor1.innerHTML = "Node color";
    divColorColumna1.appendChild(labelColor1);
    divColorColumna1.appendChild(inputColor1);


    let inputColor2 = document.createElement("input");
    let labelColor2 = document.createElement("label");
    inputColor2.setAttribute("type", "color");
    inputColor2.setAttribute("id", "colorLinea");
    inputColor2.setAttribute("value", "#ff0000");
    labelColor2.setAttribute("for", "colorLinea");
    labelColor2.innerHTML = "Line color";
    divColorColumna2.appendChild(labelColor2);
    divColorColumna2.appendChild(inputColor2);

    divColorRow.appendChild(divColorColumna1);
    divColorRow.appendChild(divColorColumna2);
    info.appendChild(divColorRow);

    let divNodos = document.createElement("div");
    divNodos.classList.add("row2");
    let labelNodos = document.createElement("label");
    labelNodos.innerHTML = "Number nodes:";
    labelNodos.setAttribute("for", "cantidadNodos");
    let inputNodos = document.createElement("input");
    inputNodos.setAttribute("type", "number");
    inputNodos.setAttribute("min", "1");
    inputNodos.setAttribute("id", "cantidadNodos");
    inputNodos.setAttribute("name", "cantidadNodos");
    divNodos.appendChild(labelNodos);
    divNodos.appendChild(inputNodos);

    let nodos = document.createElement("div");
    nodos.id = "nodosList";

    inputNodos.addEventListener('input', function (e) {
        nodos.innerHTML = "";
        for (let i = 0; i < e.target.valueAsNumber; i++) {
            let divValue = document.createElement("div");
            divValue.classList.add("row3");

            let divValue1 = document.createElement("div");
            divValue1.classList.add("row2");
            let label1 = document.createElement("label");
            label1.setAttribute("for", "valueNodo" + i);
            label1.innerHTML = "Text Node";
            divValue1.appendChild(label1);

            let input1 = document.createElement("input");
            input1.setAttribute("type", "text");
            input1.setAttribute("id", "valueNodo" + i);
            input1.classList.add("valueNodos");
            divValue1.appendChild(input1);
            divValue.appendChild(divValue1);

            let divValue2 = document.createElement("div");
            divValue2.classList.add("row2");
            let label2 = document.createElement("label");
            label2.setAttribute("for", "valueNodoRelacion" + i);
            label2.innerHTML = "Relation Node";
            divValue2.appendChild(label2);

            let input2 = document.createElement("input");
            input2.setAttribute("type", "text");
            input2.setAttribute("id", "valueNodoRelacion" + i);
            input2.classList.add("valueNodoRelacion");
            divValue2.appendChild(input2);
            divValue.appendChild(divValue2);

            let divValue3 = document.createElement("div");
            divValue3.classList.add("row2");
            let label3 = document.createElement("label");
            label3.setAttribute("for", "valueNumber" + i);
            label3.innerHTML = "Number Relation";
            divValue3.appendChild(label3);

            let input3 = document.createElement("input");
            input3.setAttribute("type", "text");
            input3.setAttribute("id", "valueNumber" + i);
            input3.classList.add("valueNumber");
            divValue3.appendChild(input3);
            divValue.appendChild(divValue3);
            nodos.appendChild(divValue);
        }
    }, true);

    var submit = document.createElement("button");
    submit.innerHTML = "GENERATE TREE";
    submit.id = "submitTree";
    submit.addEventListener('click', calcularArbol, true);

    info.appendChild(divNodos);
    info.appendChild(nodos);
    info.appendChild(submit);
}

function calcularArbol() {
    nodes = [];
    edges = [];
    let nodesAgregados = [];
    clickAnterior = "";
    ejecutando = false;

    pickColor.push(document.getElementById("colorNodo").value);
    pickColor.push(document.getElementById("colorLinea").value);
    cantidadNodos = document.getElementById("cantidadNodos").value;

    let txtNodos = document.getElementsByClassName("valueNodos");
    let txtRelacion = document.getElementsByClassName("valueNodoRelacion");
    let valorRelacion = document.getElementsByClassName("valueNumber");

    for (let i = 0; i < cantidadNodos; i++) {
        nodes.push({ id: txtNodos[i].value, label: txtNodos[i].value, color: pickColor[0], font: { color: 'white' } });
        let split = txtRelacion[i].value.split(",");
        let splitTxt = valorRelacion[i].value.split(",");
        for (let j = 0; j < split.length; j++) {

            if (!nodesAgregados.some(item => item.node === txtNodos[i].value && item.valor === splitTxt[j]) || !nodesAgregados.some(item => item.node === split[j] && item.valor === splitTxt[j])) {
                edges.push({ from: txtNodos[i].value, to: split[j], label: splitTxt[j], color: pickColor[1], arrows: "to" });
                nodesAgregados.push({ node: txtNodos[i].value, valor: splitTxt[j] });
                nodesAgregados.push({ node: split[j], valor: splitTxt[j] });
            }
        }
    }

    document.getElementById("posicionAbsoluta").style.display = "none";

    nodes = new vis.DataSet(nodes);
    edges = new vis.DataSet(edges);

    var container = document.getElementById("mynetwork");
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
    };
    network = new vis.Network(container, data, options);

    network.on("click", function (params) {
        if (!ejecutando) {
            if (params.nodes.length > 0) {
                let nodeId = params.nodes[0];
                if (clickAnterior !== "") {
                    nodes.update({ id: clickAnterior, color: pickColor[0] });
                }
                nodes.update({ id: nodeId, color: pickColor[1] });
                clickAnterior = nodeId;
            }
        }
    });
}

function ejecutarRecorridoTotal() {
    if (clickAnterior === "") {
        alert("You must select one");
    } else {
        ejecutando = true;
        let i = 0;

        while (i < 8) {
            i++;
            setTimeout(nextIteration(), 5000);
        }
    }
}

function ejecutarRecorrido() {
    if (clickAnterior === "") {
        alert("You must select one");
    } else {
        if (!ejecutando) {
            let divInfoBF = document.createElement("div");
            divInfoBF.innerHTML = "";
            divInfoBF.id = "infoBF";
            document.body.appendChild(divInfoBF);

            for (let i = 1; i <= network.body.nodeIndices.length; i++) {
                arrayBellmanFord.push({ id: i, valor: i == parseInt(clickAnterior) ? 0 : Infinity });
                let h3BF = document.createElement("h3");
                h3BF.innerHTML = i + " --> " + (isFinite(parseInt(arrayBellmanFord[i - 1].valor)) ? arrayBellmanFord[i - 1].valor : "∞");
                divInfoBF.appendChild(h3BF);
            }
            divInfoBF.appendChild(document.createElement("hr"));
        }
        ejecutando = true;
        bellmanFord();
        // nextIteration();
    }
}

function bellmanFord() {

    let divInfoBF = document.getElementById("infoBF");
    for (let i = 1; i <= network.body.nodeIndices.length; i++) {
        let edgesBF = network.body.nodes[i].edges;
        for (let j = 0; j < edgesBF.length; j++) {
            if (i == parseInt(edgesBF[j].fromId)) {
                let valorTO = arrayBellmanFord[parseInt(edgesBF[j].toId) - 1].valor;
                let valorFROM = arrayBellmanFord[i - 1].valor;
                let calculo = valorFROM + parseInt(edgesBF[j].options.label);
                if (calculo < valorTO) {
                    arrayBellmanFord[parseInt(edgesBF[j].toId) - 1].valor = calculo;
                }
            }
        }
    }

    for (let i = 1; i <= network.body.nodeIndices.length; i++) {
        let h3BF = document.createElement("h3");
        h3BF.innerHTML = i + " --> " + (isFinite(parseInt(arrayBellmanFord[i - 1].valor)) ? arrayBellmanFord[i - 1].valor : "∞");
        divInfoBF.appendChild(h3BF);
    }

    divInfoBF.appendChild(document.createElement("hr"));
}

function nextIteration() {
    let networkConnection = network.getConnectedEdges(clickAnterior);
    // console.log(networkConnection);
    for (let j = 0; j < networkConnection.length; j++) {
        if (!arraysLabel.some(item => item.id == networkConnection[j]) && anteriorEdge != networkConnection[j] && !arraysLabelCorrecto.some(item => item.id == networkConnection[j])) {
            let edgeVecino = edges.get(networkConnection[j]);
            arraysLabel.push({ id: networkConnection[j], node: (edgeVecino.from === clickAnterior) ? edgeVecino.to : edgeVecino.from, label: edgeVecino.label });
        }
    }

    let menor = 9999999999;
    let edgeMenor;
    let index = -1;
    for (let i = 0; i < arraysLabel.length; i++) {
        let edgeVecino = arraysLabel[i];
        let valorEdge = parseFloat(edgeVecino.label);
        if (valorEdge < menor) {
            menor = valorEdge
            edgeMenor = edgeVecino;
            index = i;
        }
    }

    arraysLabelCorrecto.push({ id: arraysLabel[index].id });

    arraysLabel.splice(index, 1);
    arrayValores.push(menor);
    nodes.update({ id: edgeMenor.node, color: pickColor[1].value });
    let edgeMenorColor = edges.get(edgeMenor.id);
    edgeMenorColor.color = pickColor[1].value;
    edges.update(edgeMenorColor);

    anteriorEdge = edgeMenor.id;
    clickAnterior = edgeMenor.node;

}

// var nodes = [
//     { id: 1, label: "Node 1", color: "#ffff00" },
//     { id: 2, label: "Node 2", color: "#ffff00" },
//     { id: 3, label: "Node 3", color: "#ffff00" },
//     { id: 4, label: "Node 4", color: "#ffff00" },
//     { id: 5, label: "Node 5", color: "#ffff00" },
//     { id: 6, label: "Node 6", color: "#ffff00" },
//     { id: 7, label: "Node 7", color: "#ffff00" }
// ];

// // create an array with edges
// var edges = [
//     { from: 1, to: 3, label: "10", color: "#ffff00" },
//     { from: 2, to: 4, label: "20", color: "#ffff00" },
//     { from: 2, to: 5, label: "30", color: "#ffff00" },
//     { from: 1, to: 2, label: "40", color: "#ffff00" },
//     { from: 3, to: 6, label: "50", color: "#ffff00" },
//     { from: 5, to: 6, label: "60", color: "#ffff00" },
//     { from: 1, to: 7, label: "70", color: "#ffff00" },
//     { from: 4, to: 7, label: "80", color: "#ffff00" },
// ];

// nodes = new vis.DataSet(nodes);
// edges = new vis.DataSet(edges);

// var container = document.getElementById("mynetwork");
// var data = {
//     nodes: nodes,
//     edges: edges
// };
// var options = {
// };
// var network = new vis.Network(container, data, options);

// network.on("click", function (params) {
//     if (!ejecutando) {
//         if (params.nodes.length > 0) {
//             let nodeId = params.nodes[0];
//             if (clickAnterior !== "") {
//                 nodes.update({ id: clickAnterior, color: "#ffff00" });
//             }
//             nodes.update({ id: nodeId, color: "#00ff00" });
//             clickAnterior = nodeId;
//         }
//     }
// });