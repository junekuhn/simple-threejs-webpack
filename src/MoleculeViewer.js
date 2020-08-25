//usnign  https://cobwwweb.com/export-es6-class-globally-webpack

import * as THREE from 'three';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';
import GLTFLoader from 'three-gltf-loader';

class MoleculeViewer {
       //default parameters
    //model = Ethyne;

    //variables on this page
    //viewers,loader

    constructor(model) {
        this.model = model;
        this.scene = new THREE.Scene();

        //events
        this.ready = () => {
            this.dispatchEvent({
                type: 'ready',
                message: 'The Model has Loaded!'
            });
        }

        this.createScene();
    }

    createScene() {
        var scene = this.scene;
        var ready = this.ready;
        let i = viewers.length;
        var template = document.getElementById("template").text;
        var content = document.getElementById("content");
        var container = document.getElementById("scene-container");

        // make a list item
        var element = document.createElement("div");
        element.className = "list-item";
        element.classList.add("resizeable");
        element.innerHTML = template.replace('$', i + 1);
        element.id = i;

        // Look up the element that represents the area
        // we want to render the scene
        this.scene.userData.element = element.querySelector(".scene");
        
        container.appendChild(element.querySelector(".scene"));
        content.appendChild(element);


        var raycaster = new THREE.Raycaster();
        this.scene.userData.raycaster = raycaster;
        var camera = new THREE.PerspectiveCamera(50, 1, 1, 10);
        camera.position.z = 2;
        this.scene.userData.camera = camera;

        var controls = new OrbitControls(this.scene.userData.camera, this.scene.userData.element);
        controls.minDistance = 2;
        controls.maxDistance = 5;
        controls.enablePan = false;
        //controls.enableZoom = false;
        this.scene.userData.controls = controls;

        if (loader) {
            loader.load(this.model, function (gltf) {

                gltf.scene.scale.set(9, 9, 9);

                scene.add(gltf.scene);

                scene.userData.model = gltf.scene;

                //dispatch event
                ready();

            }, undefined, function (error) {

                console.error(error);

            });
        } else {
            loader = new GLTFLoader();
            loader.load(this.model, function (gltf) {

                gltf.scene.scale.set(9, 9, 9);

                scene.add(gltf.scene);

                scene.userData.model = gltf.scene;

                //dispatch event
                ready();

            }, undefined, function (error) {

                console.error(error);

            });
        }

        this.scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444));

        var light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(1, 1, 1);
        this.scene.add(light);


        //add listeners per scene
        for (var j = 0; j < element.childNodes.length; j++) {

            switch (element.childNodes[j].className) {

                case "side":

                    element.childNodes[j].addEventListener('click', () => {
                        this.sideView();
                    });
                    break;

                case "front":

                    element.childNodes[j].addEventListener('click', () => {
                        this.frontView();
                    });
                    break;

                case "top":

                    element.childNodes[j].addEventListener('click', () => {
                        this.topView();
                    });
                    break;

                case "toggle":

                    element.childNodes[j].addEventListener('click', () => {
                        this.toggleGeometry();
                    });

                    break;

                case "screen":

                    element.childNodes[j].addEventListener('click', () => {
                        this.fullscreen();
                    })

                    break;

                default:

            }
        }

        element.addEventListener('keypress', (e) => {

            //listen for spacebar
            if (e.keyCode == 32) {
                activeViewer = this;
            }
        });

        element.addEventListener('click', (e) => {
            activeViewer = this;
        });



        //add the viewer to the list
        viewers.push(this);
    }

    sideView() {

        let thisCamera = this.scene.userData.camera;
        let thisModel = this.scene.userData.model;

        //reset the camera
        thisModel.rotation.set(0, 0, 0);
        thisCamera.position.set(0, 0, 2);
        thisCamera.lookAt(0, 0, 0);

    }

    topView() {

        let thisCamera = this.scene.userData.camera;
        let thisModel = this.scene.userData.model;

        //reset the camera
        thisModel.rotation.set(0, 0, 0);
        thisCamera.position.set(0, 2, 0);
        thisCamera.lookAt(0, 0, 0);

    }

    frontView() {

        let thisCamera = this.scene.userData.camera;
        let thisModel = this.scene.userData.model;

        //reset the camera
        thisModel.rotation.set(0, 0, 0);
        thisCamera.position.set(-2, 0, 0);
        thisCamera.lookAt(0, 0, 0);

    }

    toggleGeometry() {

        //maybe in the future this method will take a mesh as input
        //                    let model = this.scene.userData.model;
        //                    model.visible = !model.visible;

        console.log(this.scene.children[2].children[0].children[5]);

        let firstNode = this.scene.children[2].children[0].children[5];
        firstNode.visible = !firstNode.visible;

    }

    get meshes() {
        //currently the gltf.scene is the third thing added to the scene
        let children = this.scene.children[2].children[0].children;
        let meshes = [];

        for (var q = 0; q < children.length; q++) {
            if (children[q].constructor == THREE.Mesh) {
                meshes.push(children[q]);
            }
        }

        return meshes;
    }

    get objects() {
        //currently the gltf.scene is the third thing added to the scene
        let children = this.scene.children[2].children[0].children;
        let objects = [];

        for (var q = 0; q < children.length; q++) {
            if (children[q].constructor == THREE.Object3D) {
                objects.push(children[q]);
            }
        }

        return objects;

    }

    modifyColor(mesh, color) {
        //find the material and color properties
        if (mesh.constructor != THREE.Mesh) {
            throw new Error("you can only change the colors of meshes");
        }

        mesh.material.color.set(color);
    }

    changeColorScheme(pairs) {

        let entries = Object.entries(pairs);

        //input is pairs of meshes with the color you want to change them to
        for (var [mesh, color] of entries) {
            this.modifyColor(mesh, color);
        }
    }

    swapMaterial(mesh) {
        if (mesh.constructor != THREE.Mesh) {
            throw new Error("you can only change the material of meshes");
        }

        //some materials
        const phongMaterial = new THREE.MeshPhongMaterial({
            color: 0x555555,
            specular: 0xffffff,
            shininess: 50
        });
        const basicMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 1,
            wireframe: true
        });

        mesh.material = basicMaterial;

        //mesh.material.needsUpdate = true;
    }

    getMeshId(mesh) {
        if (mesh.constructor != THREE.Mesh) {
            throw new Error("Only accepts THREE.Mesh");
        }

        return mesh.name;
    }

    get materials() {
        let meshes = this.meshes;
        let materials = [];

        for (let u = 0; u < meshes.length; u++) {
            materials.push(meshes[u].material)
        }

        return materials;
    }

    fullscreen() {

        if (!fullscreen) {
            //put all scenes except this one into a different viewers list
            for (let mv of viewers) {
                if (mv !== this) {
                    hidden.push(mv)
                }
            }
            //overlay buttons, name, and list to the viewport
            //enable the viewport to take up the whole screen
            let element = this.scene.userData.element;
            element.classList.remove("scene");
            document.querySelector('html').classList.add('fullscreen');
            document.querySelector('#content').classList.add('fullscreen');
            element.classList.add("fullscreen");
            element.value = "Exit Fullscreen";
            //element.webkitRequestFullscreen();  //chrome
            //make an exitFullscreen option available
            fullscreen = true;

        } else {

            for (let mv of hidden) {
                viewers.push(mv)
            }

            let element = this.scene.userData.element;
            element.classList.add("scene");
            document.querySelector('html').classList.remove('fullscreen');
            document.querySelector('#content').classList.add('fullscreen');
            element.classList.remove("fullscreen");
            element.value = "Fullscreen";

            fullscreen = false;

        }
    }
}

export default MoleculeViewer
