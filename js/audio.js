class AudioSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    }

    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(frequency, duration, type = 'square', volume = 0.15, detune = 0) {
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        osc.detune.setValueAtTime(detune, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    playAttack() {
        this.playTone(220, 0.08, 'sawtooth', 0.12);
        setTimeout(() => this.playTone(180, 0.1, 'square', 0.08), 30);
    }

    playHit() {
        this.playTone(100, 0.12, 'sawtooth', 0.18);
        this.playTone(60, 0.15, 'square', 0.12, -20);
        setTimeout(() => this.playTone(80, 0.08, 'square', 0.06), 50);
    }

    playBlock() {
        this.playTone(300, 0.06, 'square', 0.1);
        this.playTone(400, 0.06, 'square', 0.08);
        setTimeout(() => this.playTone(500, 0.08, 'square', 0.06), 40);
    }

    playVictory() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'square', 0.1), i * 150);
        });
    }

    playDefeat() {
        const notes = [400, 350, 300, 200];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.25, 'sawtooth', 0.1), i * 200);
        });
    }

    playSelect() {
        this.playTone(600, 0.05, 'square', 0.08);
    }
}
