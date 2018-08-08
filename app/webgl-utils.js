// Global default vars
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var shaderProgram;
var gl;


function initGL(canvas, entity) {
	try {
		entity.gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true });
		entity.gl.viewportWidth = canvas.width; 
		entity.gl.viewportHeight = canvas.height;
	} 
	catch (e) {
	}
	if (!entity.gl) {
		alert("Could not initialise WebGL");
	}
}

var myVertexShaderSrc =         
	"attribute vec3 aVertexPosition; " +
	"uniform mat4 uMVMatrix; " + 
	"uniform mat4 uPMatrix; " + 
	"varying float xx, yy; " + 
	"void main(void) { " + 
	"	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 2.0); " + 
	"	xx = clamp(aVertexPosition.x,0.0,1.0); " + 
	"	yy = clamp(aVertexPosition.y,0.0,1.0); " + 
	"}";	

var myFragmentShaderSrc =         
	"precision mediump float; " + 
	"varying vec4 vColor; " + 
	"varying float xx, yy; " + 
	"float divideprotected(in float a, in float b) { if (b != 0.0) return a / b; else return 0.0; } " + 
	"float sqr(in float a) { return pow(a, 2.0); } " + 
	"void main(void) { " + 
	"	float x = xx * 10.0, y = yy * 10.0; " + 
	"	float v = VALUE; " +
	"	gl_FragColor = vec4(v, v, v, 1.0); " + 
	"}";

var noiseShaderFunction =
	"vec3 lerp(vec4 a, vec4 b, float s) { return vec3(a + (b - a) * s); } " + 
	"" + 
	"float noise(vec3 x) { " + 
	"   vec3 p = floor(x); " + 
	"   vec3 f = frac(x); " + 
	"   f = f*f*(3.0-2.0*f); " + 
	"   float n = p.x + p.y*57.0 + 113.0*p.z; " + 
	"   return lerp(lerp(lerp( hash(n+0.0), hash(n+1.0),f.x), lerp( hash(n+57.0), hash(n+58.0),f.x),f.y), lerp(lerp( hash(n+113.0), hash(n+114.0),f.x), lerp( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z); " + 
	"} " + 
	"" + 
	"vec3 vecnoise(vec3 x) { float v = noise(x); return vec3(v, v, v); }; ";

var diffuseShaderFunction =
	"vec3 vecdiffuse(vec3 a, vec3 b, vec3 c) { vec3(mix(a.x, b.x, c.x), mix(a.y, b.y, c.y), mix(a.z, b.z, c.z)); }; ";

var globalScale = 10.0;
var globalXRef = 0.0;
var globalYRef = 0.0;

// RGB
var myFragmentShaderRGBSrc =
	"precision mediump float; " + 
	"varying float xx; " + 
	"varying float yy; " + 
	// #ADDED
	"uniform float time; " + 
	"uniform float va; " + 
	"uniform float vb; " + 
	"uniform float vc; " + 
	"uniform float vd; " + 	
	"" + 
	"vec3 veccos(in vec3 a) { return vec3(cos(a.x), cos(a.y), cos(a.z)); } " + 
	"vec3 vecsin(in vec3 a) { return vec3(sin(a.x), sin(a.y), sin(a.z)); } " + 
	"vec3 vectan(in vec3 a) { return vec3(tan(a.x), tan(a.y), tan(a.z)); } " + 
	"vec3 vecabs(in vec3 a) { return vec3(abs(a.x), abs(a.y), abs(a.z)); } " + 
	"vec3 vecsqr(in vec3 a) { return vec3(a.x * a.x, a.y * a.y, a.z * a.z); } " + 
	"" + 
	"vec3 vecadd(in vec3 a, in vec3 b) { return vec3(a.x + b.x, a.y + b.y, a.z + b.z); } " + 
	"vec3 vecsubstract(in vec3 a, in vec3 b) { return vec3(a.x - b.x, a.y - b.y, a.z - b.z); } " + 
	"vec3 vecmultiply(in vec3 a, in vec3 b) { return vec3(a.x * b.x, a.y * b.y, a.z * b.z); } " + 
	"vec3 vecdiv(in vec3 a, in vec3 b) { return vec3(a.x / b.x, a.y / b.y, a.z / b.z); } " + 
	"vec3 createvector(in float a, in float b, in float c) { return vec3(a, b, c); } " + 
	"vec3 veccolormap(in vec3 a, in vec3 b, in vec3 c) { return createvector(a.x / 10.0, b.x / 10.0, c.x / 10.0); } " + 
	"" + 
	"void main(void) { " + 
	" 	float scale = VALUESCALE; " + 
	"	float x = VALUEXREF + xx * scale, y = VALUEYREF + yy * scale; " + 	
	"	vec3 v = VALUE; " +
	"	gl_FragColor = vec4(v.x, v.y, v.z, 1.0); " + 
	"}";
	
function initShadersRGB(entity) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, myVertexShaderSrc);
	gl.compileShader(vertexShader);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	var result = myFragmentShaderRGBSrc;
	result = result.replace("VALUESCALE", globalScale.toFixed(2).toString());
	result = result.replace("VALUEXREF", globalXRef.toFixed(2).toString());
	result = result.replace("VALUEYREF", globalYRef.toFixed(2).toString());
	result = result.replace("VALUE", entity.toLowerCase());
	gl.shaderSource(fragmentShader, result);
	gl.compileShader(fragmentShader);

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders for " + entity);
	}

	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

// RGB
var myFragmentShaderRGBCompositeSrc =
	"precision mediump float; " + 
	"varying float xx; " + 
	"varying float yy; " + 
	"" + 
	"vec3 veccos(in vec3 a) { return vec3(cos(a.x), cos(a.y), cos(a.z)); } " + 
	"vec3 vecsin(in vec3 a) { return vec3(sin(a.x), sin(a.y), sin(a.z)); } " + 
	"vec3 vectan(in vec3 a) { return vec3(tan(a.x), tan(a.y), tan(a.z)); } " + 
	"vec3 vecabs(in vec3 a) { return vec3(abs(a.x), abs(a.y), abs(a.z)); } " + 
	"vec3 vecsqr(in vec3 a) { return vec3(a.x * a.x, a.y * a.y, a.z * a.z); } " + 
	"" + 
	"vec3 vecadd(in vec3 a, in vec3 b) { return vec3(a.x + b.x, a.y + b.y, a.z + b.z); } " + 
	"vec3 vecsubstract(in vec3 a, in vec3 b) { return vec3(a.x - b.x, a.y - b.y, a.z - b.z); } " + 
	"vec3 vecmultiply(in vec3 a, in vec3 b) { return vec3(a.x * b.x, a.y * b.y, a.z * b.z); } " + 
	"vec3 vecdiv(in vec3 a, in vec3 b) { return vec3(a.x / b.x, a.y / b.y, a.z / b.z); } " + 
	"vec3 createvector(in float a, in float b, in float c) { return vec3(a, b, c); } " + 
	"vec3 veccolormap(in vec3 a, in vec3 b, in vec3 c) { return createvector(a.x / 10.0, b.x / 10.0, c.x / 10.0); } " + 
	"" + 
	"vec3 vecfa(in vec3 a, in vec3 b) { float x = a.x, y = b.x; return #VECFA#; } " + 
	"vec3 vecfb(in vec3 a, in vec3 b) { float x = a.x, y = b.x; return #VECFB#; } " + 
	"vec3 vecfc(in vec3 a, in vec3 b) { float x = a.x, y = b.x; return #VECFC#; }" + 
	"" + 
	"void main(void) { " + 
	"	float x = xx * 10.0, y = yy * 10.0; " + 	
	"	vec3 v = VALUE; " +
	"	gl_FragColor = vec4(v.x, v.y, v.z, 1.0); " + 
	"}";
	
function initShadersRGBComposite(entity, a, b, c) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, myVertexShaderSrc);
	gl.compileShader(vertexShader);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	var result = myFragmentShaderRGBCompositeSrc.replace("VALUE", entity.toLowerCase());
	result = result.replace("#VECFA#", a);
	result = result.replace("#VECFB#", b);
	result = result.replace("#VECFC#", c);	
	gl.shaderSource(fragmentShader, result);
	gl.compileShader(fragmentShader);

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders for " + entity);
	}

	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

function setMatrixUniforms(entity) {
	entity.gl.uniformMatrix4fv(entity.shaderProgram.pMatrixUniform, false, pMatrix);
	entity.gl.uniformMatrix4fv(entity.shaderProgram.mvMatrixUniform, false, mvMatrix);
}

// RGB animated
var myVertexShaderRGBAnimatedSrc = 
	"attribute vec3 aVertexPosition; " +
	"uniform mat4 uMVMatrix; " + 
	"uniform mat4 uPMatrix; " + 
	"varying float xx, yy; " + 
	" " + 
	"void main(void) { " + 
	"	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 2.0); " + 
	"	xx = clamp(aVertexPosition.x,0.0,1.0); " + 
	"	yy = clamp(aVertexPosition.y,0.0,1.0); " + 
	"}";

var myFragmentShaderRGBAnimateSrc =
	"precision mediump float; " + 
	"uniform float time; " + 
	"varying float xx; " + 
	"varying float yy; " + 
	"uniform float va; " + 
	"uniform float vb; " + 
	"uniform float vc; " + 
	"uniform float vd; " + 	
	"" + 
	"vec3 veccos(in vec3 a) { return vec3(cos(a.x), cos(a.y), cos(a.z)); } " + 
	"vec3 vecsin(in vec3 a) { return vec3(sin(a.x), sin(a.y), sin(a.z)); } " + 
	"vec3 vectan(in vec3 a) { return vec3(tan(a.x), tan(a.y), tan(a.z)); } " + 
	"vec3 vecabs(in vec3 a) { return vec3(abs(a.x), abs(a.y), abs(a.z)); } " + 
	"vec3 vecsqr(in vec3 a) { return vec3(a.x * a.x, a.y * a.y, a.z * a.z); } " + 
	"" + 
	"vec3 vecadd(in vec3 a, in vec3 b) { return vec3(a.x + b.x, a.y + b.y, a.z + b.z); } " + 
	"vec3 vecsubstract(in vec3 a, in vec3 b) { return vec3(a.x - b.x, a.y - b.y, a.z - b.z); } " + 
	"vec3 vecmultiply(in vec3 a, in vec3 b) { return vec3(a.x * b.x, a.y * b.y, a.z * b.z); } " + 
	"vec3 vecdiv(in vec3 a, in vec3 b) { return vec3(a.x / b.x, a.y / b.y, a.z / b.z); } " + 
	"vec3 createvector(in float a, in float b, in float c) { return vec3(a, b, c); } " + 
	"vec3 veccolormap(in vec3 a, in vec3 b, in vec3 c) { return createvector(a.x / 10.0, b.x / 10.0, c.x / 10.0); } " + 
	"" + 
	"void main(void) { " + 
	"	float x = xx * 10.0, y = yy * 10.0; " + 	
	"	vec3 v = VALUE; " +
	"	gl_FragColor = vec4(v.x, v.y, v.z, 1.0); " + 
	"}";

	
function initShadersRGBAnimate(entity) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, myVertexShaderRGBAnimatedSrc);
	gl.compileShader(vertexShader);

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	var result = myFragmentShaderRGBAnimateSrc;
	result = result.replace("VALUESCALE", globalScale.toFixed(2).toString());
	result = result.replace("VALUEXREF", globalXRef.toFixed(2).toString());
	result = result.replace("VALUEYREF", globalYRef.toFixed(2).toString());
	result = result.replace("VALUE", entity.toLowerCase());
	gl.shaderSource(fragmentShader, result);
	gl.compileShader(fragmentShader);

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders for " + entity);
	}

	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

// RGB animated interpolation
var myVertexShaderRGBAnimatedInterpolateSrc = 
	"attribute vec3 aVertexPosition; " +
	"uniform mat4 uMVMatrix; " + 
	"uniform mat4 uPMatrix; " + 
	"varying float xx, yy; " + 
	" " + 
	"void main(void) { " + 
	"	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 2.0); " + 
	"	xx = clamp(aVertexPosition.x,0.0,1.0); " + 
	"	yy = clamp(aVertexPosition.y,0.0,1.0); " + 
	"}";
	
var myFragmentShaderRGBAnimateInterpolateSrc =
	"precision mediump float; " + 
	"varying float xx; " + 
	"varying float yy; " + 
	"uniform float indexA; " + 
	"uniform float indexB; " + 
	"uniform float aa; " + 
	"uniform float va; " + 
	"uniform float vb; " + 
	"uniform float vc; " + 
	"uniform float vd; " + 	
	"uniform float time; " + 
	"vec3 veccos(in vec3 a) { return vec3(cos(a.x), cos(a.y), cos(a.z)); } " + 
	"vec3 vecsin(in vec3 a) { return vec3(sin(a.x), sin(a.y), sin(a.z)); } " + 
	"vec3 vectan(in vec3 a) { return vec3(tan(a.x), tan(a.y), tan(a.z)); } " + 
	"vec3 vecabs(in vec3 a) { return vec3(abs(a.x), abs(a.y), abs(a.z)); } " + 
	"vec3 vecsqr(in vec3 a) { return vec3(a.x * a.x, a.y * a.y, a.z * a.z); } " + 
	"vec3 vecadd(in vec3 a, in vec3 b) { return vec3(a.x + b.x, a.y + b.y, a.z + b.z); } " + 
	"vec3 vecsubstract(in vec3 a, in vec3 b) { return vec3(a.x - b.x, a.y - b.y, a.z - b.z); } " + 
	"vec3 vecmultiply(in vec3 a, in vec3 b) { return vec3(a.x * b.x, a.y * b.y, a.z * b.z); } " + 
	"vec3 vecdiv(in vec3 a, in vec3 b) { return vec3(a.x / b.x, a.y / b.y, a.z / b.z); } " + 
	"vec3 createvector(in float a, in float b, in float c) { return vec3(a, b, c); } " + 
	"vec3 veccolormap(in vec3 a, in vec3 b, in vec3 c) { return createvector(a.x / 10.0, b.x / 10.0, c.x / 10.0); } " + 
	"void main(void) { " + 
	" 	float a = aa; " + 
	"	float x = xx * 10.0, y = yy * 10.0; " + 	
	"	vec3 vaa, vbb;" + 
	" FUNCIONES " + 
	"	gl_FragColor = vec4(vaa.x * a + vbb.x * (1.0 - a), vaa.y * a + vbb.y * (1.0 - a), vaa.z * a + vbb.z * (1.0 - a), 1.0); " + 
	"}";
	
function initShadersRGBInterpolatedAnimate(entity) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, myVertexShaderRGBAnimatedInterpolateSrc);
	gl.compileShader(vertexShader);

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	var funcionesCode = "if (false) {} ";
	for (var i=0; i< entity.length; i++)
		funcionesCode += " else if (indexA == " + i + ".0) { vaa = " + entity[i][0].toLowerCase() + "; } ";
	funcionesCode += " if (false) {} ";
	for (var i=0; i< entity.length; i++)
		funcionesCode += " else if (indexB == " + i + ".0) { vbb = " + entity[i][0].toLowerCase() + "; } ";
	source = myFragmentShaderRGBAnimateInterpolateSrc.replace("FUNCIONES", funcionesCode);
	
	gl.shaderSource(fragmentShader, source);
	gl.compileShader(fragmentShader);
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders for " + entity);
	}

	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}
		
function copyImageDataToHTML5Canvas(canvasID) {
	var c = document.getElementById(canvasID);
	var ctx = c.getContext("2d");
	var imgData=ctx.createImageData(c.width, c.height);
	var pixels = new Uint8Array(c.width * c.height * 4); // 320x240 RGBA image
	gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

	imgData.data = pixels;
	for (var i=0;i<imgData.data.length;i+=4) {
	  imgData.data[i+0]=pixels[i];
	  imgData.data[i+1]=pixels[i+1];
	  imgData.data[i+2]=255;//pixels[i+2];
	  imgData.data[i+3]=255;pixels[i+3];
	}
		
	ctx.putImageData(imgData,0,0);
}

// RGB vector sound
var myVertexShaderRGBAnimatedSoundSrc = 
	"attribute vec3 aVertexPosition; " +
	"uniform mat4 uMVMatrix; " + 
	"uniform mat4 uPMatrix; " + 
	"varying float xx, yy; " + 
	" " + 
	"void main(void) { " + 
	"	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 2.0); " + 
	"	xx = clamp(aVertexPosition.x,0.0,1.0); " + 
	"	yy = clamp(aVertexPosition.y,0.0,1.0); " + 
	"}";

var myFragmentShaderRGBAnimateSoundSrc =
	"precision mediump float; " + 
	"uniform float time; " + 
	"uniform float va; " + 
	"uniform float vb; " + 
	"uniform float vc; " + 
	"uniform float vd; " + 
	"varying vec4 vColor; " + 
	"varying float xx; " + 
	"varying float yy; " + 
	"vec3 veccos(in vec3 a) { return vec3(cos(a.x), cos(a.y), cos(a.z)); } " + 
	"vec3 vecsin(in vec3 a) { return vec3(sin(a.x), sin(a.y), sin(a.z)); } " + 
	"vec3 vectan(in vec3 a) { return vec3(tan(a.x), tan(a.y), tan(a.z)); } " + 
	"vec3 vecabs(in vec3 a) { return vec3(abs(a.x), abs(a.y), abs(a.z)); } " + 
	"vec3 vecsqr(in vec3 a) { return vec3(a.x * a.x, a.y * a.y, a.z * a.z); } " + 
	"vec3 vecadd(in vec3 a, in vec3 b) { return vec3(a.x + b.x, a.y + b.y, a.z + b.z); } " + 
	"vec3 vecsubstract(in vec3 a, in vec3 b) { return vec3(a.x - b.x, a.y - b.y, a.z - b.z); } " + 
	"vec3 vecmultiply(in vec3 a, in vec3 b) { return vec3(a.x * b.x, a.y * b.y, a.z * b.z); } " + 
	"vec3 vecdiv(in vec3 a, in vec3 b) { return vec3(a.x / b.x, a.y / b.y, a.z / b.z); } " + 
	"vec3 createvector(in float a, in float b, in float c) { return vec3(a, b, c); } " + 
	"vec3 veccolormap(in vec3 a, in vec3 b, in vec3 c) { return createvector(a.x / 10.0, b.x / 10.0, c.x / 10.0); } " + 
	"void main(void) { " + 
	"	float x = xx * 10.0, y = yy * 10.0; " + 	
	"	vec3 v = VALUE; " +
	"	gl_FragColor = vec4(v.x, v.y, v.z, 1.0); " + 
	"}";
	
function initShadersRGBAnimateSound(entity) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, myVertexShaderRGBAnimatedSrc);
	gl.compileShader(vertexShader);

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, myFragmentShaderRGBAnimateSoundSrc.replace("VALUE", entity.toLowerCase()));
	gl.compileShader(fragmentShader);

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders for " + entity);
	}

	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}