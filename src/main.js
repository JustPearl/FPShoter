/**
 * Main Entry Point
 * Initializes and starts the game
 */

import { GameManager } from './core/GameManager.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Northern Outbreak - Initializing...');
    
    // Create and initialize game manager
    const game = new GameManager();
    
    try {
        game.init();
        console.log('Game initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showError('Failed to initialize game. Please refresh the page.');
    }
    
    // Expose game instance for debugging
    window.game = game;
});

function showError(message) {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.innerHTML = `
            <h1 style="color: #ff4444;">ERROR</h1>
            <p>${message}</p>
            <button onclick="location.reload()">RETRY</button>
        `;
    }
}
