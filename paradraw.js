var body = $(document.body);
var canvas = null;
var mainCtx = null;
var gx, gy, zoom, gridSpacing;
var gridCo = "#bbf";

var resizeCanvas = function() {
  canvas[0].width = window.innerWidth - 10;
  canvas[0].height = window.innerHeight - 10;
  mainCtx.fillStyle = "#fff";
  mainCtx.fillRect(0, 0, canvas[0].width, canvas[0].height);
}

var drawGrid = function(ctx) {
  var xOff = gx % gridSpacing;
  var yOff = gy % gridSpacing;
  var xNum = Math.ceil(ctx.canvas.width  / gridSpacing);
  var yNum = Math.ceil(ctx.canvas.height / gridSpacing);
  ctx.setStyle(gridCo, 1);
  for (var i = 0; i < xNum; i++) {
    var x = xOff + i * gridSpacing; 
    if (x == gx) {
      ctx.line(x,0,x,ctx.canvas.height,gridCo,3);
      ctx.setStyle(gridCo, 1);
    } else {
      ctx.line(x,0,x,ctx.canvas.height);
    }
  }
  for (var i = 0; i < yNum; i++) {
    var y = yOff + i * gridSpacing; 
    if (y == gy) {
      ctx.line(0,y,ctx.canvas.width,y,gridCo,3);
      ctx.setStyle(gridCo, 1);
    } else {
      ctx.line(x,0,x,ctx.canvas.height);
      ctx.line(0,y,ctx.canvas.width,y);
    }
  }
}

var canvasMouse = function(event) {
  gx = event.pageX;
  gy = event.pageY;
  mainCtx.clear();
  drawGrid(mainCtx);
}

var injectCanvas = function() {
  canvas = $('<canvas id="canvas" class="mainCanvas"/>');
  canvas.mousemove(canvasMouse);
  mainCtx = canvas[0].getContext("2d");
  resizeCanvas();
  gx = canvas[0].width  / 2;
  gy = canvas[0].height / 2;
  zoom = 1.0;
  gridSpacing = 25;
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
  this.moveTo(x1,y1);
  this.lineTo(x2,y2);
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