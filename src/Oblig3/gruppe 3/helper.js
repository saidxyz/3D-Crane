/**
 * Funksjoner som lager meshobjekter til dronen.
 */
import * as THREE from "three";

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
