/**
 * Audio System
 * Procedural audio generation for weapons, enemies, and environment
 */

export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isInitialized = false;
        this.sounds = new Map();
        
        // Audio settings
        this.volume = 0.5;
        this.maxDistance = 50;
    }
    
    init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    createNoiseBuffer(duration = 1) {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }
    
    playGunshot(type = 'pistol', distance = 0) {
        if (!this.isInitialized) return;
        
        const now = this.audioContext.currentTime;
        const volume = Math.max(0, 1 - distance / this.maxDistance);
        
        // Create noise burst
        const noiseBuffer = this.createNoiseBuffer(0.3);
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        // Filter for gun sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = type === 'rifle' ? 'bandpass' : 'lowpass';
        filter.frequency.value = type === 'rifle' ? 2000 : 1500;
        filter.Q.value = 1;
        
        // Envelope
        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(volume * 0.8, now);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        // Add low frequency thump
        const osc = this.audioContext.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        const oscEnvelope = this.audioContext.createGain();
        oscEnvelope.gain.setValueAtTime(volume * 0.5, now);
        oscEnvelope.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        // Connect graph
        noiseSource.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.masterGain);
        
        osc.connect(oscEnvelope);
        oscEnvelope.connect(this.masterGain);
        
        noiseSource.start(now);
        osc.start(now);
        noiseSource.stop(now + 0.3);
        osc.stop(now + 0.3);
    }
    
    playReload(weaponType = 'pistol') {
        if (!this.isInitialized) return;
        
        const now = this.audioContext.currentTime;
        
        // Magazine out click
        this.playClick(now, 0.8, 0.05);
        
        // Magazine in click
        this.playClick(now + 0.3, 0.6, 0.05);
        
        // Slide/bolt action
        const slideTime = weaponType === 'rifle' ? 0.4 : 0.2;
        this.playSlide(now + 0.5, slideTime);
    }
    
    playEmptyClick() {
        if (!this.isInitialized) return;
        
        const now = this.audioContext.currentTime;
        this.playClick(now, 0.5, 0.03);
    }
    
    playClick(time, volume, duration) {
        const osc = this.audioContext.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + duration);
        
        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(volume * 0.3, time);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.connect(envelope);
        envelope.connect(this.masterGain);
        
        osc.start(time);
        osc.stop(time + duration);
    }
    
    playSlide(time, duration) {
        const noiseBuffer = this.createNoiseBuffer(duration);
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        
        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(0.3, time);
        envelope.gain.linearRampToValueAtTime(0.3, time + duration * 0.8);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        noiseSource.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.masterGain);
        
        noiseSource.start(time);
        noiseSource.stop(time + duration);
    }
    
    playEnemyHit(damage) {
        if (!this.isInitialized) return;
        
        const now = this.audioContext.currentTime;
        
        // Meaty hit sound
        const noiseBuffer = this.createNoiseBuffer(0.2);
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        const envelope = this.audioContext.createGain();
        const volume = Math.min(damage / 100, 0.5);
        envelope.gain.setValueAtTime(volume, now);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        noiseSource.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.masterGain);
        
        noiseSource.start(now);
        noiseSource.stop(now + 0.2);
    }
    
    playEnemyDeath() {
        if (!this.isInitialized) return;
        
        const now = this.audioContext.currentTime;
        
        // Thud sound
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
        
        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(0.4, now);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc.connect(envelope);
        envelope.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }
    
    playDemonGrowl() {
        if (!this.isInitialized) return;
        
        const now = this.audioContext.currentTime;
        
        const osc = this.audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.5);
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.linearRampToValueAtTime(500, now + 0.3);
        
        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(0.2, now);
        envelope.gain.linearRampToValueAtTime(0.3, now + 0.2);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }
    
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }
    
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

export default AudioSystem;
