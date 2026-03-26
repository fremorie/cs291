"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Drinking Bird Model exercise                                               //
// Your task is to complete the model for the drinking bird                   //
// Please work from the formal blueprint dimensions and positions shown at    //
// https://www.udacity.com/wiki/cs291/notes                                   //
//                                                                            //
// The following materials should be used:                                    //
// Hat and spine: cylinderMaterial (blue)                                     //
// Head and bottom body: sphereMaterial (red)                                 //
// Rest of body: cubeMaterial (orange)                                        //
//                                                                            //
// So that the exercise passes, and the spheres and cylinders look good,      //
// all SphereGeometry calls should be of the form:                            //
//     SphereGeometry( radius, 32, 16 );                                      //
// and CylinderGeometry calls should be of the form:                          //
//     CylinderGeometry( radiusTop, radiusBottom, height, 32 );               //
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, $, document, window, dat*/

const BASE_WIDTH = 20 + 64 + 110;
const BASE_HEIGHT = 4;
const BASE_DEPTH = 2 * 77;

const FOOT_HEIGHT = 52;
const FOOT_DEPTH = 6;

const LEG_WIDTH = 64;
const LEG_HEIGHT = 52 + 334;
const LEG_DEPTH = 6;

const BODY_RADIUS = 116 / 2;
const SPINE_HEIGHT = 390;
const SPINE_RADIUS = 24 / 2;

const TOTAL_HEIGHT = 70 + 10 + 40 + SPINE_HEIGHT + 160;
const BIRD_HEIGHT = 70 + 10 + 40 + SPINE_HEIGHT + BODY_RADIUS;

const SPINE_BOTTOM_POSITION = 160;
const BODY_BOTTOM_POSITION = SPINE_BOTTOM_POSITION;

const HAT_HEIGHT = 70;
const HAT_RIM_HEIGHT = 10;
const HAT_TOTAL_HEIGHT = HAT_HEIGHT + HAT_RIM_HEIGHT;
const HAT_RADIUS = 80 / 2;
const HAT_RIM_RADIUS = 142 / 2;

const HEAD_RADIUS = 104 / 2;

const HEAD_TOTAL_HEIGHT = HAT_TOTAL_HEIGHT + 40 + HEAD_RADIUS;
const HEAD_BOTTOM_POSITION = TOTAL_HEIGHT - HEAD_TOTAL_HEIGHT;

const HAT_BOTTOM_POSITION = TOTAL_HEIGHT - HAT_TOTAL_HEIGHT;

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = false;
var gridY = false;
var gridZ = false;
var axes = false;
var ground = true;

function init() {
	var canvasWidth = 846;
	var canvasHeight = 494;
	// For grading the window is fixed in size; here's general code:
	//var canvasWidth = window.innerWidth;
	//var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 40000 );
	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);

	camera.position.set( -480, 659, -619 );
	cameraControls.target.set(4,301,92);

	fillScene();
}

// Supporting frame for the bird - base + legs + feet
function createSupport() {

	var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xF07020 } );
	// base
	var cube;
	cube = new THREE.Mesh(
		new THREE.CubeGeometry( BASE_WIDTH, BASE_HEIGHT, BASE_DEPTH ), cubeMaterial );
	cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = BASE_HEIGHT / 2;	// half of height
	cube.position.z = 0;	// centered at origin
	scene.add( cube );

	// left foot
	cube = new THREE.Mesh(
		new THREE.CubeGeometry( BASE_WIDTH, FOOT_HEIGHT, FOOT_DEPTH ), cubeMaterial );
	cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = FOOT_HEIGHT / 2;	// half of height
	cube.position.z = BASE_DEPTH / 2 + FOOT_DEPTH / 2;	// offset 77 + half of depth 6/2
	scene.add( cube );

	// left leg
	cube = new THREE.Mesh(
		new THREE.CubeGeometry( LEG_WIDTH, LEG_HEIGHT, LEG_DEPTH ), cubeMaterial );
	cube.position.x = 0; // centered on origin along X
	cube.position.y = LEG_HEIGHT / 2;
	cube.position.z = BASE_DEPTH / 2 + LEG_DEPTH / 2;	// offset 77 + half of depth 6/2
	scene.add( cube );

	// right foot
	cube = new THREE.Mesh(
		new THREE.CubeGeometry( BASE_WIDTH, FOOT_HEIGHT, FOOT_DEPTH ), cubeMaterial );
	cube.position.x = -45; // (20+32) - half of width (20+64+110)/2
	cube.position.y = FOOT_HEIGHT / 2;
	cube.position.z = - BASE_DEPTH / 2 - FOOT_DEPTH / 2;
	scene.add( cube );

	// right leg
	cube = new THREE.Mesh(
		new THREE.CubeGeometry( LEG_WIDTH, LEG_HEIGHT, LEG_DEPTH ), cubeMaterial );
	cube.position.x = 0; // centered on origin along X
	cube.position.y = LEG_HEIGHT / 2;
	cube.position.z = - BASE_DEPTH / 2 - LEG_DEPTH / 2;
	scene.add( cube );
}

// Body of the bird - body and the connector of body and head
function createBody() {
	var sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xA00000 } );
	var cylinderMaterial = new THREE.MeshLambertMaterial( { color: 0x0000D0 } );

	// BODY
	const sphere = new THREE.Mesh(
		new THREE.SphereGeometry(BODY_RADIUS, 32, 16), sphereMaterial);
	sphere.position.x = 0;
	sphere.position.y = BODY_BOTTOM_POSITION;
	sphere.position.z = 0;
	scene.add(sphere);

	// SPINE
	const cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry(SPINE_RADIUS, SPINE_RADIUS, SPINE_HEIGHT, 32), cylinderMaterial);
	cylinder.position.x = 0;
	cylinder.position.y = SPINE_HEIGHT / 2 + SPINE_BOTTOM_POSITION;
	cylinder.position.z = 0;
	scene.add(cylinder);
}

// Head of the bird - head + hat
function createHead() {
	var sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xA00000 } );
	var cylinderMaterial = new THREE.MeshLambertMaterial( { color: 0x0000D0 } );

	// HEAD
	const sphere = new THREE.Mesh(
		new THREE.SphereGeometry(HEAD_RADIUS, 32, 16), sphereMaterial);

	sphere.position.x = 0;
	sphere.position.y = HEAD_BOTTOM_POSITION + HEAD_RADIUS;
	sphere.position.z = 0;
	scene.add(sphere);

	// HAT
	let cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry(HAT_RADIUS, HAT_RADIUS, HAT_HEIGHT, 32), cylinderMaterial);
	cylinder.position.x = 0;
	cylinder.position.y = HAT_HEIGHT / 2 + HAT_BOTTOM_POSITION + HAT_RIM_HEIGHT;
	cylinder.position.z = 0;
	scene.add(cylinder);

	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry(HAT_RIM_RADIUS, HAT_RIM_RADIUS, HAT_RIM_HEIGHT, 32), cylinderMaterial);
	cylinder.position.x = 0;
	cylinder.position.y = HAT_BOTTOM_POSITION + HAT_RIM_HEIGHT / 2;
	cylinder.position.z = 0;
	scene.add(cylinder);

}

function createDrinkingBird() {

	// MODELS
	// base + legs + feet
	createSupport();

	// body + body/head connector
	createBody();

	// head + hat
	createHead();
}

function fillScene() {
	// SCENE
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 3000, 6000 );
	// LIGHTS
	var ambientLight = new THREE.AmbientLight( 0x222222 );
	var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( 200, 400, 500 );

	var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light2.position.set( -400, 200, -300 );

	scene.add(ambientLight);
	scene.add(light);
	scene.add(light2);

	if (ground) {
		Coordinates.drawGround({size:1000});
	}
	if (gridX) {
		Coordinates.drawGrid({size:1000,scale:0.01});
	}
	if (gridY) {
		Coordinates.drawGrid({size:1000,scale:0.01, orientation:"y"});
	}
	if (gridZ) {
		Coordinates.drawGrid({size:1000,scale:0.01, orientation:"z"});
	}
	if (axes) {
		Coordinates.drawAllAxes({axisLength:300,axisRadius:2,axisTess:50});
	}
	createDrinkingBird();
}
//
function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);
	if ( effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes)
	{
		gridX = effectController.newGridX;
		gridY = effectController.newGridY;
		gridZ = effectController.newGridZ;
		ground = effectController.newGround;
		axes = effectController.newAxes;

		fillScene();
	}
	renderer.render(scene, camera);
}

function setupGui() {

	effectController = {

		newGridX: gridX,
		newGridY: gridY,
		newGridZ: gridZ,
		newGround: ground,
		newAxes: axes
	};

	var gui = new dat.GUI();
	gui.add(effectController, "newGridX").name("Show XZ grid");
	gui.add( effectController, "newGridY" ).name("Show YZ grid");
	gui.add( effectController, "newGridZ" ).name("Show XY grid");
	gui.add( effectController, "newGround" ).name("Show ground");
	gui.add( effectController, "newAxes" ).name("Show axes");
}

try {
	init();
	setupGui();
	addToDOM();
	animate();
} catch(e) {
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}
