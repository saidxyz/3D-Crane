/**
 * Funksjoner som lager meshobjekter til dronen.
 */
import * as THREE from "three";

export function createBaseMesh(diameter=6, height=1) {
	let geometry = new THREE.BoxGeometry(20,0.5,5, 1);
	let material = new THREE.MeshPhongMaterial({/*wireframe: true,*/ color:0xeeeeee, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createArmBaseMesh(length, height) {
	let geometry = new THREE.BoxGeometry(length,height,1);
	let material = new THREE.MeshPhongMaterial({color:0x333333, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	mesh.castShadow = true;
	mesh.animation = { extended: 0 };
	return mesh;
}

export function createEngineMesh(height) {
	let geometry = new THREE.CylinderGeometry(0.5, 0.5, height, 50);
	let material = new THREE.MeshPhongMaterial({ color: 0x000000, side: THREE.DoubleSide });
	let mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	return mesh;
}

export function createFootMesh(height) {
	let geometry = new THREE.CylinderGeometry(0.3, 0.3, height, 6);
	let material = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
	let mesh = new THREE.Mesh(geometry, material);
	return mesh;
}

export function createWheelMesh() {
	// Tire
	let tireGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 32);
	let tireMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
	let tireMesh = new THREE.Mesh(tireGeometry, tireMaterial);
	tireMesh.castShadow = true;
	tireMesh.rotation.z = Math.PI / 2;

	// Rim
	let rimGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.6, 32);
	let rimMaterial = new THREE.MeshPhongMaterial({ color: 0xCCCCCC });
	let rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
	tireMesh.rotation.y = Math.PI / 2;
	rimMesh.castShadow = true;

	tireMesh.add(rimMesh);

	return tireMesh;
}


export function createPassengerSetMesh(environmentMapTexture) {
	const geometry = new THREE.BoxGeometry(3.5, 3, 5.1); // Wider and longer
	//const material = new THREE.MeshBasicMaterial({ color: 0xAAAAAA });
	const material1 = new THREE.MeshStandardMaterial();
	material1.metalness =0.7;
	material1.roughness=0.01;
	const material2 = new THREE.MeshStandardMaterial();
	material2.metalness =0.7;
	material2.roughness=0.01;
	material2.envMap = environmentMapTexture;

	const mesh = new THREE.Mesh(geometry, material1);
	mesh.castShadow = true;

	// Objekter:
	const geoPlane = new THREE.PlaneGeometry(2, 1.5, 10, 10);
	const meshPlane = new THREE.Mesh(geoPlane, material2);
	meshPlane.name="carwindow";
	meshPlane.translateZ(2.9)
	meshPlane.translateY(0.5)

	mesh.add(meshPlane)

	return mesh;
}


export function createRimSetMesh() {
	const geometry = new THREE.BoxGeometry(5, 1, 0.5, 32); // Cylinder shape for the rim
	const material = new THREE.MeshBasicMaterial({ color: 0xFF0D0F });
	const mesh = new THREE.Mesh(geometry, material);
	return mesh;
}

export function createCrane() {
	//Konteiner for hele armen:
	const baseGroup = new THREE.Group();

	let material1 = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
	let material2 = new THREE.MeshPhongMaterial({ color: 0x000000 /*map: textureObject*/ });
	let material3 = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
	const materialStandardEnvironmentMapping = new THREE.MeshStandardMaterial();
	materialStandardEnvironmentMapping.metalness =0.9;
	materialStandardEnvironmentMapping.roughness=0.01;
	//materialStandardEnvironmentMapping.envMap = environmentMapTexture;

	// NEDRE DEL / ROOT / BASE:
	// Foten:
	let geometryFoot = new THREE.CylinderGeometry(50, 70, 50, 20, 5, false);
	let meshFoot = new THREE.Mesh(geometryFoot, materialStandardEnvironmentMapping);
	meshFoot.name = 'foot';
	meshFoot.castShadow = true;
	meshFoot.position.x = 0;
	meshFoot.position.y = 25;
	meshFoot.position.z = 0;
	baseGroup.add(meshFoot);

	// SKRÅARMEN:
	let groupOddArm = createArmWithUpperJoint(1, 0, 50, material3, Math.PI/2, 50);
	baseGroup.add(groupOddArm);

	// NEDRE ARM (sylinder+kule):
	let groupLowerArm = createArmWithUpperJoint(2, 25, 50, material3, 0);
	baseGroup.add(groupLowerArm);

	// ØVRE ARM (sylinder+kule):
	let groupUpperArm = createArmWithUpperJoint(3, 100, 50, material2, 0);
	groupLowerArm.add(groupUpperArm);

	// Snor ned
	let groupHookWire = createArmWithUpperJoint(4, 100, 20, material1, Math.PI/2, 50,1,1, true);
	groupUpperArm.add(groupHookWire);

	return baseGroup;
}

function createArmWithUpperJoint(
	id=1,
	yPosGroup=50,
	yPosCylinder=50,
	material = new THREE.MeshBasicMaterial({color: 0x0000ff}),
	xRotation=0,
	height = 100,
	radiusTop = 15,
	radiusBottom = 15,
	hook = false
) {

	let armAndJointGroup = new THREE.Group();
	armAndJointGroup.position.x = 0;
	armAndJointGroup.position.y = yPosGroup;
	armAndJointGroup.position.z = 0;
	armAndJointGroup.rotation.x = xRotation;
	armAndJointGroup.name = 'armAndJointGroup' + String(id);

	let armGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8, 1, false);
	let mesh = new THREE.Mesh(armGeometry, material);
	mesh.castShadow = true;
	mesh.name = 'meshArm';
	mesh.position.x = 0;
	mesh.position.y = yPosCylinder;
	mesh.position.z = 0;
	armAndJointGroup.add(mesh);

	if (!hook) {
		let geometryJoint = new THREE.SphereGeometry(10, 8, 6);					//radius, widthSegments, heightSegments,
		let meshJoint = new THREE.Mesh(geometryJoint, material);
		meshJoint.position.x = 0;
		meshJoint.position.y = armGeometry.parameters.height;
		meshJoint.position.z = 0;
		meshJoint.castShadow = true;
		meshJoint.name = 'joint';
		armAndJointGroup.add(meshJoint);
	}else{
		const geometry = new THREE.TorusGeometry( 10, 2, 15, 7, 5 );
		const material = new THREE.MeshBasicMaterial( { color: 0x555555 } );
		const meshHook = new THREE.Mesh( geometry, material );
		meshHook.position.x = 0;
		meshHook.position.y = armGeometry.parameters.height + 4;
		meshHook.position.z = 0;
		meshHook.castShadow = true;
		meshHook.name = 'hook';
		meshHook.extended = 1;
		armAndJointGroup.add(meshHook);
	}

	return armAndJointGroup;
}