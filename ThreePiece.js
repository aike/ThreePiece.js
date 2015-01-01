/*
 *
 * This program is licensed under the MIT License.
 * Copyright 2014, aike (@aike1000)
 *
 */
var ThreePiece = function(id, w, h) {
	this.width = this.set(w, 768);
	this.height = this.set(h, 576);

	this.id = id;
	this.hook = undefined;
	this.objs = {};
	this.texture = {};
	this.textureLoaded = 0;
	this.macro = {
		'light':{obj:'group', data:[{obj:'directionalLight'}, {obj:'hemisphereLight'}]},
		'camera':{obj:'perspectivecamera'},
		'ground':{obj: 'plane', w:1000, h:1000, y:-1, rx:Math.PI / -2, col:0x9999bb}
	}
	var grid = {obj:'group', data:[]};
	for (var i = 0; i <= 30; i++) {
		var j = i - 15;
		grid.data.push({obj:'line',x:j,y:-1,z:-50,tx:j,ty:-1,tz:50,col:0x00FF00});
		grid.data.push({obj:'line',x:-50,y:-1,z:j,tx:50,ty:-1,tz:j,col:0x00FF00});
	}
	this.macro['grid'] = grid;

	this.lightExist = false;
	this.cameraExist = false;

	this.init();
}

//
// eval() method can receive the following argument types
//   (1) node
//        {obj:"box"}
//   (2) array of node
//        [{obj:"box"}, {obj:"sphere"} ...]
//   (3) array of node with global properties
//        { x:0, y:0, z:-1, scale:1.5,
//	        data:[{obj:"box"}, {obj:"sphere"} ...]
//        }
ThreePiece.prototype.eval = function(arr_or_json) {
	var json;
	if (Array.isArray(arr_or_json)) {		// (2)
		json = {
			scale: 0.2,
			data: arr_or_json
		}
	} else if ('data' in arr_or_json) {		// (3)
		arr_or_json.scale = this.set(arr_or_json.scale, 0.2);
		json = arr_or_json;
	} else {								// (1)
		json = {
			scale: 0.2,
			data: [arr_or_json]
		}
	}
	var node = this.evalNodeGroup(json);
	this.objs['world'] = node;
	if (!this.lightExist) {
		node.add(this.evalNode(this.macro['light']));
	}
	if (!this.cameraExist) {
		this.evalNode(this.macro['camera']);
		this.scene.add(this.camera);
	}
	this.scene.add(node);
	this.show();
}

// eval node group
//   node group format:
//   {
//     name: (node name - optional),
//     data: [
//         { (node 0) }
//         { (node 1) }
//         { (node 2) }
//               :
//     ]
//   }
ThreePiece.prototype.evalNodeGroup = function(json) {
	json.x = this.set(json.x, 0);
	json.y = this.set(json.y, 0);
	json.z = this.set(json.z, 0);
	json.rx = this.set(json.rx, 0);
	json.ry = this.set(json.ry, 0);
	json.rz = this.set(json.rz, 0);
	json.scale = this.set(json.scale, 1);

	var arr = json.data;
	var node = new THREE.Object3D();
	node.position.set(json.x, json.y, json.z);
	node.rotation.set(json.rx, json.ry, 0);
	node.scale.set(json.scale, json.scale, json.scale);

	if (this.scene)
		this.scene.add(node);

	for (var i = 0; i < arr.length; i++) {
		var subnode = this.evalNode(arr[i]);
		if (subnode !== undefined) {
			node.add(subnode);
		}
	}
	return node;
}

// eval one node
//   node format:
//   {
//     name: (object name - optional),
//      obj: (object obj),
//        x: (position x - optional),
//        y: (position y - optional),
//        z: (position z - optional),
//       rx: (rotation x - optional),
//       ry: (rotation y - optional),
//       rz: (rotation z - optional),
//               :
//     ]
//   }
ThreePiece.prototype.evalNode = function(json) {
	var self = this;
	var o = json;

	// macro
	if (o.obj in this.macro) {
		var newJson = {}
		var defaultJson = this.macro[o.obj];
		for (var key in defaultJson) {	// clone macro as default
			newJson[key] = defaultJson[key];
		}
		for (var key in json) {			// override value
			if (key !== 'obj') {
				newJson[key] = json[key];
			}
		}
		return this.evalNode(newJson);
	}

	var obj = o.obj;
	var ret;
	switch (obj.toLowerCase()) {
		// Texture
		case 'texture':
			this.texture[o.name] = THREE.ImageUtils.loadTexture(o.file, null, function() { self.textureLoaded++; });
			break;

		// Camera
		case 'perspectivecamera':
			this.camera = this.PerspectiveCamera(o);
			return undefined;

		// Light
		case 'ambientlight':
			ret = this.AmbientLight(o);
			break;
		case 'directionallight':
			ret = this.DirectionalLight(o);
			break;
		case 'hemispherelight':
			ret = this.HemisphereLight(o);
			break;
		case 'spotlight':
			ret = this.SpotLight(o);
			break;

		// Node Group
		case 'group':
			ret = this.evalNodeGroup(o);
			break;

		// Object
		case 'line':
			ret = this.Line(o);
			break;
		case 'plane':
			ret = this.Plane(o);
			break;
		case 'box':
			ret = this.Box(o);
			break;
		case 'circle':
			ret = this.Circle(o);
			break;
		case 'sphere':
			ret = this.Sphere(o);
			break;

//TODO:
// Text
// Parametric


		case 'cylinder':
			ret = this.Cylinder(o);
			break;

		case 'extrude':
			ret = this.Extrude(o);
			break;

	}
	if ('name' in o) {
		this.objs[o.name] = ret;
	}

	return ret;
}



ThreePiece.prototype.init = function() {
	if (this.id === undefined) {
		this.element = document.body;
	} else {
		this.element = document.getElementById(this.id);
	}

	///////// RENDERER
	this.renderer = new THREE.WebGLRenderer({ antialias:true });
	this.renderer.setSize(this.width, this.height);
	this.renderer.setClearColor(0x000000, 1);
	this.element.appendChild(this.renderer.domElement);	// append to <DIV>
	this.canvas = this.element.lastChild;

	///////// SCENE
	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.FogExp2(0x000000, 0.2);

}

ThreePiece.prototype.show = function() {
	///////// Draw Loop
	var self = this;
	var render = function() {
		window.requestAnimationFrame(render);
		if (self.hook) {
			self.hook();
		}
		self.renderer.render(self.scene, self.camera);
	};

	// wait for texture loading before rendering
	var waitFunction = function() {
		if (self.textureLoaded < Object.keys(self.texture).length) {
			setTimeout(waitFunction, 100);
		} else {
			render();
		}
	};
	waitFunction();
}

ThreePiece.prototype.define = function(name, json) {
	this.macro[name] = json;
}


ThreePiece.prototype.set = function(v, dval) {
	return (v !== undefined ? v : dval);
}

ThreePiece.prototype.setDefault = function(o) {
	o.x = this.set(o.x, 0);
	o.y = this.set(o.y, 0);
	o.z = this.set(o.z, 0);
	o.rx = this.set(o.rx, 0);
	o.ry = this.set(o.ry, 0);
	o.rz = this.set(o.rz, 0);
	o.scale = this.set(o.scale, 1);

	o.w = this.set(o.w, 1);
	o.h = this.set(o.h, 1);

	o.material_opt = {
		size: 1, blending: THREE.AdditiveBlending,
		specular:0xffffff, shininess:1.2, metal:true,
		transparent: false, depthTest: true
	};

	if (o.tex !== undefined) {
		o.material_opt.map = this.texture[o.tex];
		o.material_opt.color = this.set(o.col, 0xffffff);
	} else {
		o.material_opt.color = this.set(o.col, 0xff0000);
		o.material_opt.ambient = this.set(o.ambient, 0xffffff);
	}

	return o;
}

/////////////////////////////////////////////////////
ThreePiece.prototype.PerspectiveCamera = function(o) {
	this.cameraExist = true;

	o.x = this.set(o.x, 0);
	o.y = this.set(o.y, 0.5);
	o.z = this.set(o.z, 3);
	var useRotation;
	if (o.rx === undefined) {
		useRotation = false;
		o.tx = this.set(o.tx, 0);
		o.ty = this.set(o.ty, 0);
		o.tz = this.set(o.tz, 0);
	} else {
		useRotation = true;
		o.rx = this.set(o.rx, 0);
		o.ry = this.set(o.ry, 0);
		o.rz = this.set(o.rz, 0);
	}
	o.fov = this.set(o.fov, 45);
	o.name = this.set(o.name, 'camera');

	var camera = new THREE.PerspectiveCamera(o.fov, this.width / this.height);
	camera.position.set(o.x, o.y, o.z);
	camera.rotation.order = 'ZXY';
	if (useRotation) {
		camera.rotation.set(o.rx, o.ry, o.rz);
	} else {
		camera.lookAt(new THREE.Vector3(o.tx, o.ty, o.tz));
	}
	this.objs[o.name] = camera;
	this.scene.add(camera);

	return camera;
}

/////////////////////////////////////////////////////
ThreePiece.prototype.Line = function(o) {
	o.col = this.set(o.col, 0xFF0000);
	o.linewidth = this.set(o.linewidth, 1);
	o = this.setDefault(o);
	o.tx = this.set(o.tx, o.x + 1);
	o.ty = this.set(o.ty, o.y + 1);
	o.tz = this.set(o.tz, o.z);
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(o.x, o.y, o.z));
	geometry.vertices.push(new THREE.Vector3(o.tx, o.ty, o.tz));
	var material = new THREE.LineBasicMaterial({color:o.col, linewidth:o.linewidth});
	var mesh = new THREE.Line(geometry, material);
	mesh.scale.set(o.scale, o.scale, o.scale);
	return mesh;
}

ThreePiece.prototype.Plane = function(o) {
	o = this.setDefault(o);

	var material = new THREE.MeshPhongMaterial(o.material_opt);
	var geometry = new THREE.PlaneGeometry(o.w, o.h);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.set(o.rx, o.ry, o.rz);
	mesh.position.set(o.x, o.y, o.z);
	mesh.scale.set(o.scale, o.scale, o.scale);
	return mesh;
}

ThreePiece.prototype.Box = function(o) {
	o.d = this.set(o.d, 1);
	o = this.setDefault(o);

	var material = new THREE.MeshPhongMaterial(o.material_opt);
	var geometry = new THREE.BoxGeometry(o.w, o.h, o.d, 1, 1, 1);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.set(o.rx, o.ry, o.rz);
	mesh.position.set(o.x, o.y, o.z);
	mesh.scale.set(o.scale, o.scale, o.scale);
	return mesh;
}

ThreePiece.prototype.Circle = function(o) {
	o.w = this.set(o.w, 0.5);
	o.segments = this.set(o.segments, 32);
	o = this.setDefault(o);

	var material = new THREE.MeshPhongMaterial(o.material_opt);
	var geometry = new THREE.CircleGeometry(o.w, o.segments);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.set(o.rx, o.ry, o.rz);
	mesh.position.set(o.x, o.y, o.z);
	mesh.scale.set(o.scale, o.scale, o.scale);
	return mesh;
}

ThreePiece.prototype.Sphere = function(o) {
	o.w = this.set(o.w, 0.5);
	o.segments = this.set(o.segments, 32);
	o = this.setDefault(o);

	var material = new THREE.MeshPhongMaterial(o.material_opt);
	var geometry = new THREE.SphereGeometry(o.w, o.segments, o.segments);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.set(o.rx, o.ry, o.rz);
	mesh.position.set(o.x, o.y, o.z);
	mesh.scale.set(o.scale, o.scale, o.scale);
	return mesh;
}

ThreePiece.prototype.Cylinder = function(o) {
	o.radiustop = this.set(o.radiustop, 0.5);
	o.radiusbottom = this.set(o.radiusbottom, 0.5);
	o.segments = this.set(o.segments, 32);
	o = this.setDefault(o);

	var material = new THREE.MeshPhongMaterial(o.material_opt);
	var geometry = new THREE.CylinderGeometry(o.radiustop, o.radiusbottom, o.h, o.segments, 8, false);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.set(o.rx, o.ry, o.rz);
	mesh.position.set(o.x, o.y, o.z);
	mesh.scale.set(o.scale, o.scale, o.scale);

	return mesh;
}

ThreePiece.prototype.Extrude = function(o) {
	o.shape = this.set(o.shape,
		[[-0.5,0],[-0.5,0.7],[0,1],[0.5,0.7],[0.5,0]]
	);
	o.d = this.set(o.d, 0.2);
	o = this.setDefault(o);

	var shape = new THREE.Shape();
	shape.moveTo(o.shape[0][0], o.shape[0][1]);
	for (var i = 1; i < o.shape.length; i++) {
		shape.lineTo(o.shape[i][0], o.shape[i][1]);
	};

	var opt = {
		bevelEnabled: false,
		amount: o.d
	};

	var material = new THREE.MeshPhongMaterial(o.material_opt);
	var geometry = new THREE.ExtrudeGeometry(shape, opt);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.set(o.rx, o.ry, o.rz);
	mesh.position.set(o.x, o.y, o.z);
	mesh.scale.set(o.scale, o.scale, o.scale);

	return mesh;
}

/////////////////////////////////////////////////////
ThreePiece.prototype.AmbientLight = function(o) {
	o.col = this.set(o.col, 0xFFFFFF)
	var light = new THREE.AmbientLight(o.col);
	return light;
}

ThreePiece.prototype.DirectionalLight = function(o) {
	this.lightExist = true;
    o.col = this.set(o.col, 0xFFFFEE);
    o.intensity = this.set(o.intensity, 1.0);
    o.x = this.set(o.x, -5);
    o.y = this.set(o.y,  5);
    o.z = this.set(o.z,  4);
    o.tx = this.set(o.tx, 0);
    o.ty = this.set(o.ty, 0);
    o.tz = this.set(o.tz, 0);
	var light = new THREE.DirectionalLight(o.col, o.intensity);
	light.position.set(o.x, o.y, o.z);
	light.target.position.set(o.tx, o.ty, o.tz);
	return light;
}

ThreePiece.prototype.HemisphereLight = function(o) {
	this.lightExist = true;
    o.col = this.set(o.col, 0xFFFFEE);
    o.intensity = this.set(o.intensity, 0.5);
	var light = new THREE.HemisphereLight(o.col, o.col, o.intensity);
	return light;
}

ThreePiece.prototype.SpotLight = function(o) {
	this.lightExist = true;
    o.col = this.set(o.col, 0xFFFFEE);
    o.intensity = this.set(o.intensity, 1.0);
    o.x = this.set(o.x, -5);
    o.y = this.set(o.y,  5);
    o.z = this.set(o.z,  4);
    o.tx = this.set(o.tx, 0);
    o.ty = this.set(o.ty, 0);
    o.tz = this.set(o.tz, 0);

	o.distance = this.set(o.distance, 0);
	o.angle = this.set(o.angle, Math.PI / 3);
	o.exponent = this.set(o.exponent, 10);
	var light = new THREE.SpotLight(o.col, o.intensity, o.distance, o.angle, o.exponent);
	light.position.set(o.x, o.y, o.z);
	light.target.position.set(o.tx, o.ty, o.tz);
	return light;
}

/////////////////////////////////////////////////////
ThreePiece.prototype.obj = function(name) {
	return this.objs[name];
}

ThreePiece.prototype.rotate = function(speed) {
	speed = this.set(speed, -1);
	var self = this;
	var angle = 0;
	this.hook = function() {
		angle += speed * 0.005;
		self.objs['world'].rotation.y = angle;
	};
}

/*

mouseover
mouse in
mouse out
mouse click

*/
ThreePiece.prototype.onmousemove = function(e) {
    var rect = e.target.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    mouseX =  (mouseX/window.innerWidth)  * 2 - 1;
    mouseY = -(mouseY/window.innerHeight) * 2 + 1;
    var pos = new THREE.Vector3(mouseX, mouseY, 1);
    projector.unprojectVector(pos, this.camera);
    var ray = new THREE.Raycaster(this.camera.position, pos.sub(this.camera.position).normalize());
    var objs = ray.intersectObjects(this.scene.children);
    if (objs.length > 0) {
        // 交差していたらobjsが1以上になるので、やりたいことをやる。
        objs[0].object.position.x = 2;

    }
}
