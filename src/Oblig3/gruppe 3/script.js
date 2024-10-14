import '../../style.css';
import * as THREE from "three";
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import {addCoordSystem} from "../../../static/lib/wfa-coord.js";
import {createCraneTruckMesh} from "./helper.js";
import {createArm,} from "./helper.js";

const ri = {
    currentlyPressedKeys:[]
};

export function main() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    // Renderer:
    ri.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    ri.renderer.setSize(window.innerWidth, window.innerHeight);
    ri.renderer.setClearColor(0xBFD104, 0xff);  //farge, alphaverdi.
    ri.renderer.shadowMap.enabled = true; //NB!
    ri.renderer.shadowMapSoft = true;
    ri.renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

    // Scene
    ri.scene = new THREE.Scene();
    ri.scene.background = new THREE.Color( 0xdddddd );

    // Lyskilder
    addLights();

    // Kamera:
    ri.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    ri.camera.position.x = 230;
    ri.camera.position.y = 400;
    ri.camera.position.z = 350;
    ri.camera.up = new THREE.Vector3(0, 1, 0);
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    ri.camera.lookAt(target);

    // TrackballControls:
    ri.controls = new TrackballControls(ri.camera, ri.renderer.domElement);
    ri.controls.addEventListener( 'change', renderScene);

    // Klokke for animasjon
    ri.clock = new THREE.Clock();

    //Håndterer endring av vindusstørrelse:
    window.addEventListener('resize', onWindowResize, false);
    //Input - standard Javascript / WebGL:
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    // Sceneobjekter
    addSceneObjects();
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
    const loader = new THREE.TextureLoader();
    loader.load(
        '../../../assets/textures/metal1.jpg',
        (textureObject)=> {
            //Fortsetter her når nedlastinger er ferdig!

            let meshCraneTruck = createCraneTruckMesh(textureObject);
            meshCraneTruck.position.y = 20;
            ri.scene.add(meshCraneTruck);

            // Alternativt eget koordinatsystem:
            addCoordSystem(ri.scene);

            // Plan:
            let gPlane = new THREE.PlaneGeometry(600, 600, 10, 10);
            let mPlane = new THREE.MeshLambertMaterial({ color: 0x91aff11, side: THREE.DoubleSide, wireframe:false });
            let meshPlane = new THREE.Mesh(gPlane, mPlane);
            meshPlane.rotation.x = Math.PI / 2;
            meshPlane.receiveShadow = true;	//NB!
            ri.scene.add(meshPlane);

            // Start animasjonsløkka:
            animate(0);
        },
        undefined,
        (error)=> {
            console.log(error)
        }
    );
}

function addLights() {

    let light1 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
    light1.position.set(2, 1, 4);
    ri.scene.add(light1);

    let light2 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
    light2.position.set(-2, -1, -4);
    ri.scene.add(light2);


    //Retningsorientert lys (som gir skygge):
    let directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
    directionalLight1.position.set(0, 300, 0);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.camera.near = 0;
    directionalLight1.shadow.camera.far = 301;
    directionalLight1.shadow.camera.left = -250;
    directionalLight1.shadow.camera.right = 250;
    directionalLight1.shadow.camera.top = 250;
    directionalLight1.shadow.camera.bottom = -250;
    directionalLight1.shadow.camera.visible = true;
    //Hjelpeklasse for å vise lysets utstrekning:
    //let lightCamHelper = new THREE.CameraHelper( directionalLight1.shadow.camera );
    //ri.scene.add( lightCamHelper );
    ri.scene.add(directionalLight1);
}

function animate(currentTime) {
    window.requestAnimationFrame((currentTime) => {
        animate(currentTime);
    });
    const delta = ri.clock.getDelta();


    //Truck platform (root objektet)
    let meshCraneTruck = ri.scene.getObjectByName("platform");

    //Truck Arms
    let meshArms = []
    for(var i = 1; i < 3; i++){
        meshArms[i-1] = meshCraneTruck.getObjectByName('arm'+i, true);
        meshArms[i-1].position.z = meshArms[i-1].animation.extended;
    }
    for(var i = 3; i < 5; i++){
        meshArms[i-1] = meshCraneTruck.getObjectByName('arm'+i, true);
        meshArms[i-1].position.z = -meshArms[i-1].animation.extended;
    }

    //Sjekker input:
    handleKeys(delta, meshArms);

    //Oppdater trackball-kontrollen:
    ri.controls.update();

    //Tegner scenen med gitt kamera:
    renderScene();
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