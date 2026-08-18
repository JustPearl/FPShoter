/**
 * Level Manager
 * Creates the Swedish military compound environment
 */

import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

export class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.lighting = null;
        
        this.createEnvironment();
        this.createCompound();
    }
    
    createEnvironment() {
        // Ground
        const groundGeom = new THREE.PlaneGeometry(500, 500);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x3d4a3d,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.objects.push(ground);
        
        // Snow patches (Swedish winter)
        for (let i = 0; i < 50; i++) {
            const snowGeom = new THREE.CircleGeometry(5 + Math.random() * 10, 8);
            const snowMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.8,
                metalness: 0.1,
                transparent: true,
                opacity: 0.7
            });
            
            const snow = new THREE.Mesh(snowGeom, snowMat);
            snow.rotation.x = -Math.PI / 2;
            snow.position.set(
                (Math.random() - 0.5) * 400,
                0.01,
                (Math.random() - 0.5) * 400
            );
            this.scene.add(snow);
            this.objects.push(snow);
        }
        
        // Fog
        this.scene.fog = new THREE.FogExp2(
            CONFIG.world.fogColor,
            1 / CONFIG.world.fogFar
        );
        
        // Lighting
        this.setupLighting();
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(
            CONFIG.world.hemiLightSky,
            CONFIG.world.ambientLight
        );
        this.scene.add(ambientLight);
        
        // Hemisphere light (Swedish overcast sky)
        const hemiLight = new THREE.HemisphereLight(
            CONFIG.world.hemiLightSky,
            CONFIG.world.hemiLightGround,
            0.6
        );
        this.scene.add(hemiLight);
        
        // Directional light (sun/moon)
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(-50, 100, -50);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 500;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        this.scene.add(dirLight);
        
        this.lighting = { ambient: ambientLight, hemi: hemiLight, dir: dirLight };
    }
    
    createCompound() {
        // Main barracks building
        this.createBuilding(0, 0, -30, 40, 8, 20, 0x5a5a5a);
        
        // Watchtower
        this.createWatchTower(-25, 0, -45);
        this.createWatchTower(25, 0, -45);
        
        // Perimeter fence
        this.createFence(-60, 0, -60, 120, 0, 0);
        this.createFence(-60, 0, -60, 0, 0, 120);
        this.createFence(60, 0, -60, 120, 0, 0);
        this.createFence(-60, 0, 60, 0, 0, 120);
        
        // Guard booths
        this.createGuardBooth(-55, 0, -55);
        this.createGuardBooth(55, 0, -55);
        
        // Barricades
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 35;
            this.createBarricade(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
        }
        
        // Crates and obstacles
        this.createScatteredCrates();
        
        // Vehicles
        this.createMilitaryVehicle(-15, 0, -20);
        this.createMilitaryVehicle(15, 0, -20);
        
        // Trees (pine trees typical of Sweden)
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 80 + Math.random() * 40;
            this.createPineTree(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
        }
    }
    
    createBuilding(x, y, z, width, height, depth, color) {
        const buildingGroup = new THREE.Group();
        
        // Main structure
        const geom = new THREE.BoxGeometry(width, height, depth);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.3
        });
        
        const building = new THREE.Mesh(geom, mat);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        buildingGroup.add(building);
        
        // Roof
        const roofGeom = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, 4, 4);
        const roofMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = height + 2;
        roof.rotation.y = Math.PI / 4;
        buildingGroup.add(roof);
        
        // Windows
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0x1a2a3a,
            emissive: 0x1a2a3a,
            emissiveIntensity: 0.3,
            roughness: 0.1,
            metalness: 0.8
        });
        
        const windowGeom = new THREE.PlaneGeometry(2, 3);
        const windowPositions = [
            { x: width/2 - 5, z: depth/2 + 0.1, rotY: 0 },
            { x: -width/2 + 5, z: depth/2 + 0.1, rotY: 0 },
            { x: width/2 - 5, z: -depth/2 - 0.1, rotY: Math.PI },
            { x: -width/2 + 5, z: -depth/2 - 0.1, rotY: Math.PI }
        ];
        
        windowPositions.forEach(pos => {
            const window = new THREE.Mesh(windowGeom, windowMat);
            window.position.set(pos.x, height * 0.6, pos.z);
            window.rotation.y = pos.rotY;
            buildingGroup.add(window);
        });
        
        buildingGroup.position.set(x, y, z);
        this.scene.add(buildingGroup);
        this.objects.push(buildingGroup);
    }
    
    createWatchTower(x, y, z) {
        const towerGroup = new THREE.Group();
        
        // Legs
        const legGeom = new THREE.BoxGeometry(0.3, 10, 0.3);
        const legMat = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.6,
            metalness: 0.4
        });
        
        const legPositions = [
            { x: -1.5, z: -1.5 },
            { x: 1.5, z: -1.5 },
            { x: -1.5, z: 1.5 },
            { x: 1.5, z: 1.5 }
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeom, legMat);
            leg.position.set(pos.x, 5, pos.z);
            towerGroup.add(leg);
        });
        
        // Platform
        const platformGeom = new THREE.BoxGeometry(4, 0.2, 4);
        const platform = new THREE.Mesh(platformGeom, legMat);
        platform.position.y = 10;
        towerGroup.add(platform);
        
        // Railing
        const railGeom = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const rail = new THREE.Mesh(railGeom, legMat);
            rail.position.set(Math.cos(angle) * 1.8, 10.5, Math.sin(angle) * 1.8);
            towerGroup.add(rail);
        }
        
        // Roof
        const roofGeom = new THREE.ConeGeometry(3, 2, 4);
        const roofMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.8
        });
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = 12;
        roof.rotation.y = Math.PI / 4;
        towerGroup.add(roof);
        
        towerGroup.position.set(x, y, z);
        this.scene.add(towerGroup);
        this.objects.push(towerGroup);
    }
    
    createFence(x, y, z, lengthX, lengthY, lengthZ) {
        const fenceGroup = new THREE.Group();
        
        const postGeom = new THREE.BoxGeometry(0.2, 3, 0.2);
        const postMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.7,
            metalness: 0.3
        });
        
        const meshGeom = new THREE.PlaneGeometry(lengthX || lengthZ, 2.5);
        const meshMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8,
            metalness: 0.5,
            side: THREE.DoubleSide
        });
        
        const posts = Math.floor((lengthX || lengthZ) / 3) + 1;
        for (let i = 0; i < posts; i++) {
            const post = new THREE.Mesh(postGeom, postMat);
            if (lengthX) {
                post.position.set(x - lengthX/2 + i * 3, 1.5, z);
            } else {
                post.position.set(x, 1.5, z - lengthZ/2 + i * 3);
            }
            fenceGroup.add(post);
        }
        
        const mesh = new THREE.Mesh(meshGeom, meshMat);
        if (lengthX) {
            mesh.position.set(0, 1.5, 0);
        } else {
            mesh.position.set(0, 1.5, 0);
            mesh.rotation.y = Math.PI / 2;
        }
        fenceGroup.add(mesh);
        
        fenceGroup.position.set(x, y, z);
        this.scene.add(fenceGroup);
        this.objects.push(fenceGroup);
    }
    
    createGuardBooth(x, y, z) {
        const boothGeom = new THREE.BoxGeometry(3, 3, 3);
        const boothMat = new THREE.MeshStandardMaterial({
            color: 0x4a5c4a,
            roughness: 0.6,
            metalness: 0.4
        });
        
        const booth = new THREE.Mesh(boothGeom, boothMat);
        booth.position.set(x, 1.5, z);
        booth.castShadow = true;
        this.scene.add(booth);
        this.objects.push(booth);
    }
    
    createBarricade(x, y, z) {
        const barricadeGroup = new THREE.Group();
        
        const sandbagGeom = new THREE.CylinderGeometry(0.4, 0.5, 0.3, 8);
        const sandbagMat = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.9,
            metalness: 0.1
        });
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j <= i; j++) {
                const bag = new THREE.Mesh(sandbagGeom, sandbagMat);
                bag.position.set(j * 0.5 - i * 0.25, i * 0.25, 0);
                bag.rotation.z = (Math.random() - 0.5) * 0.3;
                barricadeGroup.add(bag);
            }
        }
        
        barricadeGroup.position.set(x, y, z);
        barricadeGroup.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(barricadeGroup);
        this.objects.push(barricadeGroup);
    }
    
    createScatteredCrates() {
        const crateGeom = new THREE.BoxGeometry(1, 1, 1);
        const crateMat = new THREE.MeshStandardMaterial({
            color: 0x4a3728,
            roughness: 0.8,
            metalness: 0.2
        });
        
        for (let i = 0; i < 20; i++) {
            const crate = new THREE.Mesh(crateGeom, crateMat);
            crate.position.set(
                (Math.random() - 0.5) * 80,
                0.5,
                (Math.random() - 0.5) * 80
            );
            crate.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            crate.castShadow = true;
            this.scene.add(crate);
            this.objects.push(crate);
        }
    }
    
    createMilitaryVehicle(x, y, z) {
        const vehicleGroup = new THREE.Group();
        
        // Body
        const bodyGeom = new THREE.BoxGeometry(3, 2, 5);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x3a4a3a,
            roughness: 0.5,
            metalness: 0.6
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 1.5;
        body.castShadow = true;
        vehicleGroup.add(body);
        
        // Cabin
        const cabinGeom = new THREE.BoxGeometry(2.5, 1.5, 2);
        const cabin = new THREE.Mesh(cabinGeom, bodyMat);
        cabin.position.set(0, 2.75, 1.5);
        cabin.castShadow = true;
        vehicleGroup.add(cabin);
        
        // Wheels
        const wheelGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
        const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9,
            metalness: 0.3
        });
        
        const wheelPositions = [
            { x: -1.6, z: -1.5 },
            { x: 1.6, z: -1.5 },
            { x: -1.6, z: 1.5 },
            { x: 1.6, z: 1.5 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeom, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.5, pos.z);
            vehicleGroup.add(wheel);
        });
        
        vehicleGroup.position.set(x, y, z);
        vehicleGroup.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(vehicleGroup);
        this.objects.push(vehicleGroup);
    }
    
    createPineTree(x, y, z) {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkGeom = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
        const trunkMat = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Foliage (multiple cones)
        const foliageMat = new THREE.MeshStandardMaterial({
            color: 0x2a4a2a,
            roughness: 0.8,
            metalness: 0.1
        });
        
        for (let i = 0; i < 4; i++) {
            const size = 3 - i * 0.5;
            const foliageGeom = new THREE.ConeGeometry(size, 3, 8);
            const foliage = new THREE.Mesh(foliageGeom, foliageMat);
            foliage.position.y = 3 + i * 2;
            foliage.castShadow = true;
            treeGroup.add(foliage);
        }
        
        treeGroup.position.set(x, y, z);
        this.scene.add(treeGroup);
        this.objects.push(treeGroup);
    }
    
    clear() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        this.objects = [];
    }
}

export default LevelManager;
