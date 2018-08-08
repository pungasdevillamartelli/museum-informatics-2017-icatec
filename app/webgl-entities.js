
var globalStartTime = 0.0;
var globalTime = 0.0, globalVa = 0.0, globalVb = 0.0, globalVc = 0.0, globalVd = 0.0;
var deltaTime = 0.1;


function initBuffersRGB(entity) {
	var gl = entity.gl;
	entity.squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, entity.squareVertexPositionBuffer);
	var vertices = [
		 1.0,  1.0,  0.0,
		-1.0,  1.0,  0.0,
		 1.0, -1.0,  0.0,
		-1.0, -1.0,  0.0
	];	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	entity.squareVertexPositionBuffer.itemSize = 3;
	entity.squareVertexPositionBuffer.numItems = 4;
}

function drawEntityImageRGB (entity) { 
	globalVa = timerValue();
	var location = gl.getUniformLocation(shaderProgram, "va");
    gl.uniform1f(location, globalVa);	
	location = gl.getUniformLocation(shaderProgram, "vb");
    gl.uniform1f(location, globalVb);	
	location = gl.getUniformLocation(shaderProgram, "vc");
    gl.uniform1f(location, globalVc);	
	location = gl.getUniformLocation(shaderProgram, "vd");
	gl.uniform1f(location, globalVd);
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0.0, 0.0, -1.2]);
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms(entity);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

function resetTimer() {
	globalStartTime = Date.now();
}

function timerValue() {
	return (Date.now() - globalStartTime) / 1000.0;
}

function drawEntityImageRGBAnimate () {
	globalVa = timerValue();
	var location = gl.getUniformLocation(shaderProgram, "va");
    gl.uniform1f(location, globalVa);	
	location = gl.getUniformLocation(shaderProgram, "vb");
    gl.uniform1f(location, globalVb);	
	location = gl.getUniformLocation(shaderProgram, "vc");
    gl.uniform1f(location, globalVc);	
	location = gl.getUniformLocation(shaderProgram, "vd");
	gl.uniform1f(location, globalVd);
	location = gl.getUniformLocation(shaderProgram, "time");
    gl.uniform1f(location, timerValue());	
	
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0.0, 0.0, -1.2]);
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

/*
// RGB interpolated animation
function initWebGLRGBInterpolatedAnimate(canvas, entity) {
    var canvas = document.getElementById(canvas);
	var gl = entity.gl;
	initGL(canvas);
	initBuffersRGB();
	initShadersRGBInterpolatedAnimate(entity)	
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.disable(gl.DEPTH_TEST);
}

var timeFrame = 4.0;
var indexA = 0, indexB = 0;
var lastUpdate;

function initializeInterpolation(count) {
	indexA = Math.floor(Math.random() * count);
	updateInterpolationValues();
	setInterval(function () { updateInterpolationValues(count); }, 1000 * timeFrame);
}

function updateInterpolationValues(count) {	
	// random
	indexA = indexB;
	indexB = Math.floor(Math.random() * count);
	
	/*
	// ciclico
	indexA++;
	if (indexA > count - 1) indexA = 0;
	indexB = indexA + 1;
	if (indexB > count - 1) indexB = 0; */
	/*
	lastUpdate = timerValue();	
}

function drawEntityImageRGBInterpolatedAnimate (entity) {
	var valueAA = (timerValue() - lastUpdate) / timeFrame;

	var location = gl.getUniformLocation(shaderProgram, "indexA");
    gl.uniform1f(location, indexA);	
	location = gl.getUniformLocation(shaderProgram, "indexB");
    gl.uniform1f(location, indexB);	
	location = gl.getUniformLocation(shaderProgram, "aa");
    var aa = valueAA < 1.0 ? valueAA : 1.0;
	gl.uniform1f(location, 1.0 - aa);	
	
	drawEntityImageRGBAnimateSound(entity);
} */

resetTimer();