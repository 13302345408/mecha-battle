class Mech {
    constructor(x, y, playerID, colorScheme) {
        this.x = x;
        this.y = y;
        this.width = MECH_STATS.WIDTH;
        this.height = MECH_STATS.HEIGHT;
        this.playerID = playerID;
        this.colorScheme = colorScheme;

        this.hp = MECH_STATS.HP;
        this.maxHP = MECH_STATS.HP;
        this.speed = MECH_STATS.SPEED;
        this.attackDamage = MECH_STATS.ATTACK_DAMAGE;
        this.attackRange = MECH_STATS.ATTACK_RANGE;
        this.defenseReduction = MECH_STATS.DEFENSE_REDUCTION;
        this.attackCooldown = 0;
        this.attackCooldownMax = MECH_STATS.ATTACK_COOLDOWN;

        this.facing = playerID === 1 ? 1 : -1;
        this.state = 'idle';
        this.stateTimer = 0;
        this.isDefending = false;

        this.currentFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 6;

        this.vx = 0;
        this.vy = 0;

        this.flashTimer = 0;
        this.spriteCache = {};
        this.generateSprites();
    }

    generateSprites() {
        const c = this.colorScheme;
        const states = ['idle', 'walk', 'attack', 'defend', 'hit'];
        const frameCounts = { idle: 2, walk: 4, attack: 3, defend: 1, hit: 2 };

        for (const state of states) {
            this.spriteCache[state] = [];
            for (let f = 0; f < frameCounts[state]; f++) {
                this.spriteCache[state][f] = this.drawMechFrame(state, f);
            }
        }
    }

    drawMechFrame(state, frame) {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const c = this.colorScheme;
        const px = (x, y, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, 2, 2); };
        const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };

        const headX = 12 + (state === 'attack' && frame >= 1 ? 6 : 0);
        const bodyBob = state === 'walk' ? Math.sin(frame * Math.PI / 2) * 2 : (state === 'hit' ? -2 : 0);

        rect(10, 8 + bodyBob, 16, 14, c.primary);
        rect(11, 9 + bodyBob, 14, 12, c.secondary);
        px(13, 10 + bodyBob, c.light);
        px(22, 10 + bodyBob, c.light);

        rect(headX, 0 + bodyBob, 12, 10, c.primary);
        rect(headX + 1, 1 + bodyBob, 10, 8, c.secondary);
        rect(headX + 3, 2 + bodyBob, 4, 4, c.dark);
        rect(headX + 8, 3 + bodyBob, 2, 2, c.light);
        if (state === 'attack' && frame === 2) {
            rect(headX + 10, 4 + bodyBob, 8, 3, '#ffffff');
            rect(headX + 17, 5 + bodyBob, 4, 2, '#ffff00');
        }

        const armSwing = state === 'walk' ? Math.sin(frame * Math.PI / 2) * 4 :
                        state === 'attack' ? (frame === 0 ? -8 : frame === 1 ? 4 : 10) :
                        state === 'defend' ? -6 :
                        state === 'hit' ? 6 : 0;

        rect(4, 10 + bodyBob + armSwing, 8, 6, c.primary);
        rect(5, 11 + bodyBob + armSwing, 6, 4, c.secondary);

        rect(24, 10 + bodyBob - armSwing, 8, 6, c.primary);
        rect(25, 11 + bodyBob - armSwing, 6, 4, c.secondary);

        const legOffset = state === 'walk' ? Math.sin(frame * Math.PI / 2) * 3 : 0;
        rect(10, 22 + bodyBob, 6, 14, c.dark);
        rect(20, 22 + bodyBob, 6, 14, c.dark);
        rect(10 + legOffset, 34 + bodyBob, 7, 6, c.primary);
        rect(20 - legOffset, 34 + bodyBob, 7, 6, c.primary);

        if (state === 'defend') {
            ctx.strokeStyle = c.light;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 100) * 0.3;
            ctx.beginPath();
            ctx.moveTo(-2, -2);
            ctx.lineTo(this.width / 2, -8);
            ctx.lineTo(this.width + 2, -2);
            ctx.lineTo(this.width + 2, this.height + 2);
            ctx.lineTo(this.width / 2, this.height + 8);
            ctx.lineTo(-2, this.height + 2);
            ctx.closePath();
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        if (state === 'hit') {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.3})`;
            for (let i = 0; i < 5; i++) {
                const hx = Math.floor(Math.random() * this.width);
                const hy = Math.floor(Math.random() * this.height);
                ctx.fillRect(hx, hy, 4, 4);
            }
        }

        return canvas;
    }

    getInput(input) {
        if (this.state === 'hit') return;

        if (input.defend) {
            this.setState('defend');
            this.isDefending = true;
            this.vx = 0;
            this.vy = 0;
            return;
        } else {
            this.isDefending = false;
            if (this.state === 'defend') this.setState('idle');
        }

        if (input.attack && this.state !== 'attack' && this.attackCooldown <= 0) {
            this.setState('attack');
            this.attackCooldown = this.attackCooldownMax;
            return;
        }

        if (this.state !== 'attack') {
            this.vx = 0;
            this.vy = 0;
            let moving = false;

            if (input.left) { this.vx = -this.speed; this.facing = -1; moving = true; }
            if (input.right) { this.vx = this.speed; this.facing = 1; moving = true; }
            if (input.up) { this.vy = -this.speed; moving = true; }
            if (input.down) { this.vy = this.speed; moving = true; }

            this.setState(moving ? 'walk' : 'idle');
        }
    }

    setState(newState) {
        if (this.state === newState) return;
        this.state = newState;
        this.currentFrame = 0;
        this.animTimer = 0;
    }

    update() {
        if (this.stateTimer > 0) {
            this.stateTimer--;
            if (this.stateTimer <= 0 && this.state === 'hit') {
                this.setState('idle');
            }
        }

        if (this.attackCooldown > 0) this.attackCooldown--;

        if (this.flashTimer > 0) this.flashTimer--;

        this.x += this.vx;
        this.y += this.vy;

        this.x = clamp(this.x, GAME_CONFIG.ARENA_LEFT, GAME_CONFIG.ARENA_RIGHT - this.width);
        this.y = clamp(this.y, GAME_CONFIG.ARENA_TOP, GAME_CONFIG.ARENA_BOTTOM - this.height);

        this.animTimer++;
        const speeds = { idle: 18, walk: 5, attack: 5, defend: 999, hit: 8 };
        if (this.animTimer >= (speeds[this.state] || 6)) {
            this.animTimer = 0;
            const frames = { idle: 2, walk: 4, attack: 3, defend: 1, hit: 2 };
            this.currentFrame = (this.currentFrame + 1) % (frames[this.state] || 1);
        }

        if (this.state === 'attack' && this.currentFrame === 2 && this.animTimer === 0) {
            this.setState('idle');
        }
    }

    takeDamage(damage, attacker) {
        if (this.state === 'hit') return 0;
        const finalDamage = Math.floor(damage * (this.isDefending ? this.defenseReduction : 1));
        this.hp -= finalDamage;
        this.hp = Math.max(0, this.hp);
        this.setState('hit');
        this.stateTimer = MECH_STATS.HIT_STUN_FRAMES;
        this.flashTimer = MECH_STATS.HIT_STUN_FRAMES;

        const knockDir = this.x < attacker.x ? -1 : 1;
        this.x += knockDir * MECH_STATS.KNOCKBACK_FORCE;

        return finalDamage;
    }

    getAttackHitbox() {
        if (this.state !== 'attack' || this.currentFrame < 1) return null;
        const hx = this.facing === 1
            ? this.x + this.width
            : this.x - this.attackRange;
        return {
            x: hx,
            y: this.y + 8,
            w: this.attackRange,
            h: this.height - 16,
        };
    }

    getHurtbox() {
        return {
            x: this.x + 6,
            y: this.y + 4,
            w: this.width - 12,
            h: this.height - 8,
        };
    }

    draw(ctx) {
        if (this.flashTimer > 0 && Math.floor(this.flashTimer / 3) % 2 === 0) return;

        ctx.save();

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        ctx.translate(cx, cy);
        ctx.scale(this.facing, 1);
        ctx.translate(-this.width / 2, -this.height / 2);

        const frames = this.spriteCache[this.state];
        if (frames && frames[this.currentFrame]) {
            ctx.drawImage(frames[this.currentFrame], 0, 0);
        }

        ctx.restore();

        if (this.isDefending) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(this.facing, 1);
            ctx.strokeStyle = this.colorScheme.light;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 80) * 0.25;
            ctx.beginPath();
            ctx.moveTo(-22, -28);
            ctx.lineTo(0, -36);
            ctx.lineTo(22, -28);
            ctx.lineTo(22, 28);
            ctx.lineTo(0, 36);
            ctx.lineTo(-22, 28);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    }
}
