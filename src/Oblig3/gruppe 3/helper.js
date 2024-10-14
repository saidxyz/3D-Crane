/**
 * Funksjoner som lager meshobjekter til dronen.
 */
import * as THREE from "three";


export function createCraneTruckMesh(textureObject) {
	let mat = new THREE.MeshPhongMaterial({ map: textureObject });

	//Størrelser:
	// Truck platform-Width, Height, Depth
	const platW = 100, platH= 4, platD = 40;

	// Truck Arm
	const armW = 2, armH = 2, armD = 30;

	// Truck Leg
	const legW = 2, legH = 20, legD = 2;


	const ruaW = 1.0;      //right upper arm width
	const rlaW = ruaW*0.7;  //right lower arm width
	const raH = platH/5.0;    //right arm height
	const raD=raH/5;	        //right arm depth
	const luaW = 6.0;       //left upper arm width
	const llaW = luaW*1.4;  //left lower arm width
	const laH = platH/10.0;    //left arm height
	const laD=laH;	        //left arm depth

	//Geometri-objekter:
	const geoPlatform = new THREE.BoxGeometry(platW, platH, platD);

	const geoArm = new THREE.BoxGeometry(armW, armH, armD);

	const geoLeg = new THREE.BoxGeometry(armW, armH, armD);

	const geoRUA = new THREE.BoxGeometry(ruaW, raH, raD);
	const geoRLA = new THREE.BoxGeometry(rlaW, raH, raD);
	const geoLUA = new THREE.BoxGeometry(luaW, laH, laD);
	const geoLLA = new THREE.BoxGeometry(llaW, laH, laD);

	//Rotmesh:
	const meshPlatform = new THREE.Mesh(geoPlatform, mat);
	meshPlatform.position.set(0, 0, 0);
	meshPlatform.name = 'platform';

	// Truck Arms
	const meshArm1 = new THREE.Mesh(geoArm, mat);
	meshArm1.name = 'arm1';
	meshArm1.animation = { extended: 10 };
	meshArm1.translateX(platW/3);

	const meshArm2 = new THREE.Mesh(geoArm, mat);
	meshArm2.name = 'arm2';
	meshArm2.animation = { extended: 10 };
	meshArm2.translateX(-platW/3);

	const meshArm3 = new THREE.Mesh(geoArm, mat);
	meshArm3.name = 'arm3';
	meshArm3.animation = { extended: 10 };
	meshArm3.translateX(platW/3);

	const meshArm4 = new THREE.Mesh(geoArm, mat);
	meshArm4.name = 'arm4';
	meshArm4.animation = { extended: 10 };
	meshArm4.translateX(-platW/3);

	meshPlatform.add(meshArm1)
	meshPlatform.add(meshArm2)
	meshPlatform.add(meshArm3)
	meshPlatform.add(meshArm4)



	return meshPlatform;
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
