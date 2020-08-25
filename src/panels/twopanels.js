import MoleculeViewer from '../MoleculeViewer.js';
import GLTFLoader from 'three-gltf-loader';
import Ethylene from '../models/ethylene.gltf';
import Ethyne from '../models/ethyne.gltf';
import Methane from '../models/Methane.gltf';
import MethaneSm from '../models/Methane_sm.gltf';
import * as THREE from 'three';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';

window.loader = new GLTFLoader();
const models = [Ethylene, Ethyne, Methane, MethaneSm];
let canvas;
const tooltip = document.getElementById('tooltip');
let selected = null;
window.viewers = [];
let hidden = [],
    viewer,
    renderer;
let mouse = new THREE.Vector2(),
    INTERSECTED;
window.fullscreen = false;
window.activeViewer = null;


setupKeyControls();
init();
animate();

function init() {

    canvas = document.getElementById("c");
    var content = document.getElementById("content");
    var addObject = document.getElementById('add-object');

    addObject.addEventListener('click', () => {
        viewer = new MoleculeViewer(Ethyne);
        Object.assign(MoleculeViewer.prototype, THREE.EventDispatcher.prototype);

        viewer.addEventListener('ready', (e) => {
            //            console.log(e);
            //            console.log(viewer.meshes);
            //viewer.modifyColor(viewer.meshes[0], new THREE.Color(0xff00ff));
            viewer.swapMaterial(viewer.meshes[Math.floor(Math.random() * (viewer.meshes.length - 1))])

            let sceneEl = viewer.scene.userData.element;

            sceneEl.addEventListener('intersected', (e) => {
                // console.log(e.detail)
            });

            sceneEl.addEventListener('not-intersected', (e) => {
                //console.log(e.detail)
            });

            //add meshes to unordered list
            let meshes = viewer.meshes;
            for (let mesh of meshes) {

                let li = document.createElement('li');
                li.innerHTML = mesh.name;

                let ul = content.parentNode;
                ul.appendChild(li);
            }
        })
    });

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });

    renderer.setClearColor(0xffffff, 1);
    renderer.setPixelRatio(window.devicePixelRatio);

    //add listeners
    document.addEventListener('mousemove', onDocumentMouseMove, false);
}


function onDocumentMouseMove(event) {

    event.preventDefault();

    mouse.x = event.clientX;
    mouse.y = event.clientY;

}

//i need to have the correct thing selected without using the mouse

function setupKeyControls() {
    document.onkeydown = function (e) {
        switch (e.keyCode) {

            //backspace, delete, or esc
            case 37:
                //if a scene has been selected with spacebar
                if (activeViewer) {
                    let activeModel = activeViewer.scene.userData.model;
                    activeModel.rotation.y += 0.25;
                }
                break;
            case 39:
                if (activeViewer) {
                    let activeModel = activeViewer.scene.userData.model;
                    activeModel.rotation.y += -0.25;
                }
                break;
            default:
                break;
        }
    };
}


function animate() {

    render();
    requestAnimationFrame(animate);

}

function render() {

    updateSize();

    canvas.style.transform = `translateY(${window.scrollY}px)`;

    renderer.setClearColor(0xffffff);
    renderer.setScissorTest(false);
    renderer.clear();

    renderer.setClearColor(0xe0e0e0);
    renderer.setScissorTest(true);

    viewers.forEach(function (viewer) {
        // get the element that is a place holder for where we want to
        // draw the scene
        var element = viewer.scene.userData.element;

        // get its position relative to the page's viewport
        var rect = element.getBoundingClientRect();

        // check if it's offscreen. If so skip it
        if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
            rect.right < 0 || rect.left > renderer.domElement.clientWidth) {

            return; // it's off screen

        }

        // set the viewport
        var width = rect.right - rect.left;
        var height = rect.bottom - rect.top;
        var left = rect.left;

        //not sure why I have to correct this but it's 8 pixels off
        var bottom = renderer.domElement.clientHeight - rect.bottom;

        renderer.setViewport(left, bottom, width, height);
        renderer.setScissor(left, bottom, width, height);

        var camera = viewer.scene.userData.camera;

        camera.aspect = width / height; // not changing in this example
        camera.updateProjectionMatrix();

//        tooltip.style.top = mouse.y + 10;
//        tooltip.style.left = mouse.x + 10;

        //scene.userData.controls.update();
        var raycaster = viewer.scene.userData.raycaster;
        var divMouse = new THREE.Vector2();

        //if mouse is in scene
        if (mouse.x > rect.left && mouse.y > rect.top &&
            mouse.x < rect.right && mouse.y < rect.bottom) {

            //translate mouse position to inside scene
            let positionX = mouse.x - rect.left;
            let positionY = mouse.y - rect.top;

            //map from pixels to (-1, 1) float
            divMouse.x = (positionX / width) * 2 - 1;
            divMouse.y = -(positionY / height) * 2 + 1;

            raycaster.setFromCamera(divMouse, camera);
        }


        var intersects = raycaster.intersectObjects(viewer.scene.children, true);

        if (intersects.length > 0) {

            if (INTERSECTED != intersects[0].object) {

                if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

                INTERSECTED = intersects[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                INTERSECTED.material.color.setHex(0xff0000);

                //emit intersected event
                var intersectedEvent = new CustomEvent('intersected', {
                    detail: INTERSECTED
                });
                element.dispatchEvent(intersectedEvent);


               // tooltip.style.opacity = 1;


            }

        } else {

            if (INTERSECTED) {
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                var intersectedEvent = new CustomEvent('not-intersected', {
                    detail: INTERSECTED
                });
                element.dispatchEvent(intersectedEvent);

                //tooltip.style.opacity = 0;
            }

            INTERSECTED = null;

        }

        renderer.render(viewer.scene, camera);

    });

}


function updateSize() {

    var width = canvas.clientWidth;
    var height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {

        renderer.setSize(width, height, false);

    }

}
