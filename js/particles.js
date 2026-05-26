class ParticleSystem {
    constructor(maxParticles = 80) {
        this.particles = [];
        this.maxParticles = maxParticles;
    }

    emit(x, y, config = {}) {
        const count = config.count || 8;
        const color = config.color || '#ffff00';
        const speed = config.speed || 3;
        const life = config.life || 30;
        const size = config.size || 3;
        const type = config.type || 'square';
        const gravity = config.gravity || 0;

        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) {
                this.particles.shift();
            }
            const angle = (Math.PI * 2 / count) * i + randomRange(-0.3, 0.3);
            const spd = randomRange(speed * 0.5, speed);
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd - randomRange(1, 2),
                life,
                maxLife: life,
                color,
                size: randomRange(size * 0.5, size),
                type,
                gravity,
            });
        }
    }

    emitLine(x1, y1, x2, y2, config = {}) {
        const color = config.color || '#ffffff';
        const count = config.count || 6;
        const life = config.life || 15;
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) return;
            const t = i / count;
            this.particles.push({
                x: lerp(x1, x2, t) + randomRange(-4, 4),
                y: lerp(y1, y2, t) + randomRange(-4, 4),
                vx: randomRange(-1, 1),
                vy: randomRange(-2, 0),
                life: life + randomRange(0, 10),
                maxLife: life + 10,
                color,
                size: randomRange(2, 4),
                type: 'square',
                gravity: 0.1,
            });
        }
    }

    emitExplosion(x, y, config = {}) {
        const color = config.color || '#ff4444';
        this.emit(x, y, { count: 20, color, speed: 5, life: 35, size: 4, gravity: 0.15 });
        this.emit(x, y, { count: 12, color: '#ffffff', speed: 3, life: 20, size: 2, gravity: 0.05 });
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.96;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            const alpha = clamp(p.life / p.maxLife, 0, 1);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            if (p.type === 'square') {
                ctx.fillRect(
                    Math.floor(p.x - p.size / 2),
                    Math.floor(p.y - p.size / 2),
                    Math.ceil(p.size),
                    Math.ceil(p.size)
                );
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    clear() {
        this.particles = [];
    }
}
