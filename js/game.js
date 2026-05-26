class Game {
    constructor(canvas, renderer, input, audio, particles) {
        this.canvas = canvas;
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;

        this.state = 'title';
        this.timer = 0;
        this.frameCount = 0;
        this.winner = null;

        this.player1 = null;
        this.player2 = null;
    }

    init() {
        this.audio.init();
    }

    startBattle() {
        this.state = 'battle';
        this.timer = 99 * 60;
        this.winner = null;
        this.particles.clear();

        const p1Colors = {
            primary: COLORS.P1_PRIMARY,
            secondary: COLORS.P1_SECONDARY,
            dark: COLORS.P1_DARK,
            light: COLORS.P1_LIGHT,
        };
        const p2Colors = {
            primary: COLORS.P2_PRIMARY,
            secondary: COLORS.P2_SECONDARY,
            dark: COLORS.P2_DARK,
            light: COLORS.P2_LIGHT,
        };

        this.player1 = new Mech(150, 300, 1, p1Colors);
        this.player2 = new Mech(580, 280, 2, p2Colors);

        this.audio.playSelect();
    }

    update() {
        switch (this.state) {
            case 'title':
                if (this.input.isStartPressed()) {
                    this.startBattle();
                }
                break;

            case 'battle':
                this.updateBattle();
                break;

            case 'result':
                if (this.input.isRestartPressed()) {
                    this.state = 'title';
                    this.showScreen('title-screen');
                    this.hideScreen('result-screen');
                }
                break;
        }

        this.input.clearPressed();
    }

    updateBattle() {
        this.frameCount++;
        if (this.timer > 0) this.timer--;

        const p1Input = this.input.getP1Input();
        const p2Input = this.input.getP2Input();

        this.player1.getInput(p1Input);
        this.player2.getInput(p2Input);

        this.player1.update();
        this.player2.update();

        this.checkCombat(this.player1, this.player2);
        this.checkCombat(this.player2, this.player1);

        this.particles.update();

        if (this.player1.hp <= 0 || this.player2.hp <= 0 || this.timer <= 0) {
            this.endBattle();
        }
    }

    checkCombat(attacker, defender) {
        if (attacker.state !== 'attack' || attacker.currentFrame !== 1) return;
        if (attacker._hasHitThisAttack === attacker.attackCooldown) return;

        const hitbox = attacker.getAttackHitbox();
        if (!hitbox) return;

        const hurtbox = defender.getHurtbox();

        if (rectsOverlap(hitbox.x, hitbox.y, hitbox.w, hitbox.h,
                        hurtbox.x, hurtbox.y, hurtbox.w, hurtbox.h)) {

            const facingOk = (attacker.facing === 1 && defender.x >= attacker.x) ||
                             (attacker.facing === -1 && defender.x <= attacker.x);

            if (facingOk) {
                const damage = defender.takeDamage(attacker.attackDamage, attacker);
                attacker._hasHitThisAttack = attacker.attackCooldown;

                if (damage > 0) {
                    this.audio.playHit();
                    this.renderer.triggerShake(5, 10);

                    const hitX = defender.x + defender.width / 2;
                    const hitY = defender.y + defender.height / 3;
                    this.particles.emit(hitX, hitY, {
                        count: 12,
                        color: '#ffff00',
                        speed: 4,
                        life: 25,
                        size: 3,
                    });
                    this.particles.emit(hitX, hitY, {
                        count: 6,
                        color: '#ffffff',
                        speed: 3,
                        life: 18,
                        size: 2,
                    });

                    if (defender.isDefending) {
                        this.audio.playBlock();
                        this.particles.emit(hitX, hitY - 15, {
                            count: 8,
                            color: defender.colorScheme.light,
                            speed: 3,
                            life: 20,
                            size: 4,
                        });
                    }
                }
            }
        }
    }

    endBattle() {
        this.state = 'result';

        if (this.player1.hp <= 0) {
            this.winner = 2;
        } else if (this.player2.hp <= 0) {
            this.winner = 1;
        } else {
            this.winner = this.player1.hp > this.player2.hp ? 1 : 2;
        }

        const isP1Win = this.winner === 1;

        const resultText = document.getElementById('result-text');
        const resultSub = document.getElementById('result-sub');

        if (isP1Win) {
            resultText.textContent = 'VICTORY';
            resultText.className = 'result-title victory';
            resultSub.textContent = 'PLAYER 1 WINS!';
            this.audio.playVictory();
        } else {
            resultText.textContent = 'DEFEAT';
            resultText.className = 'result-title defeat';
            resultSub.textContent = this.winner === 2 ? 'PLAYER 2 WINS!' : 'TIME UP - OPPONENT WINS';
            this.audio.playDefeat();
        }

        setTimeout(() => {
            this.particles.emitExplosion(
                GAME_CONFIG.CANVAS_WIDTH / 2,
                GAME_CONFIG.CANVAS_HEIGHT / 2,
                { color: isP1Win ? '#00ff88' : '#ff4444' }
            );
        }, 200);

        this.showScreen('result-screen');
    }

    render(time) {
        this.renderer.clear();
        this.renderer.drawBackground(time);

        if (this.state === 'battle') {
            for (const mech of [this.player1, this.player2]) {
                const shadowY = mech.y + mech.height + 4;
                this.renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                this.renderer.ctx.beginPath();
                this.renderer.ctx.ellipse(
                    mech.x + mech.width / 2,
                    shadowY,
                    mech.width * 0.45,
                    6,
                    0, 0, Math.PI * 2
                );
                this.renderer.ctx.fill();
            }

            this.player1.draw(this.renderer.ctx);
            this.player2.draw(this.renderer.ctx);

            this.particles.draw(this.renderer.ctx);

            this.renderer.drawHUD(this.player1, this.player2, this.timer);
        }

        this.renderer.applyScreenShake();
        this.renderer.drawScanlines();
    }

    showScreen(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    }

    hideScreen(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    }
}
