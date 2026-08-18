/**
 * Enemy Data Definitions
 * Zombie and Demon enemy types with unique properties
 */

export const ENEMIES_DATA = {
    zombie: {
        id: 'zombie',
        name: 'Infected Soldier',
        type: 'undead',
        health: 100,
        damage: 20,
        speed: 2.5,
        range: 2,
        attackCooldown: 1.5,
        detectionRange: 30,
        model: {
            color: 0x4a5c4a,
            height: 1.8,
            radius: 0.4
        },
        behavior: {
            wanderSpeed: 1,
            chaseSpeed: 2.5,
            attackDamage: 20,
            canSwarm: true
        },
        loot: {
            score: 100
        }
    },
    
    demon: {
        id: 'demon',
        name: 'Hell Spawn',
        type: 'demonic',
        health: 150,
        damage: 35,
        speed: 4,
        range: 3,
        attackCooldown: 2,
        detectionRange: 40,
        model: {
            color: 0x8b0000,
            height: 2.2,
            radius: 0.5,
            emissive: 0xff0000
        },
        behavior: {
            wanderSpeed: 2,
            chaseSpeed: 4,
            attackDamage: 35,
            canSwarm: false,
            specialAbility: 'leap'
        },
        loot: {
            score: 250
        }
    },
    
    brute: {
        id: 'brute',
        name: 'Corrupted Brute',
        type: 'undead',
        health: 300,
        damage: 50,
        speed: 1.5,
        range: 4,
        attackCooldown: 3,
        detectionRange: 25,
        model: {
            color: 0x3d3d3d,
            height: 2.5,
            radius: 0.7
        },
        behavior: {
            wanderSpeed: 0.8,
            chaseSpeed: 1.5,
            attackDamage: 50,
            canSwarm: false,
            specialAbility: 'charge'
        },
        loot: {
            score: 500
        }
    }
};

export default ENEMIES_DATA;
