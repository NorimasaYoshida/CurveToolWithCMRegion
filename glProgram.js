// Copyright 2025 Norimasa Yoshida

function  CheckAttribVal(v, s) {
    if ( v === -1 ) {
        console.error(s, "not found");
    }
}

function CheckUniformVal(v, s ) {
    if ( v === null ) {
        console.error(s, "not found");
    }

}

function createProgram( vertexSharderSource, fragmentShaderSource ) {
    let vertexShader = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vertexShader, vertexSharderSource );
    gl.compileShader( vertexShader );
    if (!gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ))
       throw new Error( "Unable to compile shader: "+gl.getShaderInfoLog( vertexShader ));

    let fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( fragmentShader, fragmentShaderSource );
    gl.compileShader( fragmentShader );
    if (!gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ))
       throw new Error( "Unable to compile shader: "+gl.getShaderInfoLog( fragmentShader ));
    
    let program = gl.createProgram();
    gl.attachShader( program, vertexShader );
    gl.attachShader( program, fragmentShader );
    gl.linkProgram( program );
    if (!gl.getProgramParameter( program, gl.LINK_STATUS ))
       throw new Error( "Unable to link program: "+gl.getProgramInfoLog( program ));
    return program;
 }

 function GenerateShaders(vs, fs) {
    let vs1 = document.querySelector(vs).text.trim();
    let fs1 = document.querySelector(fs).text.trim();
    let program = createProgram(vs1, fs1);

    return program;
}

