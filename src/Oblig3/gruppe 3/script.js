import '../../style.css';
import * as THREE from "three";
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import {addCoordSystem} from "../../../static/lib/wfa-coord.js";
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
            // Plan:
            let gPlane = new THREE.PlaneGeometry(600, 600, 10, 10);
            let mPlane = new THREE.MeshLambertMaterial({ color: 0x91aff11, side: THREE.DoubleSide, wireframe:false });
            let meshPlane = new THREE.Mesh(gPlane, mPlane);
            meshPlane.rotation.x = Math.PI / 2;
            meshPlane.receiveShadow = true;	//NB!
            ri.scene.add(meshPlane);

            // Armen:
            let arm = createArm(textureObject);
            arm.position.x = -120;
            arm.position.z = -5;
            arm.name = "arm";
            arm.armYRot = 0.0;
            arm.joint1XRot = Math.PI/4;
            arm.joint2XRot = -Math.PI/4;
            ri.scene.add(arm);

            // Wire / Line:
            let groupUpperArm = arm.getObjectByName('armAndJointGroup3', true);
            let groupLowerArm = arm.getObjectByName('armAndJointGroup2', true); //***
            let groupOddArm = arm.getObjectByName('armAndJointGroup1', true);
            // Finner start- og endepunktmesh:
            const lineMeshStartPosition = groupOddArm.getObjectByName('joint');
            const lineMeshEndPosition = groupUpperArm.getObjectByName('joint');
            // Definerer Line-meshet (beståemde av to punkter):
            const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
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

    let delta = ri.clock.getDelta();
    let elapsed = ri.clock.getElapsedTime();

    //Oppdater trackball-kontrollen:
    ri.controls.update();

    let arm = ri.scene.getObjectByName("arm");
    let groupOddArm = arm.getObjectByName('armAndJointGroup1', true);
    let groupLowerArm = arm.getObjectByName('armAndJointGroup2', true);  //true = recursive...
    let groupUpperArm = arm.getObjectByName('armAndJointGroup3', true);

    // Roterer hele armen om Y-AKSEN:
    arm.rotation.y = arm.armYRot;
    // Roterer første ledd om x-aksen:
    groupLowerArm.rotation.x = arm.joint1XRot;
    // Roterer andre ledd om x-aksen:
    groupUpperArm.rotation.x = arm.joint2XRot;

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


    //Sjekker input:
    handleKeys(delta, arm);

    //Tegner scenen med gitt kamera:
    renderScene();
}

function renderScene()
{
    ri.renderer.render(ri.scene, ri.camera);
}


function onWindowResize() {
    ri.camera.aspect = window.innerWidth / window.innerHeight;
    ri.camera.updateProjectionMatrix();
    ri.renderer.setSize(window.innerWidth, window.innerHeight);
    ri.controls.handleResize();
    renderScene();
}

//Sjekker tastaturet:
function handleKeys(delta, arm) {
    let rotationSpeed = (Math.PI); // Bestemmer rotasjonshastighet.

    //Roter foten om Y-AKSEN:
    if (ri.currentlyPressedKeys['KeyA']) { //A
        arm.armYRot = arm.armYRot + (rotationSpeed * delta);
        arm.armYRot %= (Math.PI * 2); // "Rull rundt" dersom arm.armYRot >= 360 grader.
    }
    if (ri.currentlyPressedKeys['KeyD']) {	//D
        arm.armYRot = arm.armYRot - (rotationSpeed * delta);
        arm.armYRot %= (Math.PI * 2); // "Rull rundt" dersom arm.armYRot >= 360 grader.
    }

    //Roter underarmen om X-AKSEN:
    if (ri.currentlyPressedKeys['KeyS']) {	//S
        arm.joint1XRot = arm.joint1XRot + (rotationSpeed * delta);
        arm.joint1XRot %= (Math.PI * 2); // "Rull rundt" dersom arm.joint1XRot >= 360 grader.
    }
    if (ri.currentlyPressedKeys['KeyW']) {	//W
        arm.joint1XRot = arm.joint1XRot - (rotationSpeed * delta);
        arm.joint1XRot %= (Math.PI * 2); // "Rull rundt" dersom arm.joint1XRot >= 360 grader.
    }

    //Roter overarmen om X-AKSEN:
    if (ri.currentlyPressedKeys['KeyV']) { //V
        arm.joint2XRot = arm.joint2XRot + (rotationSpeed * delta);
        arm.joint2XRot %= (Math.PI * 2); // "Rull rundt" dersom arm.joint2XRot >= 360 grader.
    }
    if (ri.currentlyPressedKeys['KeyB']) {	//B
        arm.joint2XRot = arm.joint2XRot - (rotationSpeed * delta);
        arm.joint2XRot %= (Math.PI * 2); // "Rull rundt" dersom arm.joint2XRot >= 360 grader.
    }
}
