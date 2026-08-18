# Northern Outbreak

A highly-modular, data-driven 3D FPS shooter built with Three.js and vanilla JavaScript.

## Setting

A military compound in Sweden has been overrun by undead horrors and demonic entities. Survive the nightmare using authentic military weapons with realistic recoil patterns.

## Features

- **Realistic Weapon Mechanics**: Two original weapons (.45 Pistol and 5.56 Assault Rifle) with detailed recoil patterns, kickback, muzzle flash, and shell ejection
- **Dynamic Enemy AI**: Zombies and demons with different behaviors and attack patterns
- **Wave-based Survival**: Progressive difficulty with increasing enemy counts
- **Swedish Military Compound**: Authentic environment with barracks, watchtowers, fences, and pine forests
- **Polished Visual Effects**: Muzzle flashes, damage indicators, head bobbing, and atmospheric fog
- **Modular Architecture**: Clean separation of concerns with data-driven design

## Controls

- **WASD**: Movement
- **Mouse**: Look around
- **Left Mouse Button**: Fire weapon
- **R**: Reload
- **1/2**: Switch weapons (Pistol/Rifle)
- **Shift**: Sprint
- **Escape**: Pause game

## Weapons

### .45 Pistol
- Semi-automatic
- 12-round magazine
- High damage per shot
- Distinctive recoil pattern

### 5.56 Assault Rifle
- Fully automatic
- 30-round magazine
- Lower damage but higher fire rate
- Predictable climb pattern

## Enemies

- **Infected Soldier**: Standard zombie, moderate speed
- **Hell Spawn**: Fast demon with glowing eyes
- **Corrupted Brute**: Slow but heavily armored

## Technical Details

- Built with Three.js (loaded via CDN)
- Vanilla JavaScript (no build tools required)
- Modular ES6 architecture
- Data-driven weapon and enemy configurations
- Pointer Lock API for FPS controls

## Running the Game

Simply open `index.html` in a modern browser or serve it with any HTTP server:

```bash
python -m http.server 8080
```

Then navigate to `http://localhost:8080`

## Project Structure

```
src/
├── main.js                 # Entry point
├── core/                   # Core systems
│   ├── GameManager.js      # Main game loop
│   ├── PlayerController.js # Player movement & camera
│   └── InputManager.js     # Input handling
├── weapons/                # Weapon system
│   └── WeaponSystem.js     # Weapons, recoil, firing
├── enemies/                # Enemy system
│   └── EnemySystem.js      # Enemy AI & spawning
├── levels/                 # Level design
│   └── LevelManager.js     # Environment creation
├── data/                   # Game data
│   ├── config.js           # Global configuration
│   ├── weapons.js          # Weapon definitions
│   └── enemies.js          # Enemy definitions
└── utils/                  # Utility functions
```

## License

MIT License