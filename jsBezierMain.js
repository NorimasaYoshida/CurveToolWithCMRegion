// Copyright 2025 Norimasa Yoshida

const canvas = document.getElementById("glCanvas");

const gl = canvas.getContext('webgl2') || canvas.getContext('experimental-webgl');
if (!gl)
   throw new Error("WebGL not supported!");

const version = gl.getParameter(gl.VERSION);
console.log('WebGL Version:', version);
const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
console.log('Shading Language Version:', shadingLanguageVersion);

// to receve keydown in canvas
canvas.setAttribute("tabindex", "0");
canvas.focus();

const contorlPolygonCheckBox = document.getElementById('ControlPolygonCheckBox');
const CMRegionCheckBox = document.getElementById('CMRegionCheckBox');
const combCheckBox = document.getElementById("CombCheckBox")
const inputCombScale = document.getElementById('combScale');

const windowSize = document.getElementById("windowSize");

let curveSG = [];
let currentCurveSG = -1;
let generatingPt = -1;
let selectedPt = -1;
let selectedPtMoving = 0;
let preSelectedPt = -1;
let preCurrentCurveSG = -1;
let showControlPolygon = (contorlPolygonCheckBox.checked ? 1 : 0);
let showCMRegion = (CMRegionCheckBox.checked ? 1 : 0);;
let showComb = (combCheckBox.checked ? 1 : 0);
let combScale = parseFloat(inputCombScale.value);;

let glProgram = GenerateShaders("#vertex-shader", "#fragment-shader"); 
let modelviewMatrix;
let projectionMatrix;

let winScale = 1.0;
let offsetX = 0.;
let offsetY = 0.;
let lxWin = -1. / winScale - offsetX;
let rxWin = 1. / winScale - offsetX;
let tyWin = 1. / winScale - offsetY;
let byWin = -1. / winScale - offsetY;


const glProgramInfo = {
    program: glProgram,
    attribLocations: {
        glPos: gl.getAttribLocation(glProgram, "pos"),
    },
    uniformLocations: {
        fcolor: gl.getUniformLocation(glProgram, "fcolor"),
        modelview: gl.getUniformLocation(glProgram, "modelview"),
        projection: gl.getUniformLocation(glProgram, "projection"),
    },
};
CheckAttribVal(glProgramInfo.attribLocations.glPos, "glProgramInfo.attribLocations.glPos");
CheckUniformVal(glProgramInfo.uniformLocations.fcolor, "glProgramInfo.uniformLocations.fcolor ");
CheckUniformVal(glProgramInfo.uniformLocations.modelview, "glProgramInfo.uniformLocations.modelview ");
CheckUniformVal(glProgramInfo.uniformLocations.projection, "glProgramInfo.uniformLocations.projection ");

let glProgram2 = GenerateShaders("#vertex-shader2", "#fragment-shader2");
const glProgramInfo2 = {
    program: glProgram2,
    attribLocations: {
        glPos: gl.getAttribLocation(glProgram2, "position"),
    },
    uniformLocations: {
        modelview: gl.getUniformLocation(glProgram2, "modelview"),
        projection: gl.getUniformLocation(glProgram2, "projection"),
        PT: gl.getUniformLocation(glProgram2, "PT"),
        PT2: gl.getUniformLocation(glProgram2, "PT2"),
        movingPT: gl.getUniformLocation(glProgram2, "movingPT"),
        endRegP: gl.getUniformLocation(glProgram2, "endRegP"),
    },
};

CheckAttribVal(glProgramInfo2.attribLocations.glPos, "glProgramInfo2.attribLocations.glPos");
CheckUniformVal(glProgramInfo2.uniformLocations.modelview, "glProgramInfo2.uniformLocations.modelview ");
CheckUniformVal(glProgramInfo2.uniformLocations.projection, "glProgramInfo2.uniformLocations.projection ");
CheckUniformVal(glProgramInfo2.uniformLocations.PT, "glProgramInfo2.uniformLocations.PT ");
CheckUniformVal(glProgramInfo2.uniformLocations.PT2, "glProgramInfo2.uniformLocations.PT2 ");
CheckUniformVal(glProgramInfo2.uniformLocations.movingPT, "glProgramInfo2.uniformLocations.movingPT ");
CheckUniformVal(glProgramInfo2.uniformLocations.endRegP, "glProgramInfo2.uniformLocations.endRegP ");

initEventHandlers();

DrawEverything();


 function DrawEverything() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    modelviewMatrix = mat4.create();
    projectionMatrix = mat4.create();
    mat4.ortho(projectionMatrix, lxWin, rxWin, byWin, tyWin, -1, 1);

    let cl = 1.; //(showCMRegion == 1 ? 0.98 : 0.95);
    gl.clearColor(cl, cl, cl, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if ( currentCurveSG != -1 ) {
        curveSG[currentCurveSG].DrawCMRegion();
    }
    for(let i = 0; i < curveSG.length; i++) {
        curveSG[i].DrawCurve();
    }
}


function EndCurve() {
    generatingPt = -1;
    curveSG[currentCurveSG].pt.length -= 3;
    if ( curveSG[currentCurveSG].pt.length <= 3 ) {
        curveSG.splice(currentCurveSG, 1);
    }
    currentCurveSG = -1;
}


function initEventHandlers() {
  
    document.getElementById('LoadFile').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const jsonString = e.target.result;
            curveData = JSON.parse(jsonString);
            ClearParameters();
            for(let i = 0; i < curveData.length; i++) {
                curveSG.push(new CurveSG);
                for(let j = 0; j < curveData[i].pt.length; j++) {
                    let mx = curveData[i].pt[j].x;
                    let my = curveData[i].pt[j].y;
                    let g1flg = curveData[i].g1flag[j];
                    curveSG[i].AddPoint2(({x: mx, y: my}), g1flg);
                }
                console.log('read');
            }
            DrawEverything();
            console.log(curveSG.length);
            event.target.value = '';    // for reading the same file again
        };
        reader.readAsText(file);
    });

    inputCombScale.addEventListener('change', () => {
        combScale = parseFloat(inputCombScale.value);
        DrawEverything();
    });


    contorlPolygonCheckBox.addEventListener('change', (event) => {
        if ( event.target.checked ) 
            showControlPolygon = 1;
        else
            showControlPolygon = 0;
        DrawEverything();
    });


    CMRegionCheckBox.addEventListener('change', (event) => {
        if ( event.target.checked ) 
            showCMRegion = 1;
        else
            showCMRegion = 0;
        DrawEverything();
    });

    combCheckBox.addEventListener('change', (event) => {
        if ( event.target.checked ) 
            showComb = 1;
        else
            showComb = 0;
        DrawEverything();
    });


    canvas.addEventListener("keydown", (ev) => {
        const offsetStep = 0.05; // / winScale;
        const zoomScale = 1.1;
        let needRedraw = 0;
    
        switch (ev.key) {
            case "ArrowUp":
            case "w":
            case "W":
                offsetY += offsetStep;
                needRedraw = 1;
                break;
            case "ArrowDown":
            case "s":
            case "S":
                offsetY -= offsetStep;
                needRedraw = 1;
                break;
            case "ArrowLeft":
            case "a":
            case "A":
                offsetX -= offsetStep;
                needRedraw = 1;
                break;
            case "ArrowRight":
            case "d":
            case "D":
                offsetX += offsetStep;
                needRedraw = 1;
                break;
    
            case "+":
                winScale *= zoomScale;
                needRedraw = 1;
                break;
            case "-":
                winScale /= zoomScale;
                needRedraw = 1;
                break;
        }
        if ( needRedraw ) {
            SetWindowCorners();
            // console.log(offsetX, offsetY, winScale);
            // console.log("lx = ", lxWin, " rx = ", rxWin, " ty = ", tyWin, " by = ", byWin);
            DrawEverything();
        }
        else if ( currentCurveSG != -1 ) {
            if ( ev.key == "Enter" ) {
                if  ( generatingPt != -1 ) {
                    EndCurve();
                    DrawEverything();
                }
            }
            if ( ev.key == "Delete" ) {
                if ( selectedPt != -1 ) {
                    let spt = selectedPt - (selectedPt % 3);
                    curveSG[currentCurveSG].pt.splice(spt, 3); 
                    if ( curveSG[currentCurveSG].pt.length == 0 )  {
                        curveSG.splice(currentCurveSG, 1);
                    }
                    selectedPt = -1;
                    currentCurveSG = -1;
                    DrawEverything();
                }
            }
        }
    });

    function fnx(x, left, width) {
        let xu = (x - left)/width;
        return (rxWin - lxWin) * xu + lxWin;
    }

    function fny(y, bottom, width) {
        let yu = (bottom - y)/width;
        return (tyWin - byWin) * yu + byWin;
    }

    canvas.onmousedown = function (ev) {
        let rect = ev.target.getBoundingClientRect();
        let width = rect.right - rect.left;
        let mx = fnx(ev.clientX, rect.left, width);
        let my = fny(ev.clientY, rect.bottom, width); 
        if ( ev.button == 0 ) {
            if ( curveSG.length > 0 && generatingPt == -1) {
                preSelectedPt = selectedPt;
                preCurrentCurveSG = currentCurveSG;
                for(let i = 0; i < curveSG.length; i++) {
                    selectedPt = curveSG[i].FindPt(mx, my);
                    if ( selectedPt != -1 ) {
                        currentCurveSG = i;
                        selectedPtMoving = 1;
                        break;
                    }
                }
            }

            if ( selectedPt == -1 ) {
                if ( currentCurveSG == -1 ) {
                    curveSG.push(new CurveSG);
                    currentCurveSG = curveSG.length - 1;
                    generatingPt = curveSG[currentCurveSG].pt.length + 2;
                    curveSG[currentCurveSG].AddPoint(({x: mx, y: my}));
                    curveSG[currentCurveSG].AddPoint(({x: mx, y: my}));
                    curveSG[currentCurveSG].AddPoint(({x: mx, y: my}));
                }
                else if ( generatingPt == -1 ) {
                    generatingPt = curveSG[currentCurveSG].pt.length + 2;
                    curveSG[currentCurveSG].AddPoint(({x: mx, y: my}));
                    curveSG[currentCurveSG].AddPoint(({x: mx, y: my}));
                    curveSG[currentCurveSG].AddPoint(({x: mx, y: my}));
                }
                else if ( generatingPt % 3 == 1 ) {
                    // By adding 1, (generatingPt % 3) becomes 2. This means that the mouse button is pushed.
                    generatingPt = generatingPt + 1;
                }
            }

            DrawEverything();
        }
    };
  
    canvas.onmouseup = function (ev) {
        let rect = ev.target.getBoundingClientRect();
        let width = rect.right - rect.left;
        let mx = fnx(ev.clientX, rect.left, width);
        let my = fny(ev.clientY, rect.bottom, width); 
        if ( currentCurveSG != -1 ) {
            if ( ev.ctrlKey ) {
                EndCurve();
            }
            else if ( generatingPt != -1 ) {
                if ( generatingPt % 3 == 2) {
                    generatingPt = curveSG[currentCurveSG].pt.length + 1;
                    curveSG[currentCurveSG].AddPoint(({x: mx, y: my}));
                    curveSG[currentCurveSG].AddPoint(({x: mx, y: my}));
                    curveSG[currentCurveSG].AddPoint(({x: mx, y: my}));
                }
            }
            else {
                generatingPt = -1;
            }
        }
        if ( preCurrentCurveSG == currentCurveSG && preSelectedPt == selectedPt && selectedPtMoving != 2) {
            currentCurveSG = -1;
            preSelectedPt = -1;
        }
        selectedPtMoving = 0;
        DrawEverything();
    };
  
    canvas.onmousemove = function (ev) {
        let rect = ev.target.getBoundingClientRect();
        let width = rect.right - rect.left;
        let mx = fnx(ev.clientX, rect.left, width);
        let my = fny(ev.clientY, rect.bottom, width); 
        //console.log(mx, my);        
        let g1Flg = 1;
        if ( ev.altKey ) g1Flg = 0;
        if ( currentCurveSG != -1 ) {
            if ( generatingPt != -1 ) {
                curveSG[currentCurveSG].ModifyPt(mx, my, generatingPt, g1Flg); 
                DrawEverything();
            }
            else if ( selectedPt != -1 && selectedPtMoving ) {
                curveSG[currentCurveSG].ModifyPt(mx, my, selectedPt, g1Flg); 
                selectedPtMoving = 2;
                DrawEverything();
            }
        }
    };
  }

function ResizeWindow() {
    canvas.width = parseInt(windowSize.value, 10);
    canvas.height = canvas.width;
    DrawEverything();
}

function ClearParameters() {
        curveSG.length = 0;
        currentCurveSG = -1;
        generatingPt = -1;
        selectedPt = -1;
        selectedPtMoving = false;
}

function ClearButton() {
    if (confirm("Clear all points?")) {
        ClearParameters();
        SetToDefaultView();
        DrawEverything();
    }
}

function SetWindowCorners() {
    lxWin = -1. / winScale - offsetX;
    rxWin = 1. / winScale - offsetX;
    tyWin = 1. / winScale - offsetY;
    byWin = -1. / winScale - offsetY;
}

function SetToDefaultView() {
    offsetX = 0.;
    offsetY = 0.;
    winScale = 1.;
    SetWindowCorners();
}

function DefaultViewButton() {
    SetToDefaultView();
    DrawEverything();;
}


function SaveButton() {
    const jsonString = JSON.stringify(curveSG);
    console.log(jsonString);

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'curveData.json';
    a.click();

    URL.revokeObjectURL(url);
}

function LoadButtion() {

}
