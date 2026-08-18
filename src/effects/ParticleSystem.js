/**
 * Particle System
 * Handles blood, smoke, sparks, and environmental particles
 */

import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.bloodParticles = [];
        this.smokeParticles = [];
        this.sparkParticles = [];
        
        // Particle textures cache
        this.textures = {};
        this.createTextures();
    }
    
    createTextures() {
        // Create circular gradient texture for particles
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        this.textures.circle = new THREE.CanvasTexture(canvas);
        
        // Blood splatter texture
        const bloodCanvas = document.createElement('canvas');
        bloodCanvas.width = 128;
        bloodCanvas.height = 128;
        const bloodCtx = bloodCanvas.getContext('2d');
        
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const radius = Math.random() * 15 + 5;
            bloodCtx.beginPath();
            bloodCtx.arc(x, y, radius, 0, Math.PI * 2);
            bloodCtx.fillStyle = `rgba(${150 + Math.random() * 50}, ${Math.random() * 30}, ${Math.random() * 30}, 0.8)`;
            bloodCtx.fill();
        }
        
        this.textures.blood = new THREE.CanvasTexture(bloodCanvas);
    }
    
    spawnBlood(position, normal, count = 10, velocity = null) {
        for (let i = 0; i < count; i++) {
            const size = 0.05 + Math.random() * 0.1;
            const material = new THREE.SpriteMaterial({
                map: this.textures.circle,
                color: new THREE.Color(0xaa0000 + Math.random() * 0x330000),
                transparent: true,
                opacity: 0.9,
                depthWrite: false,
                blending: THREE.NormalBlending
            });
            
            const particle = new THREE.Sprite(material);
            particle.position.copy(position);
            particle.scale.set(size, size, 1);
            
            // Velocity away from impact
            const speed = 3 + Math.random() * 5;
            const dir = velocity || new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            dir.normalize();
            
            // Add some randomness
            dir.x += (Math.random() - 0.5) * 0.5;
            dir.y += Math.random() * 0.5;
            dir.z += (Math.random() - 0.5) * 0.5;
            dir.multiplyScalar(speed);
            
            this.scene.add(particle);
            
            this.bloodParticles.push({
                mesh: particle,
                velocity: dir,
                lifetime: 2 + Math.random(),
                maxLifetime: 2 + Math.random(),
                gravity: 15,
                drag: 0.98,
                groundStuck: false
            });
        }
    }
    
    spawnSmoke(position, count = 5, color = 0x888888) {
        for (let i = 0; i < count; i++) {
            const size = 0.1 + Math.random() * 0.2;
            const material = new THREE.SpriteMaterial({
                map: this.textures.circle,
                color: new THREE.Color(color),
                transparent: true,
                opacity: 0.6,
                depthWrite: false,
                blending: THREE.NormalBlending
            });
            
            const particle = new THREE.Sprite(material);
            particle.position.copy(position);
            particle.position.y += 0.1;
            particle.scale.set(size, size, 1);
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                1 + Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            
            this.scene.add(particle);
            
            this.smokeParticles.push({
                mesh: particle,
                velocity: velocity,
                lifetime: 1.5 + Math.random(),
                maxLifetime: 1.5 + Math.random(),
                expansion: 0.5
            });
        }
    }
    
    spawnSparks(position, normal, count = 8) {
        for (let i = 0; i < count; i++) {
            const geometry = new THREE.BoxGeometry(0.02, 0.02, 0.08);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xffaa00 + Math.random() * 0x555500),
                transparent: true,
                opacity: 1
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            const speed = 5 + Math.random() * 10;
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            velocity.normalize().multiplyScalar(speed);
            
            // Reflect off surface
            const dot = velocity.dot(normal);
            velocity.sub(normal.multiplyScalar(2 * dot));
            
            this.scene.add(particle);
            
            this.sparkParticles.push({
                mesh: particle,
                velocity: velocity,
                lifetime: 0.5 + Math.random() * 0.5,
                maxLifetime: 0.5 + Math.random() * 0.5,
                rotationSpeed: new THREE.Vector3(
                    Math.random() * 10,
                    Math.random() * 10,
                    Math.random() * 10
                )
            });
        }
    }
    
    spawnMuzzleSmoke(position) {
        this.spawnSmoke(position, 3, 0x666666);
    }
    
    update(deltaTime) {
        // Update blood particles
        for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
            const p = this.bloodParticles[i];
            p.lifetime -= deltaTime;
            
            if (!p.groundStuck) {
                p.velocity.y -= p.gravity * deltaTime;
                p.velocity.multiplyScalar(p.drag);
                p.mesh.position.addScaledVector(p.velocity, deltaTime);
                
                // Ground collision
                if (p.mesh.position.y <= 0.02) {
                    p.mesh.position.y = 0.02;
                    p.groundStuck = true;
                    p.velocity.set(0, 0, 0);
                }
            }
            
            // Fade out
            const alpha = p.lifetime / p.maxLifetime;
            p.mesh.material.opacity = alpha * 0.9;
            
            if (p.lifetime <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.material.dispose();
                this.bloodParticles.splice(i, 1);
            }
        }
        
        // Update smoke particles
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const p = this.smokeParticles[i];
            p.lifetime -= deltaTime;
            
            p.mesh.position.addScaledVector(p.velocity, deltaTime);
            p.velocity.y *= 0.98; // Air resistance
            
            // Expand and fade
            const progress = 1 - (p.lifetime / p.maxLifetime);
            const scale = 1 + progress * p.expansion * 3;
            p.mesh.scale.setScalar(scale);
            p.mesh.material.opacity = (1 - progress) * 0.6;
            
            if (p.lifetime <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.material.dispose();
                this.smokeParticles.splice(i, 1);
            }
        }
        
        // Update spark particles
        for (let i = this.sparkParticles.length - 1; i >= 0; i--) {
            const p = this.sparkParticles[i];
            p.lifetime -= deltaTime;
            
            p.velocity.y -= 20 * deltaTime; // Gravity
            p.mesh.position.addScaledVector(p.velocity, deltaTime);
            p.mesh.rotation.x += p.rotationSpeed.x * deltaTime;
            p.mesh.rotation.y += p.rotationSpeed.y * deltaTime;
            p.mesh.rotation.z += p.rotationSpeed.z * deltaTime;
            
            // Ground collision
            if (p.mesh.position.y <= 0.01) {
                p.mesh.position.y = 0.01;
                p.velocity.y *= -0.3;
                p.velocity.x *= 0.7;
                p.velocity.z *= 0.7;
            }
            
            p.mesh.material.opacity = p.lifetime / p.maxLifetime;
            
            if (p.lifetime <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.sparkParticles.splice(i, 1);
            }
        }
    }
    
    clear() {
        [...this.bloodParticles, ...this.smokeParticles, ...this.sparkParticles].forEach(p => {
            this.scene.remove(p.mesh);
            if (p.mesh.material) p.mesh.material.dispose();
            if (p.mesh.geometry) p.mesh.geometry.dispose();
        });
        
        this.bloodParticles = [];
        this.smokeParticles = [];
        this.sparkParticles = [];
    }
}

export default ParticleSystem;
