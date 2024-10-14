/**
 * Funksjoner som lager meshobjekter til dronen.
 */
import * as THREE from "three";

export function createBaseMesh(diameter=6, height=1) {
	let geometry = new THREE.BoxGeometry(20,0.5,5, 1);
	let material = new THREE.MeshPhongMaterial({/*wireframe: true,*/ color:0xAAAAAA, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createArmBaseMesh(length, height) {
	let geometry = new THREE.BoxGeometry(length,height,1);
	let material = new THREE.MeshPhongMaterial({color:0x333333, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	mesh.animation = { extended: 0 };
	return mesh;
}

export function createEngineMesh(height) {
	let geometry = new THREE.CylinderGeometry(0.5, 0.5, height, 50);
	let material = new THREE.MeshPhongMaterial({ color: 0x00DDDD, side: THREE.DoubleSide });
	let mesh = new THREE.Mesh(geometry, material);
	return mesh;
}

export function createFootMesh(height) {
	let geometry = new THREE.CylinderGeometry(0.3, 0.3, height, 6);
	let material = new THREE.MeshPhongMaterial({ color: 0xAAAAAA });
	let mesh = new THREE.Mesh(geometry, material);
	return mesh;
}

export function createWheelMesh() {
	// Tire
	let tireGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 32);
	let tireMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
	let tireMesh = new THREE.Mesh(tireGeometry, tireMaterial);
	tireMesh.rotation.z = Math.PI / 2;

	// Rim
	let rimGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.6, 32);
	let rimMaterial = new THREE.MeshPhongMaterial({ color: 0xCCCCCC });
	let rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
	tireMesh.rotation.y = Math.PI / 2;

	tireMesh.add(rimMesh);

	return tireMesh;
}


export function createPassengerSetMesh() {
	const geometry = new THREE.BoxGeometry(3.5, 3, 5.1); // Wider and longer
	const material = new THREE.MeshBasicMaterial({ color: 0xAAAAAA });
	const mesh = new THREE.Mesh(geometry, material);
	return mesh;
}


export function createRimSetMesh() {
	const geometry = new THREE.BoxGeometry(5, 1, 0.5, 32); // Cylinder shape for the rim
	const material = new THREE.MeshBasicMaterial({ color: 0xFF0D0F });
	const mesh = new THREE.Mesh(geometry, material);
	return mesh;
}
