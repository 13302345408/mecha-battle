(function () {
    const canvas = document.getElementById('game-canvas');
    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

    const renderer = new Renderer(canvas);
    const input = new InputManager();
    const audio = new AudioSystem();
    const particles = new ParticleSystem(80);

    const game = new Game(canvas, renderer, input, audio, particles);
    game.init();
    game.showScreen('title-screen');

    function gameLoop(timestamp) {
        game.update();
        game.render(timestamp);
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Enter' && game.state === 'title') {
            audio.ensureContext();
            game.hideScreen('title-screen');
        }
    });
})();
