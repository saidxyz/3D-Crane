import '../../../../threejs24_std/src/style.css';

import * as THREE from "three";
import {TrackballControls} from "three/examples/jsm/controls/TrackballControls";
import {addCoordSystem} from "../../../../threejs24_std/static/lib/wfa-coord.js";
import {
	createArmBaseMesh,
	createDroneBaseMesh,
	createEngineMesh,
	createFootMesh,
	createSphereMesh,
	createWheelMesh,
	createPassengerSetMesh
} from "./droneHelper.js";

const ri = {
	currentlyPressedKeys: []
};

export function main() {
	const canvas = document.createElement('canvas');
	document.body.appendChild(canvas);

	// Renderer:
	ri.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
	ri.renderer.setSize(window.innerWidth, window.innerHeight);

	// Scene
	ri.scene = new THREE.Scene();
	ri.scene.background = new THREE.Color( 0xdddddd );

	// Lys
	addLights();

	// Kamera:
	ri.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	ri.camera.position.x = 7;
	ri.camera.position.y = 8;
	ri.camera.position.z = 20;

	// TrackballControls:
	ri.controls = new TrackballControls(ri.camera, ri.renderer.domElement);
	ri.controls.addEventListener( 'change', renderScene);

	//Håndterer endring av vindusstørrelse:
	window.addEventListener('resize', onWindowResize, false);
	//Input - standard Javascript / WebGL:
	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

	// Sceneobjekter
	addSceneObjects();
}

//Sjekker tastaturet:
function handleKeys(delta, arms) {
	//Arms:
	if (ri.currentlyPressedKeys['Digit4']) { //4
		for( let arm of arms){
			arm.animation.extended += 0.2
			console.log(arm.animation.extended)
			if(arm.animation.extended > 25){
				arm.animation.extended = 25
			}
		}
	}
	if (ri.currentlyPressedKeys['KeyR']) { //R
		for( let arm of arms){
			arm.animation.extended -= 0.2
			if(arm.animation.extended < 10){
				arm.animation.extended = 10
			}
		}
	}
}

function handleKeyUp(event) {
	ri.currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
	ri.currentlyPressedKeys[event.keyCode] = true;
}

function addSceneObjects() {
	addCoordSystem(ri.scene);

	let drone = createDrone();
	drone.name = "myDrone";
	drone.animation = {
		posX: 0,
		posY: 0,
		rotationAngleY: 0
	};
	drone.position.y = 1
	ri.scene.add(drone);

	animate(0);
}

function createDrone() {
	// Dronekroppen:
	let droneBaseDiameter = 5;
	let droneHeight = 0.8;
	// Merk: droneBase er et Mesh-objekt (som igjen arver fra Object3D):
	let droneBase = createDroneBaseMesh(droneBaseDiameter, droneHeight);
	//droneBase.position.set(-10, 23, -44);
	let backWheel = 2;
	let noSpheres = 2;     //numberOfSpheres
	let step = (2*Math.PI)/noSpheres;
	for (let angle=0; angle <2*Math.PI; angle+=step) {
		let sphereMesh = createSphereMesh(0.4);


		//droneBase.add(sphereMesh);
	}

	let droneArm1 = createDroneArm(droneBaseDiameter, droneHeight, 1,  Math.PI/2);
	droneBase.add(droneArm1);

	let droneArm2 = createDroneArm2(droneBaseDiameter, droneHeight, 2, Math.PI/2);
	droneBase.add(droneArm2);

	let droneArm3 = createDroneArm2(droneBaseDiameter, droneHeight, 3, Math.PI + Math.PI/2);
	droneBase.add(droneArm3);

	let droneArm4 = createDroneArm(droneBaseDiameter, droneHeight, 4, Math.PI + Math.PI/2);
	droneBase.add(droneArm4);

	let wheelFront1 = createWheelMesh();
	wheelFront1.translateX(-(backWheel+6))
	wheelFront1.translateY(-2)
	wheelFront1.translateZ(2)
	droneBase.add(wheelFront1);

	let wheelFront2 = createWheelMesh();
	wheelFront2.translateX(-(backWheel+6))
	wheelFront2.translateY(-2)
	wheelFront2.translateZ(-2)
	droneBase.add(wheelFront2);

	let wheelFront3 = createWheelMesh();
	wheelFront3.translateX(-(backWheel+3))
	wheelFront3.translateY(-2)
	wheelFront3.translateZ(2)
	droneBase.add(wheelFront3);

	let wheelFront4 = createWheelMesh();
	wheelFront4.translateX(-(backWheel+3))
	wheelFront4.translateY(-2)
	wheelFront4.translateZ(-2)
	droneBase.add(wheelFront4);

	let wheelBack1 = createWheelMesh();
	wheelBack1.translateX((backWheel+6))
	wheelBack1.translateY(-2)
	wheelBack1.translateZ(2)
	droneBase.add(wheelBack1);

	let wheelBack2 = createWheelMesh();
	wheelBack2.translateX((backWheel+6))
	wheelBack2.translateY(-2)
	wheelBack2.translateZ(-2)
	droneBase.add(wheelBack2);

	let wheelBack3 = createWheelMesh();
	wheelBack3.translateX((backWheel+3))
	wheelBack3.translateY(-2)
	wheelBack3.translateZ(2)
	droneBase.add(wheelBack3);

	let wheelBack4 = createWheelMesh();
	wheelBack4.translateX((backWheel+3))
	wheelBack4.translateY(-2)
	wheelBack4.translateZ(-2)
	droneBase.add(wheelBack4);

	let wheelBack5 = createWheelMesh();
	wheelBack5.translateX(backWheel)
	wheelBack5.translateY(-2)
	wheelBack5.translateZ(2)
	droneBase.add(wheelBack5);

	let wheelBack6 = createWheelMesh();
	wheelBack6.translateX(backWheel)
	wheelBack6.translateY(-2)
	wheelBack6.translateZ(-2)
	droneBase.add(wheelBack6);

	//let passenger = createPassengerSetMesh();
	//droneBase.add(passenger);


	return droneBase;
}


function createDroneArm(droneDiameter, droneHeight, armNumber, angle) {
	// Merk: armBase er et Mesh-objekt.

	let armBase = createArmBaseMesh(droneDiameter, droneHeight);
	armBase.rotateY(angle);
	armBase.translateX(droneDiameter);

	let engineBase = createEngineBase(armNumber, droneHeight);
	engineBase.translateX(droneDiameter/2);
	armBase.add(engineBase);

	//støtte arm
	let armFoot = createFootMesh(2);
	armFoot.translateX(droneDiameter/2);
	armFoot.translateY(-2/2)
	armBase.add(armFoot);

	return armBase;
}

function createDroneArm2(droneDiameter, droneHeight, armNumber, angle) {
	// Merk: armBase er et Mesh-objekt.
	let armBase = createArmBaseMesh(droneDiameter, droneHeight);
	armBase.translateX(9.5);
	armBase.rotateY(angle);
	armBase.translateX(droneDiameter);

	let engineBase = createEngineBase(armNumber, droneHeight);
	engineBase.translateX(droneDiameter/2);
	armBase.add(engineBase);

	//støtte arm
	let armFoot = createFootMesh(2);
	armFoot.translateX(droneDiameter/2);
	armFoot.translateY(-2/2)
	armBase.add(armFoot);

	return armBase;
}

function createEngineBase(armNumber, droneHeight) {
	let group = new THREE.Group();
	let height = droneHeight*1.3;
	let motor = createEngineMesh(height);
	group.add(motor);
	return group;
}


function addLights() {
	let light1 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
	light1.position.set(2, 1, 4);
	ri.scene.add(light1);

	let light2 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
	light2.position.set(-2, -1, -4);
	ri.scene.add(light2);

	let light3 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
	light3.position.set(100, 300, 300);
	light3.target.position.set(0, 0, 0);
	ri.scene.add(light3);
}

function animate(currentTime) {
	window.requestAnimationFrame((currentTime) => {
		animate(currentTime);
	});
	let meshCraneTruck = ri.scene.getObjectByName('platform');
	//Truck Arms
	//let meshArms = []
	//for(var i = 1; i < 3; i++){
	//	meshArms[i-1] = meshCraneTruck.getObjectByName('arm'+i, true);
	//	meshArms[i-1].position.z = meshArms[i-1].animation.extended;
	//}
	//for(var i = 3; i < 5; i++){
	//	meshArms[i-1] = meshCraneTruck.getObjectByName('arm'+i, true);
	//	meshArms[i-1].position.z = -meshArms[i-1].animation.extended;
	//}

	//Sjekker input:
	//handleKeys(delta, meshArms);

	ri.controls.update();
	renderScene();
}

function renderScene() {
	ri.renderer.render(ri.scene, ri.camera);
}


function onWindowResize() {

	ri.camera.aspect = window.innerWidth / window.innerHeight;
	ri.camera.updateProjectionMatrix();

	ri.renderer.setSize(window.innerWidth, window.innerHeight);

	ri.controls.handleResize();
	renderScene();
}
