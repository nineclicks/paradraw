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

var axisWeight = 3;
var gridWeight = 1.5;
var subWeight  = 0.5;

var mouse = {
  "mode" :   "none",
  "startX" : 0,
  "startY" : 0
};

var resizeCanvas = function() {
  canvas[0].width = window.innerWidth - 10;
  canvas[0].height = window.innerHeight - 10;
  mainCtx.clear();
  drawGrid(mainCtx);
}

var drawGrid = function(ctx) {
  var gridDivPx = gridSpacing / subDiv / zoom * gridDivider;
  var xOffset = gx % gridDivPx;
  var xStart  = Math.ceil(-gx / gridDivPx);
  var yOffset = gy % gridDivPx;
  var yStart  = Math.ceil(-gy / gridDivPx);
  if (xStart > 0) xStart--;
  if (yStart > 0) yStart--;

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

var canvasMouse = function(event) {
  if (mouse.mode == "scroll") {
    gx = event.pageX - mouse.startX;
    gy = event.pageY - mouse.startY;
    mainCtx.clear();
    drawGrid(mainCtx);
  } else if (mouse.mode == "zoom") {
    var zChange = mouse.startY - event.pageY;
    mouse.startY = event.pageY;
    changeZoom(zChange);
  }
}

var changeZoom = function(change) {
  zoom *= (1 + (change / 100.0));
  gridDivider = 1.0;
  while (gridSpacing / subDiv / zoom * gridDivider < 10.0) {
    gridDivider *= 10;
  }
  console.log(gridDivider);
  mainCtx.clear();
  drawGrid(mainCtx);
}

var canvasDown = function(event) {
  if (event.ctrlKey) {
    mouse.startX = event.pageX - gx;
    mouse.startY = event.pageY - gy;
    mouse.mode = "scroll";
  } else if (event.shiftKey) {
    mouse.startY = event.pageY;
    mouse.mode = "zoom";
  }
}

var canvasUp = function(event) {
  mouse.mode = "none";
}

var injectCanvas = function() {
  canvas = $('<canvas id="canvas" class="mainCanvas"/>');
  canvas.mousemove(canvasMouse);
  canvas.mousedown(canvasDown);
  canvas.mouseup(canvasUp);
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
