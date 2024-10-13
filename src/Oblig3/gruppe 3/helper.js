/**
 * Funksjoner som lager meshobjekter til dronen.
 */
import * as THREE from "three";


export function createBoxmanMesh(textureObject) {
	let mat = new THREE.MeshPhongMaterial({ map: textureObject });

	//Størrelser:
	const tW = 10, tH=10, tD=5; //torso-Width, Height, Depth
	const ruaW = 1.0;      //right upper arm width
	const rlaW = ruaW*0.7;  //right lower arm width
	const raH = tH/5.0;    //right arm height
	const raD=raH/5;	        //right arm depth
	const luaW = 6.0;       //left upper arm width
	const llaW = luaW*1.4;  //left lower arm width
	const laH = tH/10.0;    //left arm height
	const laD=laH;	        //left arm depth

	//Geometri-objekter:
	const geoTorso = new THREE.BoxGeometry(tW, tH, tD);
	const geoRUA = new THREE.BoxGeometry(ruaW, raH, raD);
	const geoRLA = new THREE.BoxGeometry(rlaW, raH, raD);
	const geoLUA = new THREE.BoxGeometry(luaW, laH, laD);
	const geoLLA = new THREE.BoxGeometry(llaW, laH, laD);

	//Rotmesh:
	const meshTorso = new THREE.Mesh(geoTorso, mat);
	meshTorso.position.set(0, 0, 0);
	meshTorso.name = 'torso';

	// *** Skriver ut .position og getWorldPosition():
	console.log("torso.position");
	console.log(meshTorso.position);
	const target = new THREE.Vector3();
	meshTorso.getWorldPosition(target);
	console.log("torso.getWorldPosition()");
	console.log(target);
	// ***

	//Right Upper Arm:
	const meshRUA = new THREE.Mesh(geoRUA, mat);
	meshRUA.name = 'rightUpperArm';
	meshRUA.animation = { angle: 0 };
	//Flytter OPP i forhold til torsoen.
	meshRUA.translateY(10);
	//Flytter til høyre = halvparten av torsoens bredde og halparten av egen bredde:
	meshRUA.translateX(0);
	meshRUA.translateZ(3)
	meshRUA.rotateY(Math.PI/2);
	meshTorso.add(meshRUA);
	const axisHelperRUA = new THREE.AxesHelper(30);
	meshRUA.add(axisHelperRUA);
	// *** Skriver ut .position og getWorldPosition():
	console.log("meshRUA.position");
	console.log(meshRUA.position);
	const target1 = new THREE.Vector3();
	meshRUA.getWorldPosition(target1);
	console.log("meshRUA.getWorldPosition()");
	console.log(target1);
	// ***

	//Right Lower Arm:
	const meshRLA = new THREE.Mesh(geoRLA, mat);
	meshRLA.name = 'rightLowerArm';
	meshRLA.animation = { angle: 0 };
	//Flytter til HØYRE = ruaW/2 og rlaW/2:
	meshRLA.translateX(0);
	//Legges til overarmen:
	meshRUA.add(meshRLA);
	const axisHelperRLA = new THREE.AxesHelper(30);
	meshRLA.add(axisHelperRLA);
	//*** Skriver ut .position og getWorldPosition():
	console.log("meshRLA.position");
	console.log(meshRLA.position);
	const target2 = new THREE.Vector3();
	meshRLA.getWorldPosition(target2);
	console.log("meshRLA.getWorldPosition()");
	console.log(target2);
	//***

	//Left Upper Arm:
	const meshLUA = new THREE.Mesh(geoLUA, mat);
	meshLUA.name = 'leftUpperArm';
	meshLUA.animation = { angle: 0 };
	meshLUA.translateY(tH / 2);	              //Flytter OPP i forhold til torsoen.
	meshLUA.translateX(-tW / 2 - luaW / 2);   //Flytter til VENSTRE i forhold til torsoen og halvparten av egen størrelse.
	meshTorso.add(meshLUA);
	//Left Lower Arm:
	const meshLLA = new THREE.Mesh(geoLLA, mat);
	meshLLA.name = 'leftLowerArm';
	meshLLA.animation = { angle: 0 };
	meshLLA.translateX(-luaW/2-llaW/2);   //Flytter til VENSTRE = -luaW/2-llaW/2
	meshLUA.add(meshLLA);        //Legges til overarmen.

	return meshTorso;
}


export function createArm(textureObject) {
	//Konteiner for hele armen:
	const baseGroup = new THREE.Group();

	let material1 = new THREE.MeshPhongMaterial({ color: 0xf6e909 });
	let material2 = new THREE.MeshPhongMaterial({ map: textureObject });

	// NEDRE DEL / ROOT / BASE:
	// Foten:
	let geometryFoot = new THREE.CylinderGeometry(20, 30, 10, 20, 5, false);
	let meshFoot = new THREE.Mesh(geometryFoot, material2);
	meshFoot.name = 'foot';
	meshFoot.position.x = 0;
	meshFoot.position.y = 5;
	meshFoot.position.z = 0;
	baseGroup.add(meshFoot);

	// SKRÅARMEN:
	let groupOddArm = createArmWithUpperJoint(1, 0, 50, material1, -Math.PI/4);
	baseGroup.add(groupOddArm);

	// NEDRE ARM (sylinder+kule):
	let groupLowerArm = createArmWithUpperJoint(2, 0, 50, material2, 0);
	baseGroup.add(groupLowerArm);

	// ØVRE ARM (sylinder+kule):
	let groupUpperArm = createArmWithUpperJoint(3, 100, 50, material2, 0);
	groupLowerArm.add(groupUpperArm);

	return baseGroup;
}

function createArmWithUpperJoint(
	id=1,
	yPosGroup=50,
	yPosCylinder=50,
	material = new THREE.MeshBasicMaterial({color: 0x0000ff}),
	xRotation=0
) {

	let armAndJointGroup = new THREE.Group();
	armAndJointGroup.position.x = 0;
	armAndJointGroup.position.y = yPosGroup;
	armAndJointGroup.position.z = 0;
	armAndJointGroup.rotation.x = xRotation;
	armAndJointGroup.name = 'armAndJointGroup'+String(id);

	let armGeometry = new THREE.CylinderGeometry(4, 4, 100, 8, 1, false);
	let mesh = new THREE.Mesh(armGeometry, material);
	mesh.castShadow = true;
	mesh.name = 'meshArm';
	mesh.position.x = 0;
	mesh.position.y = yPosCylinder;
	mesh.position.z = 0;
	armAndJointGroup.add(mesh);

	let geometryJoint = new THREE.SphereGeometry(10, 8, 6);					//radius, widthSegments, heightSegments,
	let meshJoint = new THREE.Mesh(geometryJoint, material);
	meshJoint.position.x = 0;
	meshJoint.position.y = armGeometry.parameters.height;
	meshJoint.position.z = 0;
	meshJoint.castShadow = true;
	meshJoint.name = 'joint';
	armAndJointGroup.add(meshJoint);

	return armAndJointGroup;
}
