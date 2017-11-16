class Grid {
  constructor() {
    this.spacing = 100;
    this.subDiv = 5;
    this.gridDiv = 1;
    this.color = "#99f";
    this.axisWeight = 3;
    this.weight = 1.5;
    this.subWeight = 0.5;
  }
}

class Graph {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.zoom = 1.0;
    this.grid = new Grid();
    this.unit = 10;
  }

  changeZoom(change, x, y) {
    if (x == null || y == null) {
      x = 0;
      y = 0;
    }
    var currentGraphCoords = this.getTranslatedCoords(x, y);
    var currentPixelCoords = [x, y];
    this.zoom *= (1 + (change / 100.0));
    this.grid.gridDiv = 1.0;
    while (this.grid.spacing / this.grid.subDiv / this.zoom * this.grid.gridDiv < 10.0) {
      this.grid.gridDiv *= 10;
    }
    var newGraphCoords = this.getTranslatedCoords(x, y);
    var graphCoordDiff = vSub(currentGraphCoords, newGraphCoords);
    var graphCoordDiffScaled = vMult(graphCoordDiff, this.unit / this.zoom);
    this.x = this.x - graphCoordDiffScaled[0];
    this.y = this.y + graphCoordDiffScaled[1];
    this.draw();
  }

  draw() {
    this.ctx.clear();
    var griddivpx = this.grid.spacing / this.grid.subDiv / this.zoom * this.grid.gridDiv;
    var xoffset = this.x % griddivpx;
    var xstart  = Math.trunc(-this.x / griddivpx);
    var yoffset = this.y % griddivpx;
    var ystart  = Math.trunc(-this.y / griddivpx);

    for (var i = 0; i * griddivpx < this.ctx.canvas.width; i++) {
      var div = xstart + i;
      var weight = 1;
      var x = xoffset + i * griddivpx;
      if (div == 0) {
        weight = this.grid.axisWeight;
      } else if (div % this.grid.subDiv == 0) {
        weight = this.grid.weight;
      } else {
        weight = this.grid.subWeight;
      }
      this.ctx.line(x,0,x,this.ctx.canvas.height,this.grid.color,weight);
    }

    for (var i = 0; i * griddivpx < this.ctx.canvas.height; i++) {
      var div = ystart + i;
      var weight = 1;
      var y = yoffset + i * griddivpx;
      if (div == 0) {
        weight = this.grid.axisWeight;
      } else if (div % this.grid.subDiv == 0) {
        weight = this.grid.weight;
      } else {
        weight = this.grid.subWeight;
      }
      this.ctx.line(0,y,this.ctx.canvas.width,y,this.grid.color,weight);
    }
  }
  getTranslatedCoords(x, y) {
    var x = (x - this.x) / this.unit * this.zoom;
    var y = (y - this.y) / this.unit * this.zoom;
    return [x, -y];
  }

}
var graph = null;
var body = $(document.body);
var canvas = null;
var mainCtx = null;
var gx, gy

var mouse = {
  "mode" :   "none",
  "startX" : 0,
  "startY" : 0,
  "lastX" : 0,
  "lastY" : 0
};

var resizeCanvas = function() {
  canvas[0].width = window.innerWidth - 10;
  canvas[0].height = window.innerHeight - 10;
  if (graph) {
    graph.draw();
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

var canvasMove = function(e) {
  if (e.buttons == 0) {
    canvasUp();
    return;
  }
  if (mouse.mode == "scroll") {
    graph.x = e.pageX - mouse.startX;
    graph.y = e.pageY - mouse.startY;
    graph.draw();
  } else if (mouse.mode == "zoom") {
    var zChange = mouse.lastY - e.pageY;
    mouse.lastY = e.pageY;
    graph.changeZoom(zChange, mouse.startX, mouse.startY);
  }
}

var canvasDown = function(e) {
  if (e.which == 2 || e.button == 4 || e.ctrlKey) {
    mouse.startX = e.pageX - graph.x;
    mouse.startY = e.pageY - graph.y;
    mouse.mode = "scroll";
  } else if (e.shiftKey) {
    mouse.startX = e.pageX;
    mouse.startY = e.pageY;
    mouse.lastY = e.pageY;
    mouse.mode = "zoom";
  }
}

var canvasUp = function(e) {
  mouse.mode = "none";
}

var wheel = function(e) {
  graph.changeZoom(-e.wheelDelta / 10.0, e.x, e.y);

}

var injectCanvas = function() {
  canvas = $('<canvas id="canvas" class="mainCanvas"/>');
  canvas.mousemove(canvasMove);
  canvas.mousedown(canvasDown);
  canvas.mouseup(canvasUp);
  canvas[0].addEventListener('mousewheel', wheel, false);
  mainCtx = canvas[0].getContext("2d");
  resizeCanvas();
  gx = canvas[0].width  / 2;
  gy = canvas[0].height / 2;
  graph = new Graph(mainCtx, gx, gy);
  body.append(canvas);
  graph.draw();
  //drawGrid(mainCtx);
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
