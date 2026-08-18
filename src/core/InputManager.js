/**
 * Input Manager
 * Handles keyboard and mouse input with event delegation
 */

import { CONFIG } from '../data/config.js';

export class InputManager {
    constructor() {
        this.keys = new Map();
        this.mouse = { x: 0, y: 0 };
        this.mouseButtons = new Map();
        this.callbacks = new Map();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys.set(e.code, true);
            this.triggerCallbacks('keydown', e.code);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
            this.triggerCallbacks('keyup', e.code);
        });
        
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.movementX || 0;
            this.mouse.y = e.movementY || 0;
        });
        
        // Mouse buttons
        document.addEventListener('mousedown', (e) => {
            this.mouseButtons.set(e.button, true);
            this.triggerCallbacks('mousedown', e.button);
        });
        
        document.addEventListener('mouseup', (e) => {
            this.mouseButtons.set(e.button, false);
            this.triggerCallbacks('mouseup', e.button);
        });
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    isKeyDown(code) {
        return this.keys.get(code) === true;
    }
    
    isKeyUp(code) {
        return this.keys.get(code) === false || !this.keys.has(code);
    }
    
    isMouseButtonDown(button) {
        return this.mouseButtons.get(button) === true;
    }
    
    getMouseMove() {
        const move = { ...this.mouse };
        this.mouse.x = 0;
        this.mouse.y = 0;
        return move;
    }
    
    getMovementVector() {
        const vector = { x: 0, z: 0 };
        
        if (this.isKeyDown('KeyW')) vector.z -= 1;
        if (this.isKeyDown('KeyS')) vector.z += 1;
        if (this.isKeyDown('KeyA')) vector.x -= 1;
        if (this.isKeyDown('KeyD')) vector.x += 1;
        
        // Normalize diagonal movement
        const length = Math.sqrt(vector.x * vector.x + vector.z * vector.z);
        if (length > 0) {
            vector.x /= length;
            vector.z /= length;
        }
        
        return vector;
    }
    
    isSprinting() {
        return this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight');
    }
    
    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.callbacks.has(event)) {
            const callbacks = this.callbacks.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    triggerCallbacks(event, data) {
        if (this.callbacks.has(event)) {
            this.callbacks.get(event).forEach(callback => callback(data));
        }
    }
    
    reset() {
        this.keys.clear();
        this.mouseButtons.clear();
        this.mouse = { x: 0, y: 0 };
    }
}

export default InputManager;
