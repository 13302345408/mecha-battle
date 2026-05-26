class InputManager {
    constructor() {
        this.keys = {};
        this.keysJustPressed = {};

        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keysJustPressed[e.code] = true;
            }
            this.keys[e.code] = true;

            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isDown(code) {
        return !!this.keys[code];
    }

    justPressed(code) {
        return !!this.keysJustPressed[code];
    }

    clearPressed() {
        this.keysJustPressed = {};
    }

    getP1Input() {
        return {
            up: this.isDown('KeyW'),
            down: this.isDown('KeyS'),
            left: this.isDown('KeyA'),
            right: this.isDown('KeyD'),
            attack: this.justPressed('Space'),
            defend: this.isDown('ShiftLeft'),
        };
    }

    getP2Input() {
        return {
            up: this.isDown('ArrowUp'),
            down: this.isDown('ArrowDown'),
            left: this.isDown('ArrowLeft'),
            right: this.isDown('ArrowRight'),
            attack: this.justPressed('Enter'),
            defend: this.isDown('ControlLeft') || this.isDown('ControlRight'),
        };
    }

    isStartPressed() {
        return this.justPressed('Enter');
    }

    isRestartPressed() {
        return this.justPressed('KeyR');
    }
}
