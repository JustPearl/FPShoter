/**
 * Game Manager
 * Main game loop and state management
 */

import * as THREE from 'three';
import { CONFIG } from '../data/config.js';
import { PlayerController } from '../core/PlayerController.js';
import { WeaponSystem } from '../weapons/WeaponSystem.js';
import { EnemySystem } from '../enemies/EnemySystem.js';
import { LevelManager } from '../levels/LevelManager.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { AudioSystem } from '../audio/AudioSystem.js';
import { ENEMIES_DATA } from '../data/enemies.js';

export class GameManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        
        this.player = null;
        this.weapons = null;
        this.enemies = null;
        this.level = null;
        this.particles = null;
        this.audio = null;
        
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.score = 0;
        this.wave = 1;
        this.lastWaveTime = 0;
        
        this.isInitialized = false;
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        const container = document.getElementById('game-container');
        container.appendChild(this.renderer.domElement);
        
        // Initialize clock
        this.clock = new THREE.Clock();
        
        // Initialize systems
        this.audio = new AudioSystem();
        this.audio.init();
        
        this.level = new LevelManager(this.scene);
        this.player = new PlayerController(this.camera, this.scene);
        this.weapons = new WeaponSystem(this.camera, this.scene, this.audio);
        this.particles = new ParticleSystem(this.scene);
        this.enemies = new EnemySystem(this.scene, this.player, this.particles, this.audio);
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
        
        return this;
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
        
        // Pointer lock
        const startButton = document.getElementById('start-button');
        const startScreen = document.getElementById('start-screen');
        
        startButton.addEventListener('click', () => {
            this.startGame();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            switch(e.code) {
                case 'KeyR':
                    this.weapons.reload();
                    break;
                case 'Digit1':
                    this.weapons.switchWeapon('pistol');
                    this.updateHUD();
                    break;
                case 'Digit2':
                    this.weapons.switchWeapon('rifle');
                    this.updateHUD();
                    break;
                case 'Escape':
                    this.pauseGame();
                    break;
            }
        });
        
        // Mouse button for firing
        document.addEventListener('mousedown', (e) => {
            if (this.gameState !== 'playing') return;
            if (e.button === 0) { // Left click
                this.player.input.mouseButtons.set(0, true);
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.player.input.mouseButtons.set(0, false);
                this.weapons.isFiring = false;
            }
        });
    }
    
    startGame() {
        const startScreen = document.getElementById('start-screen');
        startScreen.style.display = 'none';
        
        // Request pointer lock
        document.body.requestPointerLock();
        
        // Initialize audio on user interaction
        this.audio.resume();
        
        // Reset game state
        this.player.reset();
        this.enemies.reset();
        this.score = 0;
        this.wave = 1;
        
        // Spawn first wave
        this.enemies.spawnWave(this.wave);
        this.lastWaveTime = performance.now();
        
        this.gameState = 'playing';
        this.updateHUD();
        
        // Start game loop
        this.animate();
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.exitPointerLock();
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.body.requestPointerLock();
        }
    }
    
    gameOver() {
        this.gameState = 'gameover';
        document.exitPointerLock();
        
        const startScreen = document.getElementById('start-screen');
        startScreen.style.display = 'flex';
        startScreen.querySelector('h1').textContent = 'GAME OVER';
        startScreen.querySelector('p').textContent = `You survived ${this.wave} waves with ${this.score} kills`;
        startScreen.querySelector('button').textContent = 'TRY AGAIN';
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.update(deltaTime);
        
        // Update weapons
        this.weapons.updateRecoil(deltaTime);
        this.weapons.updateShellCasings(deltaTime);
        
        // Update particles
        this.particles.update(deltaTime);
        
        // Handle firing
        if (this.player.input.isMouseButtonDown(0)) {
            const hitInfo = this.weapons.fire(deltaTime);
            if (hitInfo && hitInfo.hit) {
                this.handleEnemyHit(hitInfo);
            }
        }
        
        // Update enemies
        this.enemies.update(deltaTime, this.player.getPosition());
        
        // Check for enemy attacks on player
        this.checkEnemyAttacks();
        
        // Wave management
        this.checkWaveProgress();
        
        // Update HUD
        this.updateHUD();
    }
    
    handleEnemyHit(hitInfo) {
        const enemyMesh = hitInfo.object;
        while (enemyMesh.parent && !enemyMesh.userData.isEnemy) {
            enemyMesh = enemyMesh.parent;
        }
        
        if (enemyMesh.userData.isEnemy) {
            const enemy = this.enemies.getEnemyById(enemyMesh.id);
            if (enemy) {
                const weapon = this.weapons.getCurrentWeapon();
                
                // Spawn blood particles
                this.particles.spawnBlood(hitInfo.point, hitInfo.normal || new THREE.Vector3(0, 1, 0), 8);
                
                // Play hit sound
                this.audio.playEnemyHit(weapon.damage);
                
                const killed = this.enemies.takeDamage(enemy.id, weapon.damage);
                
                if (killed) {
                    this.score += ENEMIES_DATA[enemy.type].loot.score;
                    this.audio.playEnemyDeath();
                    
                    // More blood on death
                    this.particles.spawnBlood(enemy.mesh.position.clone().add(new THREE.Vector3(0, 0.5, 0)), new THREE.Vector3(0, 1, 0), 20);
                }
            }
        }
    }
    
    checkEnemyAttacks() {
        const playerPos = this.player.getPosition();
        
        this.enemies.enemies.forEach(enemy => {
            if (enemy.state === 'attack') {
                const distance = enemy.mesh.position.distanceTo(playerPos);
                const attackRange = ENEMIES_DATA[enemy.type].range;
                const now = performance.now() / 1000;
                const attackCooldown = ENEMIES_DATA[enemy.type].attackCooldown;
                
                if (distance < attackRange && now - enemy.lastAttackTime >= attackCooldown) {
                    enemy.lastAttackTime = now;
                    
                    // Damage player
                    const newHealth = this.player.takeDamage(enemy.damage);
                    this.showDamageEffect();
                    
                    if (newHealth <= 0) {
                        this.gameOver();
                    }
                }
            }
        });
    }
    
    checkWaveProgress() {
        const now = performance.now();
        
        // Check if wave is complete
        if (this.enemies.getActiveEnemies() === 0) {
            if (now - this.lastWaveTime > 3000) { // 3 second delay before next wave
                this.wave++;
                this.enemies.spawnWave(this.wave);
                this.lastWaveTime = now;
            }
        }
    }
    
    showDamageEffect() {
        const overlay = document.getElementById('damage-overlay');
        overlay.style.opacity = '0.8';
        setTimeout(() => {
            overlay.style.opacity = '0';
        }, 300);
    }
    
    updateHUD() {
        // Health
        const healthPercent = (this.player.health / CONFIG.player.maxHealth) * 100;
        document.getElementById('health-fill').style.width = `${healthPercent}%`;
        
        // Ammo
        document.getElementById('ammo-display').textContent = this.weapons.getAmmoDisplay();
        document.getElementById('weapon-name').textContent = this.weapons.getWeaponName();
        
        // Score
        document.getElementById('kill-count').textContent = this.enemies.kills;
        document.getElementById('wave-count').textContent = this.wave;
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        if (!this.isInitialized) return;
        
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);
        
        this.update(deltaTime);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    dispose() {
        if (this.level) this.level.clear();
        if (this.enemies) this.enemies.clearAll();
        if (this.particles) this.particles.clear();
        
        this.renderer.dispose();
        const container = document.getElementById('game-container');
        if (container && this.renderer.domElement) {
            container.removeChild(this.renderer.domElement);
        }
        
        this.isInitialized = false;
    }
}

export default GameManager;
