/**
 * Weapon Data Definitions
 * All weapon stats and properties defined here
 */

export const WEAPONS_DATA = {
    pistol: {
        id: 'pistol',
        name: '.45 PISTOL',
        type: 'semi-auto',
        damage: 35,
        fireRate: 0.15, // seconds between shots
        magazineSize: 12,
        reserveAmmo: 48,
        reloadTime: 1.5,
        range: 50,
        spread: 0.02,
        recoil: {
            vertical: 0.08,
            horizontal: 0.03,
            recovery: 0.1,
            pattern: [0.08, 0.06, 0.07, 0.09, 0.08, 0.07, 0.06, 0.08, 0.09, 0.07, 0.08, 0.06]
        },
        kickback: {
            strength: 0.15,
            recovery: 0.2
        },
        muzzleFlash: {
            intensity: 2,
            duration: 0.05,
            scale: 0.3
        },
        shellEjection: {
            velocity: 5,
            rotation: 10,
            lifetime: 2
        },
        sound: {
            fire: 'pistol_fire',
            reload: 'pistol_reload',
            empty: 'pistol_empty'
        },
        model: {
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.3
        }
    },
    
    rifle: {
        id: 'rifle',
        name: '5.56 ASSAULT RIFLE',
        type: 'auto',
        damage: 25,
        fireRate: 0.08, // seconds between shots
        magazineSize: 30,
        reserveAmmo: 90,
        reloadTime: 2.5,
        range: 100,
        spread: 0.03,
        recoil: {
            vertical: 0.05,
            horizontal: 0.02,
            recovery: 0.15,
            pattern: [0.05, 0.04, 0.06, 0.05, 0.07, 0.06, 0.05, 0.04, 0.06, 0.05, 0.07, 0.06, 0.05, 0.04, 0.06, 0.05, 0.07, 0.06, 0.05, 0.04, 0.06, 0.05, 0.07, 0.06, 0.05, 0.04, 0.06, 0.05, 0.07, 0.06]
        },
        kickback: {
            strength: 0.08,
            recovery: 0.15
        },
        muzzleFlash: {
            intensity: 3,
            duration: 0.03,
            scale: 0.4
        },
        shellEjection: {
            velocity: 7,
            rotation: 15,
            lifetime: 2
        },
        sound: {
            fire: 'rifle_fire',
            reload: 'rifle_reload',
            empty: 'rifle_empty'
        },
        model: {
            color: 0x2a2a2a,
            metalness: 0.7,
            roughness: 0.4
        }
    }
};

export default WEAPONS_DATA;
