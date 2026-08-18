/**
 * Game Configuration Data
 * Centralized configuration for all game systems
 */

export const CONFIG = {
    // Player settings
    player: {
        health: 100,
        maxHealth: 100,
        walkSpeed: 5,
        runSpeed: 8,
        jumpForce: 10,
        gravity: 25,
        mouseSensitivity: 0.002,
        headBobbing: true,
        headBobSpeed: 10,
        headBobAmount: 0.05
    },
    
    // Camera settings
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        viewOffset: { x: 0, y: 1.7, z: 0 }
    },
    
    // World settings
    world: {
        fogColor: 0x667788,
        fogNear: 10,
        fogFar: 150,
        ambientLight: 0.4,
        hemiLightSky: 0x6699cc,
        hemiLightGround: 0x334455
    },
    
    // Time settings
    time: {
        deltaTime: 0,
        fixedDeltaTime: 1 / 60
    }
};

export default CONFIG;
