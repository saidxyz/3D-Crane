import '../../style.css';
import * as THREE from "three";

let ri = {}; // ri=renderInfo

// Her legger man til three.js koden.
export function main() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    // Renderer:
    ri.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    ri.renderer.setSize(window.innerWidth, window.innerHeight);

    // Scene
    ri.scene = new THREE.Scene();
    ri.scene.background = new THREE.Color(0xdddddd );

    // Kuben:
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshBasicMaterial({color: 0xffff00 });
    let cube = new THREE.Mesh(geometry, material);

    ri.scene.add(cube);

    // Kamera:
    ri.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    ri.camera.position.x = 3;
    ri.camera.position.y = 3;
    ri.camera.position.z = 7;

    // Start animasjonsløkka:
    animate(0);
}

function animate(currentTime) {
    window.requestAnimationFrame((currentTime) => {
        animate(currentTime);
    });
    ri.renderer.render(ri.scene, ri.camera);
}