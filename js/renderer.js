class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        this.bgOffset = 0;
    }

    clear() {
        this.ctx.fillStyle = COLORS.BG_TOP;
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    }

    drawBackground(time) {
        const ctx = this.ctx;

        const grad = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.CANVAS_HEIGHT);
        grad.addColorStop(0, '#0a0a1a');
        grad.addColorStop(0.4, '#111128');
        grad.addColorStop(1, '#16213e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

        for (let i = 0; i < 40; i++) {
            const sx = (i * 97 + time * 0.005) % GAME_CONFIG.CANVAS_WIDTH;
            const sy = (i * 53) % (GAME_CONFIG.CANVAS_HEIGHT * 0.5);
            const brightness = 0.3 + Math.sin(time / 500 + i) * 0.2;
            ctx.fillStyle = `rgba(200, 220, 255, ${brightness})`;
            ctx.fillRect(sx, sy, 2, 2);
        }

        this.drawArenaFloor(time);
        this.drawArenaDecorations();
    }

    drawArenaFloor(time) {
        const ctx = this.ctx;
        const floorY = GAME_CONFIG.ARENA_TOP + 80;

        ctx.fillStyle = '#0d1020';
        ctx.fillRect(GAME_CONFIG.ARENA_LEFT, floorY,
            GAME_CONFIG.ARENA_RIGHT - GAME_CONFIG.ARENA_LEFT,
            GAME_CONFIG.ARENA_BOTTOM - floorY + 20);

        this.bgOffset = (this.bgOffset + 0.3) % 40;

        ctx.strokeStyle = COLORS.GRID_LINE;
        ctx.lineWidth = 1;

        for (let x = GAME_CONFIG.ARENA_LEFT; x <= GAME_CONFIG.ARENA_RIGHT; x += 40) {
            const offset = Math.floor((x - GAME_CONFIG.ARENA_LEFT) / 40) * 4;
            ctx.beginPath();
            ctx.moveTo(x, floorY);
            ctx.lineTo(x - offset, GAME_CONFIG.ARENA_BOTTOM + 30);
            ctx.stroke();
        }

        for (let y = floorY; y <= GAME_CONFIG.ARENA_BOTTOM + 30; y += 25) {
            ctx.globalAlpha = 0.4 + (y - floorY) / (GAME_CONFIG.ARENA_BOTTOM - floorY) * 0.4;
            ctx.beginPath();
            ctx.moveTo(GAME_CONFIG.ARENA_LEFT, y);
            ctx.lineTo(GAME_CONFIG.ARENA_RIGHT, y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        for (let i = 0; i < 8; i++) {
            const px = GAME_CONFIG.ARENA_LEFT + (i % 6) * 120 + 20;
            const py = floorY + ((i * 37 + this.bgOffset) % (GAME_CONFIG.ARENA_BOTTOM - floorY));
            ctx.fillStyle = `rgba(0, 212, 255, ${0.03 + Math.sin(time / 300 + i) * 0.02})`;
            ctx.fillRect(px, py, 60, 2);
        }

        ctx.fillStyle = 'rgba(0, 212, 255, 0.12)';
        ctx.fillRect(GAME_CONFIG.ARENA_LEFT, floorY, 4, GAME_CONFIG.ARENA_BOTTOM - floorY + 30);
        ctx.fillRect(GAME_CONFIG.ARENA_RIGHT - 4, floorY, 4, GAME_CONFIG.ARENA_BOTTOM - floorY + 30);
        ctx.fillRect(GAME_CONFIG.ARENA_LEFT, GAME_CONFIG.ARENA_BOTTOM + 26,
            GAME_CONFIG.ARENA_RIGHT - GAME_CONFIG.ARENA_LEFT, 4);
    }

    drawArenaDecorations() {
        const ctx = this.ctx;

        ctx.fillStyle = '#ffaa00';
        for (let i = 0; i < 6; i++) {
            const x = GAME_CONFIG.ARENA_LEFT + 10 + i * 15;
            ctx.fillRect(x, GAME_CONFIG.ARENA_BOTTOM + 28, 8, 4);
            ctx.fillRect(x, GAME_CONFIG.ARENA_BOTTOM + 34, 8, 4);
        }
        for (let i = 0; i < 6; i++) {
            const x = GAME_CONFIG.ARENA_RIGHT - 70 + i * 15;
            ctx.fillRect(x, GAME_CONFIG.ARENA_BOTTOM + 28, 8, 4);
            ctx.fillRect(x, GAME_CONFIG.ARENA_BOTTOM + 34, 8, 4);
        }
    }

    drawHUD(p1, p2, timer) {
        const ctx = this.ctx;

        ctx.fillStyle = 'rgba(10, 10, 26, 0.85)';
        ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, 70);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.fillRect(0, 68, GAME_CONFIG.CANVAS_WIDTH, 2);

        this.drawHPBar(20, 16, p1, true);
        this.drawHPBar(GAME_CONFIG.CANVAS_WIDTH - 220, 16, p2, false);

        this.drawPlayerLabel(20, 50, 'P1', COLORS.P1_PRIMARY, p1.state);
        this.drawPlayerLabel(GAME_CONFIG.CANVAS_WIDTH - 100, 50, 'P2', COLORS.P2_PRIMARY, p2.state);

        ctx.fillStyle = COLORS.TEXT_WHITE;
        ctx.font = '14px "Press Start 2P"';
        ctx.textAlign = 'center';
        const timeStr = `${Math.ceil(timer / 60).toString().padStart(2, '0')}`;
        ctx.fillText(timeStr, GAME_CONFIG.CANVAS_WIDTH / 2, 42);
    }

    drawHPBar(x, y, mech, isLeft) {
        const ctx = this.ctx;
        const barWidth = 200;
        const barHeight = 18;

        ctx.fillStyle = COLORS.HP_BG;
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.strokeStyle = isLeft ? COLORS.P1_SECONDARY : COLORS.P2_SECONDARY;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);

        const hpRatio = mech.hp / mech.maxHP;
        const hpWidth = Math.max(0, (barWidth - 4) * hpRatio);

        const hpGrad = ctx.createLinearGradient(x + 2, y, x + 2 + hpWidth, y);
        if (isLeft) {
            hpGrad.addColorStop(0, '#00ff88');
            hpGrad.addColorStop(1, '#00d4ff');
        } else {
            hpGrad.addColorStop(0, '#ff8844');
            hpGrad.addColorStop(1, '#ff4444');
        }
        ctx.fillStyle = hpGrad;
        ctx.fillRect(x + 2, y + 2, hpWidth, barHeight - 4);

        if (hpRatio < 0.3 && Math.floor(Date.now() / 250) % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x + 2, y + 2, hpWidth, barHeight - 4);
        }

        ctx.fillStyle = COLORS.TEXT_WHITE;
        ctx.font = '9px "Press Start 2P"';
        ctx.textAlign = isLeft ? 'left' : 'right';
        const labelX = isLeft ? x + barWidth + 8 : x - 8;
        ctx.fillText(`${Math.max(0, mech.hp)}/${mech.maxHP}`, labelX, y + 13);
    }

    drawPlayerLabel(x, y, text, color, state) {
        const ctx = this.ctx;
        ctx.font = '9px "Press Start 2P"';
        ctx.textAlign = 'left';

        let icon = '';
        if (state === 'attack') icon = '[ATK]';
        else if (state === 'defend') icon = '[DEF]';
        else if (state === 'hit') icon = '[HIT]';
        else if (state === 'walk') icon = '[MOVE]';

        ctx.fillStyle = color;
        ctx.fillText(`${text} ${icon}`, x, y);
    }

    triggerShake(intensity = 4, duration = 8) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }

    applyScreenShake() {
        if (this.screenShake.duration > 0) {
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity * 2;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity * 2;
            this.screenShake.duration--;
            this.canvas.style.transform =
                `translate(${this.screenShake.x}px, ${this.screenShake.y}px)`;
        } else if (this.screenShake.x !== 0 || this.screenShake.y !== 0) {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
            this.canvas.style.transform = 'none';
        }
    }

    drawScanlines() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        for (let y = 0; y < GAME_CONFIG.CANVAS_HEIGHT; y += 2) {
            ctx.fillRect(0, y, GAME_CONFIG.CANVAS_WIDTH, 1);
        }
    }
}
