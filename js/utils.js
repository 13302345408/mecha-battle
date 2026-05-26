const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 480,
    ARENA_LEFT: 50,
    ARENA_RIGHT: 750,
    ARENA_TOP: 180,
    ARENA_BOTTOM: 450,
    FPS: 60,
};

const MECH_STATS = {
    WIDTH: 40,
    HEIGHT: 48,
    SPEED: 3.5,
    HP: 100,
    ATTACK_DAMAGE: 15,
    ATTACK_RANGE: 55,
    DEFENSE_REDUCTION: 0.5,
    ATTACK_COOLDOWN: 28,
    HIT_STUN_FRAMES: 16,
    KNOCKBACK_FORCE: 5,
};

const COLORS = {
    P1_PRIMARY: '#00d4ff',
    P1_SECONDARY: '#0077be',
    P1_DARK: '#004466',
    P1_LIGHT: '#66e5ff',
    P2_PRIMARY: '#ff4444',
    P2_SECONDARY: '#cc0000',
    P2_DARK: '#880000',
    P2_LIGHT: '#ff8888',
    BG_TOP: '#0a0a1a',
    BG_BOTTOM: '#16213e',
    GRID_LINE: 'rgba(0, 212, 255, 0.08)',
    GRID_BRIGHT: 'rgba(0, 212, 255, 0.15)',
    HP_BG: '#1a1a2e',
    HP_BORDER: '#3a3a5c',
    TEXT_WHITE: '#e0e0e0',
    ACCENT_YELLOW: '#ffff00',
    ACCENT_GREEN: '#00ff88',
};

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
