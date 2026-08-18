/**
 * Player Controller
 * Handles player movement, camera control, and physics
 */

import * as THREE from 'three';
import { CONFIG } from '../data/config.js';
import { InputManager } from './InputManager.js';

export class PlayerController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.input = new InputManager();
        
        // Player state
        this.position = new THREE.Vector3(0, 2, 0);
        this.velocity = new THREE.Vector3();
        this.rotation = { x: 0, y: 0 };
        this.isGrounded = false;
        this.health = CONFIG.player.maxHealth;
        this.isDead = false;
        
        // Movement state
        this.moveSpeed = CONFIG.player.walkSpeed;
        this.headBobTimer = 0;
        this.headBobOffset = new THREE.Vector3();
        
        // Setup
        this.setupCamera();
        this.setupCollision();
    }
    
    setupCamera() {
        this.camera.rotation.order = 'YXZ';
        this.camera.position.copy(this.position);
        this.camera.position.y += CONFIG.camera.viewOffset.y;
    }
    
    setupCollision() {
        // Simple ground plane collision
        this.groundLevel = 0;
    }
    
    update(deltaTime) {
        if (this.isDead) return;
        
        const moveVector = this.input.getMovementVector();
        const isSprinting = this.input.isSprinting();
        
        // Calculate speed
        const speed = isSprinting ? CONFIG.player.runSpeed : CONFIG.player.walkSpeed;
        
        // Get camera direction (ignore Y for movement)
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        forward.y = 0;
        forward.normalize();
        
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        right.y = 0;
        right.normalize();
        
        // Calculate movement direction
        const direction = new THREE.Vector3();
        direction.addScaledVector(forward, -moveVector.z);
        direction.addScaledVector(right, moveVector.x);
        
        // Apply movement
        if (direction.length() > 0) {
            direction.normalize();
            
            // Apply velocity with inertia
            this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, direction.x * speed, deltaTime * 10);
            this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, direction.z * speed, deltaTime * 10);
            
            // Head bobbing
            if (CONFIG.player.headBobbing && this.isGrounded) {
                this.headBobTimer += deltaTime * CONFIG.player.headBobSpeed;
                this.headBobOffset.x = Math.sin(this.headBobTimer) * CONFIG.player.headBobAmount * (isSprinting ? 2 : 1);
                this.headBobOffset.y = Math.abs(Math.cos(this.headBobTimer * 2)) * CONFIG.player.headBobAmount * (isSprinting ? 2 : 1);
            } else {
                this.headBobOffset.lerp(new THREE.Vector3(), deltaTime * 5);
            }
        } else {
            // Friction when not moving
            this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, 0, deltaTime * 5);
            this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, 0, deltaTime * 5);
            this.headBobOffset.lerp(new THREE.Vector3(), deltaTime * 5);
        }
        
        // Apply gravity
        if (!this.isGrounded) {
            this.velocity.y -= CONFIG.player.gravity * deltaTime;
        }
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Ground collision
        if (this.position.y <= this.groundLevel) {
            this.position.y = this.groundLevel;
            this.velocity.y = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
        
        // Update camera position
        this.camera.position.copy(this.position);
        this.camera.position.add(this.headBobOffset);
        this.camera.position.y += CONFIG.camera.viewOffset.y;
        
        // Mouse look
        const mouseMove = this.input.getMouseMove();
        this.rotation.y -= mouseMove.x * CONFIG.player.mouseSensitivity;
        this.rotation.x -= mouseMove.y * CONFIG.player.mouseSensitivity;
        
        // Clamp vertical rotation
        this.rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.rotation.x));
        
        // Apply rotation
        this.camera.rotation.x = this.rotation.x;
        this.camera.rotation.y = this.rotation.y;
    }
    
    jump() {
        if (this.isGrounded) {
            this.velocity.y = CONFIG.player.jumpForce;
            this.isGrounded = false;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
        }
        return this.health;
    }
    
    heal(amount) {
        this.health = Math.min(this.health + amount, CONFIG.player.maxHealth);
        return this.health;
    }
    
    getPosition() {
        return this.position.clone();
    }
    
    getDirection() {
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        direction.normalize();
        return direction;
    }
    
    reset() {
        this.position.set(0, 2, 0);
        this.velocity.set(0, 0, 0);
        this.rotation = { x: 0, y: 0 };
        this.health = CONFIG.player.maxHealth;
        this.isDead = false;
        this.isGrounded = false;
        this.camera.position.copy(this.position);
        this.camera.rotation.set(0, 0, 0);
    }
}

export default PlayerController;
