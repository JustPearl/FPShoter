/**
 * Enemy System
 * Handles enemy AI, spawning, and behavior
 */

import * as THREE from 'three';
import { ENEMIES_DATA } from '../data/enemies.js';

export class EnemySystem {
    constructor(scene, player, particles, audio) {
        this.scene = scene;
        this.player = player;
        this.particles = particles;
        this.audio = audio;
        
        this.enemies = [];
        this.enemyMeshes = new Map();
        this.spawnPoints = [];
        this.wave = 1;
        this.kills = 0;
        this.isSpawning = false;
        
        this.setupSpawnPoints();
    }
    
    setupSpawnPoints() {
        // Define spawn points around the compound
        const spawnPositions = [
            new THREE.Vector3(-50, 0, -50),
            new THREE.Vector3(50, 0, -50),
            new THREE.Vector3(-50, 0, 50),
            new THREE.Vector3(50, 0, 50),
            new THREE.Vector3(-70, 0, 0),
            new THREE.Vector3(70, 0, 0),
            new THREE.Vector3(0, 0, -70),
            new THREE.Vector3(0, 0, 70),
            new THREE.Vector3(-40, 0, -60),
            new THREE.Vector3(40, 0, -60),
            new THREE.Vector3(-40, 0, 60),
            new THREE.Vector3(40, 0, 60)
        ];
        
        this.spawnPoints = spawnPositions;
    }
    
    spawnEnemy(type = 'zombie', position = null) {
        const enemyData = ENEMIES_DATA[type];
        if (!enemyData) return null;
        
        // Create enemy mesh
        const enemy = this.createEnemyMesh(type, enemyData);
        
        // Set random spawn position if not provided
        if (!position) {
            const spawnPoint = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
            enemy.position.copy(spawnPoint);
        } else {
            enemy.position.copy(position);
        }
        
        enemy.position.y = enemyData.model.height / 2;
        
        // Add to scene
        this.scene.add(enemy);
        
        // Store enemy data
        const enemyObj = {
            id: Math.random().toString(36).substr(2, 9),
            type: type,
            mesh: enemy,
            health: enemyData.health,
            maxHealth: enemyData.health,
            damage: enemyData.damage,
            speed: enemyData.speed,
            state: 'wander',
            stateTimer: 0,
            wanderTarget: null,
            attackCooldown: 0,
            lastAttackTime: 0
        };
        
        this.enemies.push(enemyObj);
        return enemyObj;
    }
    
    createEnemyMesh(type, data) {
        const group = new THREE.Group();
        
        // Body
        const bodyGeom = new THREE.CapsuleGeometry(data.model.radius, data.model.height - data.model.radius * 2, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: data.model.color,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = data.model.height / 2;
        group.add(body);
        
        // Head
        const headSize = data.model.radius * 1.5;
        const headGeom = new THREE.SphereGeometry(headSize, 8, 8);
        const headMat = new THREE.MeshStandardMaterial({
            color: data.model.color,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = data.model.height - headSize * 0.5;
        group.add(head);
        
        // Eyes (glowing for demons)
        if (data.model.emissive) {
            const eyeGeom = new THREE.SphereGeometry(headSize * 0.2, 8, 8);
            const eyeMat = new THREE.MeshStandardMaterial({
                color: data.model.emissive,
                emissive: data.model.emissive,
                emissiveIntensity: 2
            });
            
            const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
            leftEye.position.set(-headSize * 0.4, data.model.height - headSize * 0.3, headSize * 0.8);
            group.add(leftEye);
            
            const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
            rightEye.position.set(headSize * 0.4, data.model.height - headSize * 0.3, headSize * 0.8);
            group.add(rightEye);
        }
        
        // Arms
        const armGeom = new THREE.CapsuleGeometry(data.model.radius * 0.4, data.model.height * 0.3, 4, 8);
        const armMat = new THREE.MeshStandardMaterial({
            color: data.model.color,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const leftArm = new THREE.Mesh(armGeom, armMat);
        leftArm.position.set(-data.model.radius * 1.5, data.model.height * 0.7, data.model.radius * 0.5);
        leftArm.rotation.x = Math.PI / 3;
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeom, armMat);
        rightArm.position.set(data.model.radius * 1.5, data.model.height * 0.7, data.model.radius * 0.5);
        rightArm.rotation.x = Math.PI / 3;
        group.add(rightArm);
        
        // Mark as enemy
        group.userData = { isEnemy: true, enemyType: type };
        
        // Store references for animation
        group.userData.leftArm = leftArm;
        group.userData.rightArm = rightArm;
        
        return group;
    }
    
    spawnWave(waveNumber) {
        if (this.isSpawning) return;
        this.isSpawning = true;
        
        const zombieCount = waveNumber * 3;
        const demonCount = Math.floor(waveNumber / 2);
        const bruteCount = Math.floor(waveNumber / 3);
        
        let spawned = 0;
        const totalToSpawn = zombieCount + demonCount + bruteCount;
        
        const spawnInterval = setInterval(() => {
            if (spawned >= totalToSpawn) {
                clearInterval(spawnInterval);
                this.isSpawning = false;
                return;
            }
            
            const rand = Math.random();
            let type = 'zombie';
            if (rand > 0.7 && demonCount > 0) {
                type = 'demon';
            } else if (rand > 0.9 && bruteCount > 0) {
                type = 'brute';
            }
            
            this.spawnEnemy(type);
            spawned++;
        }, 1000);
    }
    
    update(deltaTime, playerPos) {
        const enemiesToRemove = [];
        
        this.enemies.forEach((enemy, index) => {
            // Update state machine
            this.updateEnemyState(enemy, deltaTime, playerPos);
            
            // Update mesh position
            enemy.mesh.position.lerp(enemy.targetPosition || enemy.mesh.position, deltaTime * 5);
            
            // Look at player when chasing
            if (enemy.state === 'chase' || enemy.state === 'attack') {
                enemy.mesh.lookAt(playerPos.x, enemy.mesh.position.y, playerPos.z);
            }
            
            // Animate arms
            this.animateEnemyArms(enemy, deltaTime);
            
            // Check if dead
            if (enemy.health <= 0) {
                enemiesToRemove.push(index);
            }
        });
        
        // Remove dead enemies
        for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
            const index = enemiesToRemove[i];
            const enemy = this.enemies[index];
            
            this.scene.remove(enemy.mesh);
            enemy.mesh.geometry?.dispose();
            enemy.mesh.material?.dispose();
            
            this.enemies.splice(index, 1);
            this.kills++;
        }
    }
    
    updateEnemyState(enemy, deltaTime, playerPos) {
        const distance = enemy.mesh.position.distanceTo(playerPos);
        const detectionRange = ENEMIES_DATA[enemy.type].detectionRange;
        
        switch (enemy.state) {
            case 'wander':
                enemy.stateTimer -= deltaTime;
                
                // Check if player detected
                if (distance < detectionRange) {
                    enemy.state = 'chase';
                    return;
                }
                
                // Wander logic
                if (enemy.stateTimer <= 0 || !enemy.wanderTarget) {
                    enemy.stateTimer = 2 + Math.random() * 3;
                    
                    // Random wander point
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 10 + Math.random() * 20;
                    enemy.wanderTarget = new THREE.Vector3(
                        enemy.mesh.position.x + Math.cos(angle) * radius,
                        0,
                        enemy.mesh.position.z + Math.sin(angle) * radius
                    );
                }
                
                if (enemy.wanderTarget) {
                    const direction = new THREE.Vector3().subVectors(enemy.wanderTarget, enemy.mesh.position);
                    direction.y = 0;
                    direction.normalize();
                    
                    const wanderSpeed = ENEMIES_DATA[enemy.type].behavior.wanderSpeed;
                    enemy.mesh.position.addScaledVector(direction, wanderSpeed * deltaTime);
                    
                    // Look at wander target
                    enemy.mesh.lookAt(enemy.wanderTarget.x, enemy.mesh.position.y, enemy.wanderTarget.z);
                    
                    // Check if reached
                    if (direction.length() < 1) {
                        enemy.wanderTarget = null;
                    }
                }
                break;
                
            case 'chase':
                // Check if lost player
                if (distance > detectionRange * 1.5) {
                    enemy.state = 'wander';
                    enemy.wanderTarget = null;
                    return;
                }
                
                // Chase player
                const direction = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position);
                direction.y = 0;
                direction.normalize();
                
                const chaseSpeed = ENEMIES_DATA[enemy.type].behavior.chaseSpeed;
                enemy.mesh.position.addScaledVector(direction, chaseSpeed * deltaTime);
                
                // Attack range check
                const attackRange = ENEMIES_DATA[enemy.type].range;
                if (distance < attackRange) {
                    enemy.state = 'attack';
                }
                break;
                
            case 'attack':
                // Check if out of range
                const attackRange2 = ENEMIES_DATA[enemy.type].range;
                if (distance > attackRange2 * 1.5) {
                    enemy.state = 'chase';
                    return;
                }
                
                // Attack cooldown
                const now = performance.now() / 1000;
                const attackCooldown = ENEMIES_DATA[enemy.type].attackCooldown;
                
                if (now - enemy.lastAttackTime >= attackCooldown) {
                    // Perform attack
                    enemy.lastAttackTime = now;
                    // Damage will be handled by game manager
                }
                break;
        }
        
        // Store target position for smooth movement
        enemy.targetPosition = enemy.mesh.position.clone();
    }
    
    animateEnemyArms(enemy, deltaTime) {
        const leftArm = enemy.mesh.userData.leftArm;
        const rightArm = enemy.mesh.userData.rightArm;
        
        if (enemy.state === 'chase') {
            // Arms forward when chasing
            leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, Math.PI / 2, deltaTime * 5);
            rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, Math.PI / 2, deltaTime * 5);
        } else if (enemy.state === 'attack') {
            // Attack animation
            const time = performance.now() / 1000;
            const attackSpeed = 5;
            leftArm.rotation.x = Math.sin(time * attackSpeed) * 0.5;
            rightArm.rotation.x = Math.cos(time * attackSpeed) * 0.5;
        } else {
            // Arms down when wandering
            leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, Math.PI / 3, deltaTime * 2);
            rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, Math.PI / 3, deltaTime * 2);
        }
    }
    
    takeDamage(enemyId, damage) {
        const enemy = this.enemies.find(e => e.id === enemyId);
        if (!enemy) return false;
        
        enemy.health -= damage;
        
        // Flash effect on hit
        enemy.mesh.children.forEach(child => {
            if (child.material) {
                const originalColor = child.material.color.clone();
                child.material.color.setHex(0xffffff);
                setTimeout(() => {
                    child.material.color.copy(originalColor);
                }, 100);
            }
        });
        
        // Play hit sound
        if (this.audio) {
            this.audio.playEnemyHit(damage);
        }
        
        // Spawn blood particles
        if (this.particles) {
            const hitPos = enemy.mesh.position.clone().add(new THREE.Vector3(0, enemy.mesh.userData.height || 1, 0));
            this.particles.spawnBlood(hitPos, new THREE.Vector3(0, 1, 0), 5);
        }
        
        return enemy.health <= 0;
    }
    
    getEnemyById(id) {
        return this.enemies.find(e => e.id === id);
    }
    
    getActiveEnemies() {
        return this.enemies.length;
    }
    
    clearAll() {
        this.enemies.forEach(enemy => {
            this.scene.remove(enemy.mesh);
        });
        this.enemies = [];
    }
    
    reset() {
        this.clearAll();
        this.wave = 1;
        this.kills = 0;
    }
}

export default EnemySystem;
