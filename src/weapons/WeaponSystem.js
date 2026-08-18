/**
 * Weapon System
 * Handles weapon mechanics, recoil, and firing
 */

import * as THREE from 'three';
import { WEAPONS_DATA } from '../data/weapons.js';

export class WeaponSystem {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        
        this.currentWeapon = null;
        this.weapons = new Map();
        this.weaponMesh = null;
        this.muzzleFlashLight = null;
        
        // Recoil state
        this.recoilOffset = new THREE.Vector2();
        this.kickbackOffset = 0;
        this.recoilIndex = 0;
        
        // Firing state
        this.isFiring = false;
        this.lastFireTime = 0;
        this.isReloading = false;
        this.reloadStartTime = 0;
        
        // Shell casings
        this.shellCasings = [];
        
        this.setupWeapons();
        this.createWeaponModel();
    }
    
    setupWeapons() {
        // Initialize weapons from data
        Object.values(WEAPONS_DATA).forEach(weaponData => {
            this.weapons.set(weaponData.id, {
                ...weaponData,
                currentMag: weaponData.magazineSize,
                totalReserve: weaponData.reserveAmmo,
                lastFireTime: 0,
                recoilIndex: 0
            });
        });
        
        // Set default weapon
        this.switchWeapon('pistol');
    }
    
    createWeaponModel() {
        // Create weapon group attached to camera
        this.weaponGroup = new THREE.Group();
        this.camera.add(this.weaponGroup);
        
        // Position weapon in view
        this.weaponGroup.position.set(0.3, -0.25, -0.5);
        
        // Create simple weapon model
        this.createPistolModel();
        
        // Muzzle flash light
        this.muzzleFlashLight = new THREE.PointLight(0xffaa00, 0, 10);
        this.muzzleFlashLight.position.set(0, 0.1, -0.6);
        this.weaponGroup.add(this.muzzleFlashLight);
        
        // Muzzle flash sprite placeholder
        this.muzzleFlashSprite = this.createMuzzleFlashSprite();
        this.muzzleFlashSprite.visible = false;
        this.muzzleFlashSprite.position.set(0, 0.1, -0.6);
        this.weaponGroup.add(this.muzzleFlashSprite);
    }
    
    createPistolModel() {
        const material = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.3
        });
        
        const gripMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.2,
            roughness: 0.8
        });
        
        // Main body
        const bodyGeom = new THREE.BoxGeometry(0.08, 0.12, 0.25);
        this.bodyMesh = new THREE.Mesh(bodyGeom, material);
        this.bodyMesh.position.y = 0.06;
        this.weaponGroup.add(this.bodyMesh);
        
        // Barrel
        const barrelGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.15, 8);
        this.barrelMesh = new THREE.Mesh(barrelGeom, material);
        this.barrelMesh.rotation.x = Math.PI / 2;
        this.barrelMesh.position.set(0, 0.12, -0.15);
        this.weaponGroup.add(this.barrelMesh);
        
        // Grip
        const gripGeom = new THREE.BoxGeometry(0.07, 0.15, 0.08);
        this.gripMesh = new THREE.Mesh(gripGeom, gripMaterial);
        this.gripMesh.position.set(0, -0.05, 0.08);
        this.gripMesh.rotation.x = 0.2;
        this.weaponGroup.add(this.gripMesh);
        
        // Trigger guard
        const guardGeom = new THREE.TorusGeometry(0.03, 0.008, 8, 16, Math.PI);
        this.guardMesh = new THREE.Mesh(guardGeom, material);
        this.guardMesh.rotation.x = -Math.PI / 2;
        this.guardMesh.position.set(0, 0, 0.05);
        this.weaponGroup.add(this.guardMesh);
    }
    
    createRifleModel() {
        // Clear existing meshes
        while (this.weaponGroup.children.length > 0) {
            const child = this.weaponGroup.children[0];
            if (child !== this.muzzleFlashLight && child !== this.muzzleFlashSprite) {
                child.geometry?.dispose();
                child.material?.dispose();
                this.weaponGroup.remove(child);
            } else {
                break;
            }
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.7,
            roughness: 0.4
        });
        
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3728,
            metalness: 0.1,
            roughness: 0.9
        });
        
        // Receiver
        const receiverGeom = new THREE.BoxGeometry(0.1, 0.12, 0.35);
        this.bodyMesh = new THREE.Mesh(receiverGeom, material);
        this.bodyMesh.position.y = 0.06;
        this.weaponGroup.add(this.bodyMesh);
        
        // Barrel
        const barrelGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
        this.barrelMesh = new THREE.Mesh(barrelGeom, material);
        this.barrelMesh.rotation.x = Math.PI / 2;
        this.barrelMesh.position.set(0, 0.12, -0.25);
        this.weaponGroup.add(this.barrelMesh);
        
        // Stock
        const stockGeom = new THREE.BoxGeometry(0.08, 0.15, 0.3);
        this.stockMesh = new THREE.Mesh(stockGeom, woodMaterial);
        this.stockMesh.position.set(0, 0.05, 0.25);
        this.weaponGroup.add(this.stockMesh);
        
        // Handguard
        const handguardGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.25, 8);
        this.handguardMesh = new THREE.Mesh(handguardGeom, woodMaterial);
        this.handguardMesh.rotation.x = Math.PI / 2;
        this.handguardMesh.position.set(0, 0.12, -0.05);
        this.weaponGroup.add(this.handguardMesh);
        
        // Magazine
        const magGeom = new THREE.BoxGeometry(0.06, 0.2, 0.12);
        this.magMesh = new THREE.Mesh(magGeom, material);
        this.magMesh.position.set(0, -0.08, 0.05);
        this.magMesh.rotation.x = 0.1;
        this.weaponGroup.add(this.magMesh);
        
        // Sight
        const sightGeom = new THREE.BoxGeometry(0.02, 0.03, 0.02);
        this.sightMesh = new THREE.Mesh(sightGeom, material);
        this.sightMesh.position.set(0, 0.2, -0.15);
        this.weaponGroup.add(this.sightMesh);
    }
    
    createMuzzleFlashSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)');
        gradient.addColorStop(0.6, 'rgba(255, 150, 50, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        return new THREE.Sprite(material);
    }
    
    switchWeapon(weaponId) {
        if (this.isReloading) return;
        
        const weaponData = this.weapons.get(weaponId);
        if (!weaponData) return false;
        
        this.currentWeapon = weaponData;
        this.isFiring = false;
        
        // Update model
        if (weaponId === 'pistol') {
            this.createPistolModel();
            this.weaponGroup.position.set(0.3, -0.25, -0.5);
        } else if (weaponId === 'rifle') {
            this.createRifleModel();
            this.weaponGroup.position.set(0.35, -0.3, -0.6);
        }
        
        // Re-add muzzle flash elements
        this.weaponGroup.add(this.muzzleFlashLight);
        this.weaponGroup.add(this.muzzleFlashSprite);
        
        return true;
    }
    
    fire(deltaTime) {
        if (!this.currentWeapon || this.isReloading || this.currentWeapon.currentMag <= 0) {
            if (this.currentWeapon && this.currentWeapon.currentMag <= 0) {
                this.playEmptyClick();
            }
            return false;
        }
        
        const now = performance.now() / 1000;
        const timeSinceLastFire = now - this.lastFireTime;
        
        // Check fire rate
        if (timeSinceLastFire < this.currentWeapon.fireRate) {
            return false;
        }
        
        // Semi-auto check
        if (this.currentWeapon.type === 'semi-auto' && this.isFiring) {
            return false;
        }
        
        this.lastFireTime = now;
        this.isFiring = true;
        
        // Consume ammo
        this.currentWeapon.currentMag--;
        
        // Apply recoil
        this.applyRecoil();
        
        // Apply kickback
        this.applyKickback();
        
        // Muzzle flash
        this.showMuzzleFlash();
        
        // Eject shell casing
        this.ejectShellCasing();
        
        // Raycast for hit detection
        const hitInfo = this.performRaycast();
        
        return hitInfo;
    }
    
    applyRecoil() {
        const recoilData = this.currentWeapon.recoil;
        const patternIndex = this.recoilIndex % recoilData.pattern.length;
        const recoilAmount = recoilData.pattern[patternIndex];
        
        // Vertical recoil
        this.recoilOffset.y += recoilAmount;
        
        // Horizontal recoil (random left or right)
        const horizontalDir = Math.random() > 0.5 ? 1 : -1;
        this.recoilOffset.x += recoilData.horizontal * horizontalDir * (0.5 + Math.random() * 0.5);
        
        this.recoilIndex++;
    }
    
    applyKickback() {
        this.kickbackOffset += this.currentWeapon.kickback.strength;
    }
    
    showMuzzleFlash() {
        const flashData = this.currentWeapon.muzzleFlash;
        
        this.muzzleFlashLight.intensity = flashData.intensity * 5;
        this.muzzleFlashSprite.scale.setScalar(flashData.scale * (1 + Math.random() * 0.3));
        this.muzzleFlashSprite.visible = true;
        
        // Fade out
        setTimeout(() => {
            this.muzzleFlashLight.intensity = 0;
            this.muzzleFlashSprite.visible = false;
        }, flashData.duration * 1000);
    }
    
    ejectShellCasing() {
        const shellGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8);
        const shellMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.9,
            roughness: 0.2
        });
        
        const shell = new THREE.Mesh(shellGeom, shellMat);
        
        // Position at ejection port
        const ejectionPos = new THREE.Vector3(0.1, 0.1, 0);
        ejectionPos.applyMatrix4(this.weaponGroup.matrixWorld);
        
        shell.position.copy(ejectionPos);
        
        // Random rotation
        shell.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        // Velocity
        const velocity = new THREE.Vector3(
            (Math.random() - 0.3) * this.currentWeapon.shellEjection.velocity,
            Math.random() * 3 + 2,
            (Math.random() - 0.5) * 2
        );
        
        // Transform velocity to world space
        velocity.applyQuaternion(this.camera.quaternion);
        
        this.shellCasings.push({
            mesh: shell,
            velocity: velocity,
            angularVelocity: new THREE.Vector3(
                Math.random() * this.currentWeapon.shellEjection.rotation,
                Math.random() * this.currentWeapon.shellEjection.rotation,
                Math.random() * this.currentWeapon.shellEjection.rotation
            ),
            lifetime: this.currentWeapon.shellEjection.lifetime
        });
        
        this.scene.add(shell);
    }
    
    performRaycast() {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        // Add spread
        const spread = this.currentWeapon.spread * (1 + this.recoilOffset.length());
        const spreadX = (Math.random() - 0.5) * spread;
        const spreadY = (Math.random() - 0.5) * spread;
        raycaster.ray.direction.add(new THREE.Vector3(spreadX, spreadY, 0).applyQuaternion(this.camera.quaternion));
        raycaster.ray.direction.normalize();
        
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        // Filter for enemies
        const enemyIntersects = intersects.filter(hit => {
            return hit.object.userData && hit.object.userData.isEnemy;
        });
        
        if (enemyIntersects.length > 0) {
            const hit = enemyIntersects[0];
            if (hit.distance <= this.currentWeapon.range) {
                return {
                    hit: true,
                    distance: hit.distance,
                    object: hit.object,
                    point: hit.point,
                    normal: hit.face.normal
                };
            }
        }
        
        return { hit: false };
    }
    
    playEmptyClick() {
        // Visual feedback for empty click
        this.weaponGroup.position.z += 0.02;
        setTimeout(() => {
            this.weaponGroup.position.z -= 0.02;
        }, 100);
    }
    
    reload() {
        if (!this.currentWeapon || this.isReloading) return;
        
        if (this.currentWeapon.currentMag >= this.currentWeapon.magazineSize) return;
        
        if (this.currentWeapon.totalReserve <= 0) return;
        
        this.isReloading = true;
        this.reloadStartTime = performance.now() / 1000;
        
        // Reload animation
        this.weaponGroup.rotation.x = -0.5;
        
        setTimeout(() => {
            this.completeReload();
        }, this.currentWeapon.reloadTime * 1000);
    }
    
    completeReload() {
        const needed = this.currentWeapon.magazineSize - this.currentWeapon.currentMag;
        const available = Math.min(needed, this.currentWeapon.totalReserve);
        
        this.currentWeapon.currentMag += available;
        this.currentWeapon.totalReserve -= available;
        
        this.isReloading = false;
        this.weaponGroup.rotation.x = 0;
    }
    
    updateRecoil(deltaTime) {
        if (!this.currentWeapon) return;
        
        const recovery = this.currentWeapon.recoil.recovery;
        
        // Recover recoil offset
        this.recoilOffset.lerp(new THREE.Vector2(), deltaTime * recovery * 10);
        
        // Recover kickback
        this.kickbackOffset = THREE.MathUtils.lerp(
            this.kickbackOffset,
            0,
            deltaTime * this.currentWeapon.kickback.recovery * 10
        );
        
        // Apply to weapon position
        const basePos = this.currentWeapon.id === 'pistol' ? 
            new THREE.Vector3(0.3, -0.25, -0.5) : 
            new THREE.Vector3(0.35, -0.3, -0.6);
        
        this.weaponGroup.position.x = basePos.x + this.recoilOffset.x * 0.1;
        this.weaponGroup.position.y = basePos.y + this.recoilOffset.y * 0.1;
        this.weaponGroup.position.z = basePos.z - this.kickbackOffset;
        
        // Weapon sway based on recoil
        this.weaponGroup.rotation.x = -this.recoilOffset.y * 0.5;
        this.weaponGroup.rotation.y = -this.recoilOffset.x * 0.3;
    }
    
    updateShellCasings(deltaTime) {
        for (let i = this.shellCasings.length - 1; i >= 0; i--) {
            const shell = this.shellCasings[i];
            
            // Apply gravity
            shell.velocity.y -= 20 * deltaTime;
            
            // Update position
            shell.mesh.position.addScaledVector(shell.velocity, deltaTime);
            
            // Update rotation
            shell.mesh.rotation.x += shell.angularVelocity.x * deltaTime;
            shell.mesh.rotation.y += shell.angularVelocity.y * deltaTime;
            shell.mesh.rotation.z += shell.angularVelocity.z * deltaTime;
            
            // Ground collision
            if (shell.mesh.position.y < 0) {
                shell.mesh.position.y = 0;
                shell.velocity.y *= -0.3;
                shell.velocity.x *= 0.8;
                shell.velocity.z *= 0.8;
                shell.angularVelocity.multiplyScalar(0.5);
            }
            
            // Lifetime
            shell.lifetime -= deltaTime;
            if (shell.lifetime <= 0) {
                this.scene.remove(shell.mesh);
                shell.mesh.geometry.dispose();
                shell.mesh.material.dispose();
                this.shellCasings.splice(i, 1);
            }
        }
    }
    
    getCurrentWeapon() {
        return this.currentWeapon;
    }
    
    getAmmoDisplay() {
        if (!this.currentWeapon) return '0 / 0';
        return `${this.currentWeapon.currentMag} / ${this.currentWeapon.totalReserve}`;
    }
    
    getWeaponName() {
        return this.currentWeapon ? this.currentWeapon.name : '';
    }
}

export default WeaponSystem;
