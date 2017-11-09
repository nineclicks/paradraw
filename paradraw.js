var body = $(document.body);
var canvas = null;
var mainCtx = null;
var gx, gy
var zoom        = 1.0;
var gridSpacing = 100;
var subDiv      = 5;
var gridDivider = 1.0;
var gridDark    = "#99f";
var gridLight   = "#99f";
var unit        = 10;

var axisWeight = 3;
var gridWeight = 1.5;
var subWeight  = 0.5;

var getTranslatedCoords = function(x, y) {
  var x = (x - gx) / unit * zoom;  
  var y = (y - gy) / unit * zoom;  
  return [x, -y];
}

var mouse = {
  "mode" :   "none",
  "startX" : 0,
  "startY" : 0
};

var resizeCanvas = function() {
  canvas[0].width = window.innerWidth - 10;
  canvas[0].height = window.innerHeight - 10;
  drawGrid(mainCtx);
}

var drawGrid = function(ctx) {
  ctx.clear();
  var gridDivPx = gridSpacing / subDiv / zoom * gridDivider;
  var xOffset = gx % gridDivPx;
  var xStart  = Math.ceil(-gx / gridDivPx);
  var yOffset = gy % gridDivPx;
  var yStart  = Math.ceil(-gy / gridDivPx);

  for (var i = 0; i * gridDivPx < canvas[0].width; i++) {
    var div = xStart + i;
    var weight = 1;
    var x = xOffset + i * gridDivPx;
    if (div == 0) {
      weight = axisWeight;
    } else if (div % subDiv == 0) {
      weight = gridWeight;
    } else {
      weight = subWeight;
    }
    ctx.line(x,0,x,ctx.canvas.height,gridLight,weight);
  }

  for (var i = 0; i * gridDivPx < canvas[0].height; i++) {
    var div = yStart + i;
    var weight = 1;
    var y = yOffset + i * gridDivPx;
    if (div == 0) {
      weight = axisWeight;
    } else if (div % subDiv == 0) {
      weight = gridWeight;
    } else {
      weight = subWeight;
    }
    ctx.line(0,y,ctx.canvas.width,y,gridLight,weight);
  }
}

var canvasMouse = function(e) {
  console.log(getTranslatedCoords(e.pageX, e.pageY));
  if (e.buttons == 0) {
    canvasUp();
    return;
  }
  if (mouse.mode == "scroll") {
    gx = e.pageX - mouse.startX;
    gy = e.pageY - mouse.startY;
    drawGrid(mainCtx);
  } else if (mouse.mode == "zoom") {
    var zChange = mouse.startY - e.pageY;
    mouse.startY = e.pageY;
    changeZoom(zChange);
  }
}

var vAdd = function(v1, v2) {
  out = [];
  for (var i = 0; i < v1.length || i < v2.length; i++) {
    if (i >= v1.length) v1[i] = 0;
    if (i >= v2.length) v2[i] = 0;
    out[i] = v1[i] + v2[i]; 
  }
  return out;
}

var vSub = function(v1, v2) {
  out = [];
  for (var i = 0; i < v1.length || i < v2.length; i++) {
    if (i >= v1.length) v1[i] = 0;
    if (i >= v2.length) v2[i] = 0;
    out[i] = v1[i] - v2[i]; 
  }
  return out;
}

var vMult = function(v1, v2) {
  out = [];
  if (Array.isArray(v2)) {
    for (var i = 0; i < v1.length || i < v2.length; i++) {
      if (i >= v1.length) v1[i] = 0;
      if (i >= v2.length) v2[i] = 0;
      out[i] = v1[i] * v2[i]; 
    }
  } else {
    for (var i = 0; i < v1.length; i++) {
      out[i] = v1[i] * v2; 
    }
  }
  return out;
}

var vDiv = function(v1, v2) {
  out = [];
  if (Array.isArray(v2)) {
    for (var i = 0; i < v1.length || i < v2.length; i++) {
      if (i >= v1.length) v1[i] = 0;
      if (i >= v2.length) v2[i] = 0;
      out[i] = v1[i] / v2[i]; 
    }
  } else {
    for (var i = 0; i < v1.length; i++) {
      out[i] = v1[i] / v2; 
    }
  }
  return out;
}

console.log(vDiv([2,4,6],2));

var changeZoom = function(change, x, y) {
  if (x == null || y == null) {
    x = 0;
    y = 0;
  }
  currentGraphCoords = getTranslatedCoords(x, y);
  currentPixelCoords = [x, y];
  zoom *= (1 + (change / 100.0));
  gridDivider = 1.0;
  while (gridSpacing / subDiv / zoom * gridDivider < 10.0) {
    gridDivider *= 10;
  }
  newGraphCoords = getTranslatedCoords(x, y);
  graphCoordDiff = vSub(currentGraphCoords, newGraphCoords);
  graphCoordDiffScaled = vMult(graphCoordDiff, unit / zoom);
  gx = gx - graphCoordDiffScaled[0];
  gy = gy + graphCoordDiffScaled[1];
  drawGrid(mainCtx);
}

var canvasDown = function(e) {
  if (e.which == 2 || e.button == 4 || e.ctrlKey) {
    mouse.startX = e.pageX - gx;
    mouse.startY = e.pageY - gy;
    mouse.mode = "scroll";
  } else if (e.shiftKey) {
    mouse.startY = e.pageY;
    mouse.mode = "zoom";
  }
}

var canvasUp = function(e) {
  mouse.mode = "none";
}

var wheel = function(e) {
  changeZoom(-e.wheelDelta / 10.0, e.x, e.y);

}

var injectCanvas = function() {
  canvas = $('<canvas id="canvas" class="mainCanvas"/>');
  canvas.mousemove(canvasMouse);
  canvas.mousedown(canvasDown);
  canvas.mouseup(canvasUp);
  canvas[0].addEventListener('mousewheel', wheel, false);
  mainCtx = canvas[0].getContext("2d");
  resizeCanvas();
  gx = canvas[0].width  / 2;
  gy = canvas[0].height / 2;
  body.append(canvas);
  drawGrid(mainCtx);
}

CanvasRenderingContext2D.prototype.line = function(x1,y1,x2,y2,color,weight) {
  if (weight != null) {
    this.lineWidth=weight;
  }
  if (color != null) {
    this.strokeStyle=color;
  }
  this.beginPath();
  this.moveTo(Math.round(x1),Math.round(y1));
  this.lineTo(Math.round(x2),Math.round(y2));
  this.stroke();
}

CanvasRenderingContext2D.prototype.clear = function(color) {
  if (color == null) {
    color = "white";
  }
  this.fillStyle = "#fff";
  this.fillRect(0, 0, this.canvas.width, this.canvas.height);
}


CanvasRenderingContext2D.prototype.setStyle = function(color,weight) {
  this.lineWidth=weight;
  this.strokeStyle=color;
}

$( document ).ready(function() {
  injectCanvas();
});

$( window ).on('resize', resizeCanvas);
