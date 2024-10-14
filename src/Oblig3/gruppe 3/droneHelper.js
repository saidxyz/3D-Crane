/**
 * Funksjoner som lager meshobjekter til dronen.
 */
import * as THREE from "three";

export function createDroneBaseMesh(diameter=6, height=1) {
	let geometry = new THREE.BoxGeometry(20,0.5,5, 1);
	let material = new THREE.MeshPhongMaterial({/*wireframe: true,*/ color:0xAAAAAA, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	mesh.name = 'platform';
	return mesh;
}

export function createArmBaseMesh(length, height) {
	let geometry = new THREE.BoxGeometry(length,height,1);
	let material = new THREE.MeshPhongMaterial({color:0xF00D0F, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createEngineMesh(height) {
    let geometry = new THREE.CylinderGeometry(0.5,0.5,height,50);
    let material = new THREE.MeshPhongMaterial({color:0x00DDDD, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createFootMesh(height) {
	let geometry = new THREE.CylinderGeometry(0.3,0.3,height,6);
	let material = new THREE.MeshPhongMaterial({color:0xAAAAAA});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createSphereMesh(radius) {
	let geometry = new THREE.SphereGeometry(0.3,32, 16);
	let material = new THREE.MeshPhongMaterial({emissive: 0xFFFF00, color:0xEEEEEE, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createWheelMesh(radius) {
	let geometry = new THREE.TorusGeometry(1, 0.5, 10, 100);
	let material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}
export function createPassengerSetMesh() {
	let length = 12/2, width = 8/2;
	let shape = new THREE.Shape();
	shape.moveTo( 0,0 );
	shape.lineTo( 0, width );
	shape.lineTo( length, width );
	shape.lineTo( length, 0 );
	shape.lineTo( 0, 0 );

	let extrudeSettings = {
		steps: 2,
		depth: 16,
		bevelEnabled: true,
		bevelThickness: 1,
		bevelSize: 1,
		bevelOffset: 0,
		bevelSegments: 1
	};

	let geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	let mesh = new THREE.Mesh( geometry, material ) ;
	return mesh;
}
