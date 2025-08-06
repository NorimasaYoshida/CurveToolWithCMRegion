// Copyright 2025 Norimasa Yoshida

class CurveSG {
    constructor() {
        this.pt = [];
        this.g1flag = [];   // 1 if G^1 continuous. Used only for connecting points.  5, 8, 11, etc.
        generatingPt = -1;    // when generating, 1, 4, 7, ...
        selectedPt = -1;
    }
    ClearPt() {
        this.pt = [];
        generatingPt = -1;
        selectedPt = -1;
    }
    AddPoint(v) {
        this.pt.push(v);
        this.g1flag.push(1);
    }
    FindPt(mx, my) {
        let diff = 10.0 / canvas.width * 2;
        for(let i = 0; i < this.pt.length; i++) {
            if ( Math.hypot(this.pt[i].x - mx, this.pt[i].y - my) <= diff ) {
                return i;;
            }
        }
        return -1;
    }

    ModifyPt(mx, my, ptNum, G1flgOrg=0) {
        let ptFlag = ptNum % 3;
        let ptNum0 = ptNum - ptFlag;
        let G1flg = G1flgOrg;
        if ( ptFlag == 0 ) {
            if ( G1flg == 1 ) {
                G1flg = this.g1flag[ptNum+1];
            }
            else {
                this.g1flag[ptNum+1] = 0;
            }
            let orgdx = this.pt[ptNum+2].x - this.pt[ptNum+1].x;
            let orgdy = this.pt[ptNum+2].y - this.pt[ptNum+1].y;
            let orgLen =  Math.sqrt(orgdx*orgdx + orgdy*orgdy);
            this.pt[ptNum].x = mx;
            this.pt[ptNum].y = my;
            if ( G1flg == 1 ) {
                let dx = this.pt[ptNum+1].x - this.pt[ptNum].x;
                let dy = this.pt[ptNum+1].y - this.pt[ptNum].y;
                let len =  Math.sqrt(dx*dx + dy*dy);
                this.pt[ptNum+2].x = this.pt[ptNum+1].x + dx / len * orgLen;
                this.pt[ptNum+2].y = this.pt[ptNum+1].y + dy / len * orgLen;
            }
        }
        else if ( ptFlag == 1 ) {
            let dx1 = this.pt[ptNum+1].x - this.pt[ptNum].x;
            let dy1 = this.pt[ptNum+1].y - this.pt[ptNum].y;
            let dx2 = this.pt[ptNum-1].x - this.pt[ptNum].x;
            let dy2 = this.pt[ptNum-1].y - this.pt[ptNum].y;
            this.pt[ptNum].x = mx;
            this.pt[ptNum].y = my;
            this.pt[ptNum+1].x = dx1 + mx;
            this.pt[ptNum+1].y = dy1 + my;
            this.pt[ptNum-1].x = dx2 + mx;
            this.pt[ptNum-1].y = dy2 + my;    
        }
        else if ( ptFlag == 2 ) {
            if ( G1flg == 1 ) {
                G1flg = this.g1flag[ptNum-1];
            }
            else {
                this.g1flag[ptNum-1] = 0;
            }
            let orgdx = this.pt[ptNum-2].x - this.pt[ptNum-1].x;
            let orgdy = this.pt[ptNum-2].y - this.pt[ptNum-1].y;
            let orgLen =  Math.sqrt(orgdx*orgdx + orgdy*orgdy);
            this.pt[ptNum].x = mx;
            this.pt[ptNum].y = my;
            if ( G1flg == 1 ) {
                let dx = this.pt[ptNum-1].x - this.pt[ptNum].x;
                let dy = this.pt[ptNum-1].y - this.pt[ptNum].y;
                let len =  Math.sqrt(dx*dx + dy*dy);
                if ( generatingPt == ptNum ) {
                    orgLen = len;   // when generating a curve, orgLen should be the same with len.
                }
                this.pt[ptNum-2].x = this.pt[ptNum-1].x + dx / len * orgLen;
                this.pt[ptNum-2].y = this.pt[ptNum-1].y + dy / len * orgLen;
            }    
        }
    }
    ConvertToFloat32Array(points) {
        const length = points.length;
        const floatArray = new Float32Array(length * 2);   
        for (let i = 0; i < length; i++) {
            floatArray[i * 2] = points[i].x;     
            floatArray[i * 2 + 1] = points[i].y; 
        }
        return floatArray;    
    }
    ConvertToFloat32ArrayForLines(points) {
        const length = points.length/3;
        const floatArray = new Float32Array(length * 2 *2);   
        for (let i = 0; i < length; i++) {
            floatArray[i * 2] = points[i].x;     
            floatArray[i * 2 + 1] = points[i].y; 
        }
        return floatArray;    
    }
    ComputeCubicBezier(t, j) {
        let c0 = (1-t)*(1-t)*(1-t);
        let c1 =  3*(1-t)*(1-t)*t;
        let c2 = 3*(1-t)*t*t;
        let c3 = t * t * t;
        let px = c0 * this.pt[j].x + c1 * this.pt[j+1].x +
                c2 * this.pt[j+2].x + c3 * this.pt[j+3].x;
        let py = c0 * this.pt[j+0].y + c1 * this.pt[j+1].y +
                c2 * this.pt[j+2].y + c3 * this.pt[j+3].y;
        return ({x: px, y: py});
    }
    ComputeFirstDerivative(t, j) {
        let p0x = 3 * (this.pt[j+1].x - this.pt[j].x);
        let p0y = 3 * (this.pt[j+1].y - this.pt[j].y);
        let p1x = 3 * (this.pt[j+2].x - this.pt[j+1].x);
        let p1y = 3 * (this.pt[j+2].y - this.pt[j+1].y);
        let p2x = 3 * (this.pt[j+3].x - this.pt[j+2].x);
        let p2y = 3 * (this.pt[j+3].y - this.pt[j+2].y);
        let c0 = (1-t)*(1-t);
        let c1 = 2 * (1-t) * t;
        let c2 = t * t;
        let px = c0 * p0x + c1 * p1x + c2 * p2x;
        let py = c0 * p0y + c1 * p1y + c2 * p2y;
        return ({x: px, y: py});
    }
    ComputeSecondDerivative(t, j) {
        let p0x = 6 * (this.pt[j+2].x - 2 * this.pt[j+1].x + this.pt[j].x);
        let p0y = 6 * (this.pt[j+2].y - 2 * this.pt[j+1].y + this.pt[j].y);
        let p1x = 6 * (this.pt[j+3].x - 2 * this.pt[j+2].x + this.pt[j+1].x);
        let p1y = 6 * (this.pt[j+3].y - 2 * this.pt[j+2].y + this.pt[j+1].y);
        let px = (1-t) * p0x + t * p1x;
        let py = (1-t) * p0y + t * p1y;
        return ({x: px, y: py});
    }    
    ComputeCombPoints(t, j, pt) {
        let pt1 = this.ComputeFirstDerivative(t, j);
        let pt1Norm = Math.sqrt(pt1.x * pt1.x + pt1.y * pt1.y);
        let normX = pt1.y / pt1Norm;
        let normY = -pt1.x / pt1Norm;
        let pt2 = this.ComputeSecondDerivative(t, j);
        let kappa = (pt1.x * pt2.y - pt1.y * pt2.x) / Math.pow((pt1.x*pt1.x + pt1.y*pt1.y), 3./2.);
        let cx = pt.x + combScale * kappa * normX;
        let cy = pt.y + combScale * kappa * normY;
        return ({x: cx, y: cy});
    }
    DrawCurve() {
        let modelviewMatrix = mat4.create();
        let projectionMatrix = mat4.create();
        mat4.ortho(projectionMatrix, lxWin, rxWin, byWin, tyWin, -1, 1);

        let idx = curveSG.indexOf(this);
        if ( showCMRegion && idx == currentCurveSG && (selectedPt != -1 || (generatingPt % 3) == 2)) {
            let slctdPt = ((generatingPt % 3) == 2 ? generatingPt - 2 : selectedPt);
            let movingPt = (slctdPt -1) % 3;
            if ( slctdPt == this.pt.length -2 ) {
                movingPt = 3;
            }
            let endRegP = 0;
            if ( slctdPt < 3 ) 
                endRegP = 1;
            else if ( slctdPt >= (this.pt.length - 3) ) 
                endRegP = 2;
            let sPtStart = slctdPt - movingPt;
            if ( slctdPt == 0 || slctdPt == (this.pt.length - 1) ) {
                movingPt = -1;
            }
            let sPtStart2;
            if ( movingPt < 2 ) {
                if ( sPtStart >= 4 ) {
                    sPtStart2 = sPtStart;
                    sPtStart = sPtStart2 - 3;
                }
                else {
                    sPtStart2 = sPtStart;
                }
            }
            else {
                sPtStart2 = sPtStart + 3;
                if ( sPtStart2 > (this.pt.length-5) ) sPtStart2 -= 3;
            }
            // console.log("movingPt ", movingPt, " slctdPt ", slctdPt, "pt.length", this.pt.length);
            // console.log("sPtStart-1", sPtStart);
            // console.log("sPtStart-2", sPtStart2);
            // console.log("endRegP = ", endRegP)


            if ( movingPt != -1 ) {

                gl.useProgram(glProgramInfo2.program);
                gl.uniformMatrix4fv(glProgramInfo2.uniformLocations.modelview, false, modelviewMatrix);
                gl.uniformMatrix4fv(glProgramInfo2.uniformLocations.projection, false, projectionMatrix);
                gl.uniform1i(glProgramInfo2.uniformLocations.movingPT, movingPt);
                gl.uniform1i(glProgramInfo2.uniformLocations.endRegP, endRegP);

                // control points for the first curve
                const floatArray = new Float32Array(4 * 2);
                for(let i = 0; i < 4; i++) {
                    floatArray[i*2] = this.pt[sPtStart+i].x;
                    floatArray[i*2+1] = this.pt[sPtStart+i].y;
                }
                gl.uniform2fv(glProgramInfo2.uniformLocations.PT, floatArray);

                // control points for the second curve
                for(let i = 0; i < 4; i++) {
                    floatArray[i*2] = this.pt[sPtStart2+i].x;
                    floatArray[i*2+1] = this.pt[sPtStart2+i].y;
                }
                gl.uniform2fv(glProgramInfo2.uniformLocations.PT2, floatArray);


                let buffer2 = gl.createBuffer();
                if (!buffer2) {
                    console.log("Failed to create the buffer2 object");
                    return -1;
                }
                
                // Draw an rectangle
                floatArray[0] = lxWin;
                floatArray[1] = byWin;
                floatArray[2] = rxWin;
                floatArray[3] = byWin;
                floatArray[4] = lxWin;
                floatArray[5] = tyWin;
                floatArray[6] = rxWin;
                floatArray[7] = tyWin;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
                gl.bufferData(gl.ARRAY_BUFFER, floatArray, gl.STATIC_DRAW);
                gl.vertexAttribPointer(glProgramInfo2.attribLocations.glPos, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(glProgramInfo2.attribLocations.glPos);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
        }



        gl.useProgram(glProgramInfo.program);
        gl.uniformMatrix4fv(glProgramInfo.uniformLocations.modelview, false, modelviewMatrix);
        gl.uniformMatrix4fv(glProgramInfo.uniformLocations.projection, false, projectionMatrix);

        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
            console.error("WebGL Error:", error);
        }
    
        let buffer = gl.createBuffer();
        if (!buffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }

        if ( showControlPolygon ) {
            // Draw the control points
            gl.uniform4f(glProgramInfo.uniformLocations.fcolor, 0, 0, 0, 1);   // why error?
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            let ptFloat32Array = this.ConvertToFloat32Array(this.pt);
            gl.bufferData(gl.ARRAY_BUFFER, ptFloat32Array, gl.STATIC_DRAW);
            gl.vertexAttribPointer(glProgramInfo.attribLocations.glPos, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(glProgramInfo.attribLocations.glPos);
            gl.drawArrays(gl.POINTS, 0, this.pt.length);

            if ( idx == currentCurveSG && selectedPt != -1 ) {
                gl.uniform4f(glProgramInfo.uniformLocations.fcolor, 0.8, 0.2, 0.2, 1); 
                let spt = selectedPt - (selectedPt % 3);
                gl.drawArrays(gl.POINTS, spt, 3);
            }
     
            // Draw the control lines
            gl.uniform4f(glProgramInfo.uniformLocations.fcolor, 0.7, 0.7, 0.7, 1); 
            let lLen = this.pt.length / 3;
            for(let i = 0; i < lLen; i++) {
                gl.drawArrays(gl.LINE_STRIP, i*3, 3);
            }
        }

 
        // Draw the curve
        const curvePointNum = 200;
        gl.uniform4f(glProgramInfo.uniformLocations.fcolor, 0.0, 0.0, 0.0, 1);
        if ( this.pt.length > 5 ) {
            // const bez = new Bezier();
            let cNum = (this.pt.length - 3) / 3;
            let curvePt = [];
            let combPt = [];
            for(let i = 0; i < cNum; i++) {
                    let j = i * 3+1;
                    // curvePt.length = 0;
                    for(let k = 0; k < curvePointNum; k++) {
                        let t = 1.0 / (curvePointNum - 1) * k;
                        let crvPt = this.ComputeCubicBezier(t, j);
                        curvePt.push(crvPt);
                        if ( showComb ) {
                            let cPt = this.ComputeCombPoints(t, j, crvPt);
                            combPt.push(cPt);
                        }
                    }
            }
            let curvePtFloat32Array = this.ConvertToFloat32Array(curvePt);
            gl.bufferData(gl.ARRAY_BUFFER, curvePtFloat32Array, gl.STATIC_DRAW);
            gl.vertexAttribPointer(glProgramInfo.attribLocations.glPos, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(glProgramInfo.attribLocations.glPos);
            gl.drawArrays(gl.LINE_STRIP, 0, curvePt.length);
            if ( showComb ) {
                gl.uniform4f(glProgramInfo.uniformLocations.fcolor, 0.7, 0.7, 0.7, 1); 
                let combPtFloat32Array = this.ConvertToFloat32Array(combPt);
                gl.bufferData(gl.ARRAY_BUFFER, combPtFloat32Array, gl.STATIC_DRAW);
                gl.vertexAttribPointer(glProgramInfo.attribLocations.glPos, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(glProgramInfo.attribLocations.glPos);
                gl.drawArrays(gl.LINE_STRIP, 0, combPt.length);
                
                for(let i = 0; i < curvePt.length/curvePointNum; i++) {
                    let combPt2 = [];
                    for(let j = 0; j < curvePointNum; j += (curvePointNum/10) ) {
                        let k = i * curvePointNum + j;
                        combPt2.push(curvePt[k]);
                        combPt2.push(combPt[k]);
                    }
                    let m = (i+1) * curvePointNum - 1;
                    combPt2.push(curvePt[m]);
                    combPt2.push(combPt[m]);
                    let combPt2Float32Array = this.ConvertToFloat32Array(combPt2);
                    gl.bufferData(gl.ARRAY_BUFFER, combPt2Float32Array, gl.STATIC_DRAW);
                    gl.vertexAttribPointer(glProgramInfo.attribLocations.glPos, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(glProgramInfo.attribLocations.glPos);
                    gl.drawArrays(gl.LINES, 0, combPt2.length);
                }
            }
        }
    }
}



        