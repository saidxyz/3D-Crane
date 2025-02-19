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
	createRimSetMesh,
	createCrane
} from "./helper.js";

const ri = {
	currentlyPressedKeys: {}
};

export function main() {
	const canvas = document.createElement('canvas');
	document.body.appendChild(canvas);

	// Renderer:
	ri.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
	ri.renderer.setSize(window.innerWidth, window.innerHeight);

	// Add shadows
	ri.renderer.shadowMap.enabled = true; //NB!
	ri.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
function handleKeys(delta, crane) {
	let rotationSpeed = (Math.PI); // Bestemmer rotasjonshastighet.

	//Roter underarmen om X-AKSEN:
	if (ri.currentlyPressedKeys['Digit1']) {	//1
		crane.crane.extended += 0.05
		if (crane.crane.extended > 2) {
			crane.crane.extended = 2;
		}
	}
	if (ri.currentlyPressedKeys['KeyQ']) {	//Q
		crane.crane.extended -= 0.05
		if (crane.crane.extended < 1) {
			crane.crane.extended = 1;
		}
	}

	//Roter underarmen om X-AKSEN:
	if (ri.currentlyPressedKeys['Digit2']) {	//2
		crane.crane.joint1XRot = crane.crane.joint1XRot + (rotationSpeed * delta);
		crane.crane.joint1XRot %= (Math.PI * 2); // "Rull rundt" dersom arm.joint1XRot >= 360 grader.
	}
	if (ri.currentlyPressedKeys['KeyW']) {	//W
		crane.crane.joint1XRot = crane.crane.joint1XRot - (rotationSpeed * delta);
		crane.crane.joint1XRot %= (Math.PI * 2); // "Rull rundt" dersom arm.joint1XRot >= 360 grader.
	}

	//Roter foten om Y-AKSEN:
	if (ri.currentlyPressedKeys['Digit3']) { //3
		crane.crane.armYRot = crane.crane.armYRot + (rotationSpeed * delta);
		crane.crane.armYRot %= (Math.PI * 2); // "Rull rundt" dersom arm.armYRot >= 360 grader.
	}
	if (ri.currentlyPressedKeys['KeyE']) {	//E
		crane.crane.armYRot = crane.crane.armYRot - (rotationSpeed * delta);
		crane.crane.armYRot %= (Math.PI * 2); // "Rull rundt" dersom arm.armYRot >= 360 grader.
	}

	// Arms:
	if (ri.currentlyPressedKeys['Digit4']) { // 4
		for (let arm of crane.craneArms) {
			arm.animation.extended += 0.2;
			if (arm.animation.extended > 5) {
				arm.animation.extended = 5;
			}
		}
	}
	if (ri.currentlyPressedKeys['KeyR']) { // R
		for (let arm of crane.craneArms) {
			arm.animation.extended -= 0.2;
			if (arm.animation.extended < 0) {
				arm.animation.extended = 0;
			}
		}
	}

	// Legs
	if (ri.currentlyPressedKeys['Digit5']) { // 5
		for (let leg of crane.craneLegs) {
			leg.animation.extended += 0.05;
			if (leg.animation.extended > 1.8) {
				leg.animation.extended = 1.8;
			}
		}
	}
	if (ri.currentlyPressedKeys['KeyT']) { // T
		for (let leg of crane.craneLegs) {
			leg.animation.extended -= 0.05;
			if (leg.animation.extended < 1) {
				leg.animation.extended = 1;
			}
		}
	}

	// Legs
	if (ri.currentlyPressedKeys['Digit6']) { // 6
		crane.crane.wireExtended += 0.05;
		if (crane.crane.wireExtended > 1.8) {
			crane.crane.wireExtended = 1.8;
		}
	}
	if (ri.currentlyPressedKeys['KeyY']) { // Y
		crane.crane.wireExtended -= 0.05;
		if (crane.crane.wireExtended < 1) {
			crane.crane.wireExtended = 1;
		}
	}

	// Steering
	if (ri.currentlyPressedKeys['Digit7']) {
		// Turn left
		crane.steeringAngle += 0.02; // Adjust increment as needed
		if (crane.steeringAngle > crane.maxSteeringAngle) {
			crane.steeringAngle = crane.maxSteeringAngle;
		}
	}
	if (ri.currentlyPressedKeys['KeyU']) {
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

	// Laster først nødvendige teksturer:
	const cubeTextureLoader = new THREE.CubeTextureLoader();
	cubeTextureLoader
		.setPath('../../../assets/cubemaps/GardenNook/')
		.load(
		[
			'../../../assets/cubemaps/GardenNook/px.png',   //positiv x (høyre)
			'../../../assets/cubemaps/GardenNook/nx.png',   //negativ x (venstre)
			'../../../assets/cubemaps/GardenNook/py.png',   //positiv y (opp)
			'../../../assets/cubemaps/GardenNook/ny.png',   //negativ y (ned)
			'../../../assets/cubemaps/GardenNook/pz.png',   //positiv z (ut)
			'../../../assets/cubemaps/GardenNook/nz.png',   //negativ z (inn)
		],
		(environmentMapTexture)=> {
			//Fortsetter her når nedlastinger er ferdig!

			let material = new THREE.MeshStandardMaterial({side: THREE.DoubleSide, wireframe: false});
			material.roughness = 0.4;

			//Plan:
			let geometryPlane = new THREE.PlaneGeometry(200, 200);
			let meshPlane = new THREE.Mesh(geometryPlane, material);
			meshPlane.receiveShadow = true;         //Merk!
			meshPlane.rotation.x = Math.PI / 2;
			ri.scene.add(meshPlane);

			let crane = createCraneTruck(environmentMapTexture);
			crane.name = "platform";
			crane.castShadow = true;       //Merk!
			crane.animation = {
				posX: 0,
				posY: 0,
				rotationAngleY: 0
			};
			crane.position.y = 3;
			ri.scene.add(crane);

			// Start animasjonsløkka:
			animate(0);
		},
		undefined,
		(error)=> {
			console.log(error)
		}
	);

	// animate(0);
}

function createCraneTruck(environmentMapTexture) {
	// Crane body configuration
	const craneBaseDiameter = 5;
	const craneHeight = 0.7;
	const backWheelOffset = 2;

	// Create crane base
	let craneBase = createBaseMesh(craneBaseDiameter, craneHeight);

	// Remember craneLegs
	let craneLegs = []

	// Add crane arms
	let craneArms = addCraneArms(craneBase, craneBaseDiameter, craneHeight, craneLegs);

	// Add wheels and get references to the wheels to be steered
	let wheelsToSteer = addWheels(craneBase, backWheelOffset);

	// Add crane to cranetruck
	let crane = createCrane(environmentMapTexture);
	crane.scale.x = 0.05
	crane.scale.y = 0.05
	crane.scale.z = 0.05
	crane.position.x = 5;
	crane.position.z = 0;
	crane.position.y = 0;
	crane.name = "crane";
	crane.armYRot = 0.0;
	crane.joint1XRot = Math.PI/4;
	crane.extended = 1;
	crane.wireExtended = 1;
	craneBase.add(crane);

	// Wire / Line:
	let groupUpperArm = crane.getObjectByName('armAndJointGroup3', true);
	let groupLowerArm = crane.getObjectByName('armAndJointGroup2', true); //***
	let groupOddArm = crane.getObjectByName('armAndJointGroup1', true);
	// Finner start- og endepunktmesh:
	const lineMeshStartPosition = groupOddArm.getObjectByName('joint');
	const lineMeshEndPosition = groupUpperArm.getObjectByName('joint');
	// Definerer Line-meshet (beståemde av to punkter):
	const lineMaterial = new THREE.LineBasicMaterial( { color: 0x555555 } );
	const points = [];
	const startPoint = new THREE.Vector3();
	const endPoint = new THREE.Vector3();
	// NB! Bruker world-position:
	lineMeshStartPosition.getWorldPosition(startPoint);
	lineMeshEndPosition.getWorldPosition(endPoint);
	points.push(startPoint);
	points.push(endPoint);
	const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
	const wireMesh = new THREE.Line( lineGeometry, lineMaterial );
	wireMesh.name = "wireMesh";
	// NB! Linemeshet legges til scene-objektet.
	ri.scene.add(wireMesh);

	// Add passenger and rim components
	addPassengerAndRim(craneBase, environmentMapTexture);

	// Store craneArms and wheelsToSteer in craneBase for later reference
	craneBase.craneArms = craneArms;
	craneBase.crane = crane;
	craneBase.wire = crane.getObjectByName('hook');
	craneBase.craneLegs = craneLegs;
	craneBase.wheelsToSteer = wheelsToSteer;

	// Initialize steering properties
	craneBase.steeringAngle = 0;
	craneBase.maxSteeringAngle = Math.PI / 3; // Maximum steering angle (60 degrees)

	return craneBase;
}

function addCraneArms(craneBase, craneBaseDiameter, craneHeight, craneLegs) {
	let angles = [Math.PI / 2, Math.PI / 2, Math.PI + Math.PI / 2, Math.PI + Math.PI / 2];
	let offsets = [0, 9.5, 9.5, 0];

	// Array to hold references to the crane arms
	let craneArms = [];

	for (let i = 1; i <= 4; i++) {
		let craneArm = createCraneArm(craneBase, craneBaseDiameter, craneHeight, i, angles[i - 1], offsets[i - 1], craneLegs);
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


function addPassengerAndRim(craneBase, environmentMapTexture) {
	const passenger = createPassengerSetMesh(environmentMapTexture);
	passenger.position.set(-11, 1, -0);
	craneBase.add(passenger);

	const rim = createRimSetMesh(); // Corrected function name for consistency
	rim.position.set(-13, 0, 0);
	rim.rotation.y = Math.PI / 2;
	craneBase.add(rim);
}


function createCraneArm(base, craneDiameter, craneHeight, armNumber, angle, x = 0, craneLegs) {
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
	armFoot.animation = { extended: 1 };
	armFoot.translateX(craneDiameter / 2);
	armFoot.translateY(-1.45);
	armBase.add(armFoot);
	craneLegs.push(armFoot)

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
	let showHelpers = false
	//TODO: implement lights correctly!
	//** RETNINGSORIENTERT LYS (som gir skygge):
	let directionalLight = new THREE.DirectionalLight(0x11ff00, 0.3);
	directionalLight.visible = true;
	directionalLight.position.set(0, 20, 0);
	directionalLight.castShadow = true;     //Merk!
	// Viser lyskilden:
	let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
	directionalLightHelper.visible = false;
	ri.scene.add(directionalLightHelper);
	// Viser lyskildekamera (hva lyskilden "ser")
	const directionalLightCamera = new THREE.CameraHelper(directionalLight.shadow.camera);
	directionalLightCamera.visible = false;
	ri.scene.add(directionalLightCamera);

	// For å gi hele kranbilen skygge
	directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;
	directionalLight.shadow.camera.near = 0;
	directionalLight.shadow.camera.far = 21;
	directionalLight.shadow.camera.left = -15;
	directionalLight.shadow.camera.right = 15;
	directionalLight.shadow.camera.top = 15;
	directionalLight.shadow.camera.bottom = -15;

	ri.scene.add(directionalLight);

	let light1 = new THREE.DirectionalLight(0xffffff, 1.0);
	light1.position.set(40, 10, -10);
	light1.castShadow = true;     //Merk!
	ri.scene.add(light1);
	let light1Helper = new THREE.DirectionalLightHelper(light1)
	light1Helper.visible = false;
	ri.scene.add(light1Helper);
	let light1Camera = new THREE.CameraHelper(light1.shadow.camera)
	light1Camera.visible = false;
	ri.scene.add(light1Camera);

	let light2 = new THREE.DirectionalLight(0xffffff, 1.0);
	light2.position.set(-2, -1, -4);
	ri.scene.add(light2);

	let light3 = new THREE.DirectionalLight(0xffffff, 1.0);
	light3.position.set(100, 300, 300);
	light3.target.position.set(0, 0, 0);
	ri.scene.add(light3);

	//** SPOTLIGHT (penumbra = skarpe kanter dersom 0, mer diffus ved økende verdi):
	const spotLight1 = new THREE.SpotLight(0xffffff, 0.5, 500, Math.PI*0.3, 0, 0);
	spotLight1.visible = true;
	spotLight1.castShadow = true;
	spotLight1.shadow.camera.near = 10;
	spotLight1.shadow.camera.far = 30;
	spotLight1.position.set(-13, 3.5, 2);
	spotLight1.target.position.set(-100,0,0)
	ri.scene.add(spotLight1);
	// Viser lyskilden:
	const spotLightHelper1 = new THREE.SpotLightHelper( spotLight1 );
	spotLightHelper1.visible = false;
	ri.scene.add( spotLightHelper1 );
	// Viser lyskildekamera (hva lyskilden "ser")
	const spotLightCameraHelper1 = new THREE.CameraHelper(spotLight1.shadow.camera);
	spotLightCameraHelper1.visible = false;
	ri.scene.add(spotLightCameraHelper1);

	//** SPOTLIGHT (penumbra = skarpe kanter dersom 0, mer diffus ved økende verdi):
	const spotLight2 = new THREE.SpotLight(0xffffff, 0.5, 500, Math.PI*0.3, 0, 0);
	spotLight2.visible = true;
	spotLight2.castShadow = true;
	spotLight2.shadow.camera.near = 10;
	spotLight2.shadow.camera.far = 30;
	spotLight2.position.set(-13, 3.5, -2);
	spotLight2.target.position.set(-100,0,0)
	ri.scene.add(spotLight2);
	// Viser lyskilden:
	const spotLightHelper2 = new THREE.SpotLightHelper( spotLight2 );
	spotLightHelper2.visible = false;
	ri.scene.add( spotLightHelper2 );
	// Viser lyskildekamera (hva lyskilden "ser")
	const spotLightCameraHelper2 = new THREE.CameraHelper(spotLight2.shadow.camera);
	spotLightCameraHelper2.visible = false;
	ri.scene.add(spotLightCameraHelper2);
	window.onkeydown = function(event) {
		if(event.code === "Digit8"){
			spotLightCameraHelper1.visible = !spotLightCameraHelper1.visible
			spotLightHelper1.visible = !spotLightHelper1.visible;
			spotLightCameraHelper2.visible = !spotLightCameraHelper2.visible
			spotLightHelper2.visible = !spotLightHelper2.visible;

		}
		if(event.code === "Digit9"){
			directionalLightHelper.visible = !directionalLightHelper.visible;
			directionalLightCamera.visible = !directionalLightCamera.visible
			light1Helper.visible = !light1Helper.visible
			light1Camera.visible = !light1Camera.visible
		}
	}
}

function animate(currentTime) {
	window.requestAnimationFrame(animate);

	const delta = ri.clock.getDelta();

	let crane = ri.scene.getObjectByName('platform');

	let craneArms = crane.craneArms;
	let craneLegs = crane.craneLegs;
	let wheelsToSteer = crane.wheelsToSteer;

	// Update positions of the crane arms
	for (let i = 0; i < craneArms.length; i++) {
		if (i < 2) {
			craneArms[i].position.z = -craneArms[i].animation.extended;
		} else {
			craneArms[i].position.z = craneArms[i].animation.extended;
		}
	}
	for (let i = 0; i < craneLegs.length; i++) {
		craneLegs[i].scale.y = craneLegs[i].animation.extended;
	}

	// Apply steering angle to wheels
	wheelsToSteer.forEach(wheel => {
		wheel.rotation.y = wheel.initialRotationY + crane.steeringAngle;
	});

	let arm = crane.crane;
	let groupOddArm = arm.getObjectByName('armAndJointGroup1', true);
	let groupLowerArm = arm.getObjectByName('armAndJointGroup2', true);  //true = recursive...
	let groupUpperArm = arm.getObjectByName('armAndJointGroup3', true);
	let groupHookWire = arm.getObjectByName('armAndJointGroup4', true);

	// Roterer hele armen om Y-AKSEN:
	arm.rotation.y = arm.armYRot;
	// Roterer kranarmen om x-aksen:
	groupLowerArm.rotation.x = arm.joint1XRot;
	// Utvider/trekker sammen krana:
	groupUpperArm.scale.y = arm.extended;
	// strekker ut/trekker inn vaier
	groupHookWire.rotation.x = Math.PI - arm.joint1XRot;
	groupHookWire.scale.y = arm.wireExtended;

	// Henter start- og endepunkt-mesh for å endre Line-geometrien:
	const lineMeshStartPosition = groupOddArm.getObjectByName('joint');
	const lineMeshEndPosition = groupUpperArm.getObjectByName('joint');
	// Henter Line-meshet:
	let wireLineMesh = ri.scene.getObjectByName('wireMesh', true);
	// Henter world-position for start og endepunkt til vaieren:
	const lineVertexPositions = wireLineMesh.geometry.attributes.position.array;

	const lineStartPos = new THREE.Vector3();
	lineMeshStartPosition.getWorldPosition(lineStartPos);
	lineVertexPositions[0] = lineStartPos.x;
	lineVertexPositions[1] = lineStartPos.y;
	lineVertexPositions[2] = lineStartPos.z;

	const lineEndPos = new THREE.Vector3();
	lineMeshEndPosition.getWorldPosition(lineEndPos);
	lineVertexPositions[3] = lineEndPos.x;
	lineVertexPositions[4] = lineEndPos.y;
	lineVertexPositions[5] = lineEndPos.z;
	wireLineMesh.geometry.attributes.position.needsUpdate = true;
	wireLineMesh.geometry.computeBoundingBox();
	wireLineMesh.geometry.computeBoundingSphere();

	// Check input
	handleKeys(delta, crane);

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
