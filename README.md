ThreePiece.js
====
Easy WebGL Interface Library with Three.js

##Example
http://aikelab.net/threepiece/

##Description
ThreePiece.js is a wrapper of Three.js. It provides very concise interface to draw 3DCG objects.

##How To Use
load script with Three.js

    <script type="text/javascript" src="three.min.js"></script>
    <script type="text/javascript" src="ThreePiece.js"></script>

instantiation and draw objects defined in json using eval() method

    var t = new ThreePiece();
    t.eval({obj:"box"});

another example:

    var t = new ThreePiece("draw", 700, 500);
    var data = [
        {obj:"ground"},
        {obj:"box",      x:-3, y:0,   col:0x0000FF},
        {obj:"sphere",   x: 0, y:0,   col:0x0088FF},
        {obj:"plane",    x: 3, y:0,   col:0x00FF88},
        {obj:"line",     x:-3, y:1.5, col:0x00FF00},
        {obj:"circle",   x: 0, y:1.5, col:0x88FF00},
        {obj:"cylinder", x: 3, y:1.5, col:0xFF8800},
        {obj:"extrude",  x: 0, y:2.5, col:0xFF0000}
    ];
    t.eval(data);

---

##Method
|name|description|
|:--:|:--|
|ThreePiece(id, width, height)|constuctor|
|eval(json)|draw objects defined in json|
|obj(name)|get a object by name|
|rotate(speed)|start rotate animation|
|define(name, json)|define original object|
  
##Hook
|name|description|
|:--:|:--|
|hook|function hook of drawing loop|
  
---

##Properties of Object
###Line
|category|property name|
|:--:|:--|
|start point|x, y, z|
|end point|tx, ty, tz|
|size|linewidth, scale|
|rotation|rx, ry, rz|
|material|col, tex|
|name|object name|

###Plane
|category|property name|
|:--:|:--|
|position|x, y, z|
|size|w, h, scale|
|rotation|rx, ry, rz|
|material|col, tex|
|name|object name|

###Circle
|category|property name|
|:--:|:--|
|position|x, y, z|
|size|w, scale|
|segments|segments|
|rotation|rx, ry, rz|
|material|col, tex|
|name|object name|

###Box
|category|property name|
|:--:|:--|
|position|x, y, z|
|size|w, h, d, scale|
|rotation|rx, ry, rz|
|material|col, tex|
|name|object name|

###Sphere
|category|property name|
|:--:|:--|
|position|x, y, z|
|size|w, scale|
|segments|segments|
|rotation|rx, ry, rz|
|material|col, tex|
|name|object name|

###Cylinder
|category|property name|
|:--:|:--|
|position|x, y, z|
|size|h, radiustop, radiusbottom, scale|
|segments|segments|
|rotation|rx, ry, rz|
|material|col, tex|
|name|object name|

###Extrude
|category|property name|
|:--:|:--|
|position|x, y, z|
|size|d, scale|
|shape|shape|
|rotation|rx, ry, rz|
|material|col, tex|
|name|object name|

###Group
|category|property name|
|:--:|:--|
|position|x, y, z|
|size|scale|
|rotation|rx, ry, rz|
|name|object name|

###PerspectiveCamera (Camera)
|category|property name|
|:--:|:--|
|position|x, y, z|
|point of view|tx, ty, tz|
|rotation|rx, ry, rz|
|field of view|fov|
|name|object name (default name is "camera")|

###DirectionalLight
|category|property name|
|:--:|:--|
|position|x, y, z|
|target position|tx, ty, tz|
|color|col|
|intensity|intensity|
|name|object name|

###SpotLight
|category|property name|
|:--:|:--|
|position|x, y, z|
|target position|tx, ty, tz|
|color|col|
|intensity|intensity|
|distance|distance|
|angle|angle|
|exponent|exponent|
|name|object name|

###HemisphereLight
|category|property name|
|:--:|:--|
|color|col|
|intensity|intensity|
|name|object name|

###AmbientLight
|category|property name|
|:--:|:--|
|color|col|
|name|object name|

---

##Credit
ThreePiece.js is licenced under MIT License. Copyright 2014, aike (@aike1000)
