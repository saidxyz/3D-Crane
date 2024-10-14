import '../../../../threejs24_std/src/style.css';

import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { addCoordSystem } from "../../../../threejs24_std/static/lib/wfa-coord.js";
import {
	createArmBaseMesh,
	createBaseMesh,
	createEngineMesh,
	createFootMesh,
	createWheelMesh,
	createPassengerSetMesh,
	createRimSetMesh} from "./helper.js";

const ri = {
	currentlyPressedKeys: {}
};

export function main() {
	const canvas = document.createElement('canvas');
	document.body.appendChild(canvas);

	// Renderer:
	ri.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
	ri.renderer.setSize(window.innerWidth, window.innerHeight);

	// Scene
	ri.scene = new THREE.Scene();
	ri.scene.background = new THREE.Color(0xdddddd);

	// Lights
	addLights();

	// Camera:
	ri.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	ri.camera.position.set(7, 8, 20);

	// TrackballControls:
	ri.controls = new TrackballControls(ri.camera, ri.renderer.domElement);
	ri.controls.addEventListener('change', renderScene);

	// Clock for animation
	ri.clock = new THREE.Clock();

	// Handle window resize:
	window.addEventListener('resize', onWindowResize, false);

	// Input - standard JavaScript / WebGL:
	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

	// Scene objects
	addSceneObjects();
}

// Handle keyboard input
function handleKeys(delta, arms, crane) {
	// Arms:
	if (ri.currentlyPressedKeys['Digit4']) { // 4
		for (let arm of arms) {
			arm.animation.extended += 0.2;
			if (arm.animation.extended > 5) {
				arm.animation.extended = 5;
			}
		}
	}
	if (ri.currentlyPressedKeys['KeyR']) { // R
		for (let arm of arms) {
			arm.animation.extended -= 0.2;
			if (arm.animation.extended < 0) {
				arm.animation.extended = 0;
			}
		}
	}

	// Steering
	if (ri.currentlyPressedKeys['ArrowLeft']) {
		// Turn left
		crane.steeringAngle += 0.02; // Adjust increment as needed
		if (crane.steeringAngle > crane.maxSteeringAngle) {
			crane.steeringAngle = crane.maxSteeringAngle;
		}
	}
	if (ri.currentlyPressedKeys['ArrowRight']) {
		// Turn right
		crane.steeringAngle -= 0.02; // Adjust decrement as needed
		if (crane.steeringAngle < -crane.maxSteeringAngle) {
			crane.steeringAngle = -crane.maxSteeringAngle;
		}
	}

	// Reset steering when keys are not pressed
	if (!ri.currentlyPressedKeys['ArrowLeft'] && !ri.currentlyPressedKeys['ArrowRight']) {
		// Gradually return to straight position
		if (crane.steeringAngle > 0) {
			crane.steeringAngle -= 0.01;
			if (crane.steeringAngle < 0) crane.steeringAngle = 0;
		} else if (crane.steeringAngle < 0) {
			crane.steeringAngle += 0.01;
			if (crane.steeringAngle > 0) crane.steeringAngle = 0;
		}
	}
}

function handleKeyUp(event) {
	ri.currentlyPressedKeys[event.code] = false;
}

function handleKeyDown(event) {
	ri.currentlyPressedKeys[event.code] = true;
}

function addSceneObjects() {
	addCoordSystem(ri.scene);

	let crane = createCrane();
	crane.name = "platform";
	crane.animation = {
		posX: 0,
		posY: 0,
		rotationAngleY: 0
	};
	crane.position.y = 1;
	ri.scene.add(crane);

	animate(0);
}

function createCrane() {
	// Crane body configuration
	const craneBaseDiameter = 5;
	const craneHeight = 0.7;
	const backWheelOffset = 2;

	// Create crane base
	let craneBase = createBaseMesh(craneBaseDiameter, craneHeight);

	// Add crane arms
	let craneArms = addCraneArms(craneBase, craneBaseDiameter, craneHeight);

	// Add wheels and get references to the wheels to be steered
	let wheelsToSteer = addWheels(craneBase, backWheelOffset);

	// Add passenger and rim components
	addPassengerAndRim(craneBase);

	// Store craneArms and wheelsToSteer in craneBase for later reference
	craneBase.craneArms = craneArms;
	craneBase.wheelsToSteer = wheelsToSteer;

	// Initialize steering properties
	craneBase.steeringAngle = 0;
	craneBase.maxSteeringAngle = Math.PI / 3; // Maximum steering angle (60 degrees)

	return craneBase;
}

function addCraneArms(craneBase, craneBaseDiameter, craneHeight) {
	let angles = [Math.PI / 2, Math.PI / 2, Math.PI + Math.PI / 2, Math.PI + Math.PI / 2];
	let offsets = [0, 9.5, 9.5, 0];

	// Array to hold references to the crane arms
	let craneArms = [];

	for (let i = 1; i <= 4; i++) {
		let craneArm = createCraneArm(craneBase, craneBaseDiameter, craneHeight, i, angles[i - 1], offsets[i - 1]);
		craneArm.animation = { extended: 0 };
		craneBase.add(craneArm);
		craneArms.push(craneArm); // Store the arm for animation
	}

	// Return the array of crane arms for animation
	return craneArms;
}

function addWheels(craneBase, backWheel) {
	const wheelPositions = [
		{ x: -(backWheel + 6), y: -2, z: 2 },  // index 0
		{ x: -(backWheel + 6), y: -2, z: -2 }, // index 1
		{ x: -(backWheel + 3), y: -2, z: 2 },  // index 2
		{ x: -(backWheel + 3), y: -2, z: -2 }, // index 3
		{ x: (backWheel + 6), y: -2, z: 2 },   // index 4
		{ x: (backWheel + 6), y: -2, z: -2 },  // index 5
		{ x: (backWheel + 3), y: -2, z: 2 },   // index 6
		{ x: (backWheel + 3), y: -2, z: -2 },  // index 7
		{ x: backWheel, y: -2, z: 2 },         // index 8
		{ x: backWheel, y: -2, z: -2 }         // index 9
	];

	let wheelsToSteer = []; // Array to hold references to the wheels to be steered

	const wheelsToRotateIndices = [0, 1, 2, 3]; // Indices of wheels to rotate (front and back wheels)

	wheelPositions.forEach((position, index) => {
		let wheel = createWheelMesh();
		wheel.position.set(position.x, position.y, position.z);

		// If this is one of the wheels to be steered, apply initial left-facing rotation
		if (wheelsToRotateIndices.includes(index)) {
			// Increase the initial rotation to rotate more to the left
			wheel.rotation.y = Math.PI / 2;  // Rotate left (90 degrees)
			wheel.initialRotationY = wheel.rotation.y; // Store initial rotation
			wheelsToSteer.push(wheel);  // Store wheels to steer
		}

		craneBase.add(wheel);
	});

	// Return the array of wheels for steering control
	return wheelsToSteer;
}


function addPassengerAndRim(craneBase) {
	const passenger = createPassengerSetMesh();
	passenger.position.set(-11, 1, -0);
	craneBase.add(passenger);

	const rim = createRimSetMesh(); // Corrected function name for consistency
	rim.position.set(-13, 0, 0);
	rim.rotation.y = Math.PI / 2;
	craneBase.add(rim);
}


function createCraneArm(base, craneDiameter, craneHeight, armNumber, angle, x = 0) {
	let armBase = createArmBaseMesh(craneDiameter, craneHeight);
	armBase.name = "arm" + armNumber;

	armBase.translateX(x);
	armBase.rotateY(angle);
	armBase.translateX(craneDiameter);

	base.add(armBase);

	let engineBase = createEngineBase(armNumber, craneHeight);
	engineBase.translateX(craneDiameter / 2);
	armBase.add(engineBase);

	// Support arm
	let armFoot = createFootMesh(2);
	armFoot.translateX(craneDiameter / 2);
	armFoot.translateY(-2 / 2);
	armBase.add(armFoot);

	return armBase;
}

function createEngineBase(armNumber, craneHeight) {
	let group = new THREE.Group();
	let height = craneHeight * 1.3;
	let motor = createEngineMesh(height);
	group.add(motor);
	return group;
}

function addLights() {
	let light1 = new THREE.DirectionalLight(0xffffff, 1.0);
	light1.position.set(2, 1, 4);
	ri.scene.add(light1);

	let light2 = new THREE.DirectionalLight(0xffffff, 1.0);
	light2.position.set(-2, -1, -4);
	ri.scene.add(light2);

	let light3 = new THREE.DirectionalLight(0xffffff, 1.0);
	light3.position.set(100, 300, 300);
	light3.target.position.set(0, 0, 0);
	ri.scene.add(light3);
}

function animate(currentTime) {
	window.requestAnimationFrame(animate);

	const delta = ri.clock.getDelta();

	let crane = ri.scene.getObjectByName('platform');

	let craneArms = crane.craneArms;
	let wheelsToSteer = crane.wheelsToSteer;

	// Update positions of the crane arms
	for (let i = 0; i < craneArms.length; i++) {
		if (i < 2) {
			craneArms[i].position.z = -craneArms[i].animation.extended;
		} else {
			craneArms[i].position.z = craneArms[i].animation.extended;
		}
	}

	// Apply steering angle to wheels
	wheelsToSteer.forEach(wheel => {
		wheel.rotation.y = wheel.initialRotationY + crane.steeringAngle;
	});

	// Check input
	handleKeys(delta, craneArms, crane);

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
