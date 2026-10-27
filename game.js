/**
 * Keep It Up - Game Logic
 */

// --- Constants ---
const GRAVITY = 0.5;
const BOUNCE_FORCE = -12;
const GROUND_Y_OFFSET = 50;

// --- Audio System ---
const audio = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),

    playTone(freq, type, duration) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playPop() {
        // Random pitch for variety
        const pitch = 400 + Math.random() * 200;
        this.playTone(pitch, 'sine', 0.1);
    },

    playCoin() {
        this.playTone(1200, 'square', 0.1);
        setTimeout(() => this.playTone(1600, 'square', 0.2), 100);
    },

    playGameOver() {
        this.playTone(200, 'sawtooth', 0.5);
        setTimeout(() => this.playTone(150, 'sawtooth', 0.5), 200);
    }
};

// --- State ---
const state = {
    screen: 'menu', // menu, playing, gameover, shop
    score: 0,
    highScore: 0,
    coins: 0,
    inventory: ['#38bdf8'], // Default blue
    selectedColor: '#38bdf8',
    bgInventory: ['bg-default'],
    selectedBg: 'bg-default',
    shopTab: 'balls', // balls, bgs
    nickname: '', // Player nickname for leaderboard

    // Game Objects
    ball: {
        x: 0,
        y: 0,
        radius: 20,
        vx: 0,
        vy: 0
    },
    particles: [],
    obstacles: [],
    powerups: [],
    activeEffects: {
        bigBall: 0,
        lowGravity: 0,
        doublePoints: 0
    }
};

// --- Shop Data ---
const SHOP_ITEMS = [
    { id: 'blue', color: '#38bdf8', price: 0, type: 'ball' },
    { id: 'pink', color: '#f472b6', price: 50, type: 'ball' },
    { id: 'green', color: '#4ade80', price: 100, type: 'ball' },
    { id: 'purple', color: '#c084fc', price: 200, type: 'ball' },
    { id: 'orange', color: '#fb923c', price: 300, type: 'ball' },
    { id: 'red', color: '#f87171', price: 500, type: 'ball' },
    { id: 'gold', color: '#facc15', price: 1000, type: 'ball' }
];

const BG_ITEMS = [
    { id: 'default', class: 'bg-default', name: 'Dark', price: 0, type: 'bg' },
    { id: 'sunset', class: 'bg-sunset', name: 'Sunset', price: 200, type: 'bg' },
    { id: 'forest', class: 'bg-forest', name: 'Forest', price: 500, type: 'bg' },
    { id: 'ocean', class: 'bg-ocean', name: 'Ocean', price: 800, type: 'bg' },
    { id: 'midnight', class: 'bg-midnight', name: 'Midnight', price: 1500, type: 'bg' }
];

// --- Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const ui = {
    menu: document.getElementById('main-menu'),
    hud: document.getElementById('hud'),
    gameOver: document.getElementById('game-over'),
    shop: document.getElementById('shop'),
    leaderboard: document.getElementById('leaderboard'),
    score: document.getElementById('score'),
    finalScore: document.getElementById('final-score'),
    earnedCoins: document.getElementById('earned-coins'),
    menuCoins: document.getElementById('menu-coins'),
    shopCoins: document.getElementById('shop-coins'),
    menuBest: document.getElementById('menu-best'),
    hudBest: document.getElementById('hud-best'),
    nicknameInput: document.getElementById('nickname-input'),
    leaderboardList: document.getElementById('leaderboard-list')
};

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyAnnjxl0-so0Qx9YuNu3t7yFwtdzg7KNEQ",
    authDomain: "juego-bola.firebaseapp.com",
    databaseURL: "https://juego-bola-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "juego-bola",
    storageBucket: "juego-bola.firebasestorage.app",
    messagingSenderId: "486804673872",
    appId: "1:486804673872:web:663b001cd35520ab2c0855",
    measurementId: "G-NBSQFKM2VC"
};

// Initialize Firebase (only if not already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

function switchTab(tab) {
    state.shopTab = tab;

    // Update UI
    document.getElementById('tab-balls').classList.toggle('active', tab === 'balls');
    document.getElementById('tab-bgs').classList.toggle('active', tab === 'bgs');

    renderShop();
}

function renderShop() {
    const container = document.getElementById('shop-items');
    container.innerHTML = '';

    const items = state.shopTab === 'balls' ? SHOP_ITEMS : BG_ITEMS;

    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'shop-item';

        let isOwned, isSelected;

        if (state.shopTab === 'balls') {
            isOwned = state.inventory.includes(item.color);
            isSelected = state.selectedColor === item.color;
        } else {
            isOwned = state.bgInventory.includes(item.class);
            isSelected = state.selectedBg === item.class;
        }

        if (isSelected) el.classList.add('selected');
        if (!isOwned) el.classList.add('locked');

        // Inner content
        let content = '';
        if (state.shopTab === 'balls') {
            content = `<div style="width: 30px; height: 30px; border-radius: 50%; background: ${item.color};"></div>`;
        } else {
            content = `<div style="font-size: 0.8rem; font-weight: bold;">${item.name}</div>`;
        }

        if (!isOwned) {
            content += `<div style="margin-top: 5px; font-size: 0.8rem; color: #fff;">${item.price}</div>`;
        }

        el.innerHTML = content;

        // Click handler
        el.addEventListener('click', () => {
            if (isOwned) {
                // Select
                if (state.shopTab === 'balls') {
                    state.selectedColor = item.color;
                } else {
                    state.selectedBg = item.class;
                    applyBackground(item.class);
                }
                saveData();
                renderShop();
            } else {
                // Buy
                if (state.coins >= item.price) {
                    state.coins -= item.price;

                    if (state.shopTab === 'balls') {
                        state.inventory.push(item.color);
                        state.selectedColor = item.color;
                    } else {
                        state.bgInventory.push(item.class);
                        state.selectedBg = item.class;
                        applyBackground(item.class);
                    }

                    saveData();
                    updateWalletUI();
                    renderShop();
                    audio.playCoin(); // Satisfaction sound
                } else {
                    // Shake
                    el.style.transform = 'translateX(5px)';
                    setTimeout(() => el.style.transform = 'translateX(0)', 100);
                    setTimeout(() => el.style.transform = 'translateX(-5px)', 200);
                    setTimeout(() => el.style.transform = 'translateX(0)', 300);
                }
            }
        });

        container.appendChild(el);
    });
}

// --- Leaderboard Functions ---
function submitScore(nickname, score) {
    if (!nickname || nickname.trim() === '') {
        nickname = 'Anonymous';
    }

    const cleanNickname = nickname.trim().substring(0, 15);
    const scoresRef = database.ref('leaderboard');

    // Check if nickname already exists
    scoresRef.orderByChild('nickname').equalTo(cleanNickname).once('value', (snapshot) => {
        if (snapshot.exists()) {
            // Nickname exists, check if new score is higher
            let existingKey = null;
            let existingScore = 0;

            snapshot.forEach((childSnapshot) => {
                existingKey = childSnapshot.key;
                existingScore = childSnapshot.val().score;
            });

            // Only update if new score is better
            if (score > existingScore) {
                scoresRef.child(existingKey).update({
                    score: score,
                    timestamp: Date.now()
                });
            }
        } else {
            // Nickname doesn't exist, create new entry
            scoresRef.push({
                nickname: cleanNickname,
                score: score,
                timestamp: Date.now()
            });
        }
    });
}

function loadLeaderboard() {
    const scoresRef = database.ref('leaderboard');

    ui.leaderboardList.innerHTML = '<div class="loading">Loading scores...</div>';

    scoresRef.orderByChild('score').limitToLast(10).once('value', (snapshot) => {
        const scores = [];
        snapshot.forEach((childSnapshot) => {
            scores.push(childSnapshot.val());
        });

        // Reverse to get highest scores first
        scores.reverse();

        renderLeaderboard(scores);
    }).catch((error) => {
        ui.leaderboardList.innerHTML = '<div class="loading">Failed to load scores</div>';
        console.error('Leaderboard error:', error);
    });
}

function renderLeaderboard(scores) {
    ui.leaderboardList.innerHTML = '';

    if (scores.length === 0) {
        ui.leaderboardList.innerHTML = '<div class="loading">No scores yet. Be the first!</div>';
        return;
    }

    scores.forEach((entry, index) => {
        const el = document.createElement('div');
        el.className = 'leaderboard-entry';

        // Add special styling for top 3
        if (index === 0) el.classList.add('top-1');
        if (index === 1) el.classList.add('top-2');
        if (index === 2) el.classList.add('top-3');

        el.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-name">${entry.nickname}</div>
            <div class="leaderboard-score">${entry.score}</div>
        `;

        ui.leaderboardList.appendChild(el);
    });
}

function showLeaderboard() {
    state.screen = 'leaderboard';
    ui.menu.classList.add('hidden');
    ui.leaderboard.classList.remove('hidden');
    loadLeaderboard();
}

function closeLeaderboard() {
    state.screen = 'menu';
    ui.leaderboard.classList.add('hidden');
    ui.menu.classList.remove('hidden');
}

// --- Initialization ---
function init() {
    resize();
    window.addEventListener('resize', resize);

    // Load data
    loadData();
    updateWalletUI();
    updateScoreUI();

    // Event Listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    document.getElementById('home-btn').addEventListener('click', showMenu);
    document.getElementById('shop-btn').addEventListener('click', showShop);
    document.getElementById('shop-close-btn').addEventListener('click', showMenu);

    // Leaderboard
    document.getElementById('leaderboard-btn').addEventListener('click', showLeaderboard);
    document.getElementById('leaderboard-close-btn').addEventListener('click', closeLeaderboard);

    // Nickname Input
    ui.nicknameInput.addEventListener('input', (e) => {
        state.nickname = e.target.value;
        saveData();
    });

    // Shop Tabs
    document.getElementById('tab-balls').addEventListener('click', () => switchTab('balls'));
    document.getElementById('tab-bgs').addEventListener('click', () => switchTab('bgs'));

    // Game Input
    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        handleInput(e);
    }, { passive: false });

    // Start Loop
    requestAnimationFrame(loop);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Reset ball position on resize if in menu
    if (state.screen === 'menu') {
        resetBall();
    }
}

function loadData() {
    const saved = localStorage.getItem('keepitup_data');
    if (saved) {
        const data = JSON.parse(saved);
        state.coins = data.coins || 0;
        state.highScore = data.highScore || 0;
        state.inventory = data.inventory || ['#38bdf8'];
        state.selectedColor = data.selectedColor || '#38bdf8';
        state.bgInventory = data.bgInventory || ['bg-default'];
        state.selectedBg = data.selectedBg || 'bg-default';
        state.nickname = data.nickname || '';

        applyBackground(state.selectedBg);
        ui.nicknameInput.value = state.nickname;
    }
}

function saveData() {
    const data = {
        coins: state.coins,
        highScore: state.highScore,
        inventory: state.inventory,
        selectedColor: state.selectedColor,
        bgInventory: state.bgInventory,
        selectedBg: state.selectedBg,
        nickname: state.nickname
    };
    localStorage.setItem('keepitup_data', JSON.stringify(data));
}

function applyBackground(bgClass) {
    document.body.className = bgClass;
}

// --- Game Flow ---
function showMenu() {
    state.screen = 'menu';
    ui.menu.classList.remove('hidden');
    ui.hud.classList.add('hidden');
    ui.gameOver.classList.add('hidden');
    ui.shop.classList.add('hidden');
    resetBall();
    updateWalletUI();
    updateScoreUI();
}

function startGame() {
    state.screen = 'playing';
    state.score = 0;
    ui.score.innerText = '0';
    state.obstacles = [];
    state.powerups = [];
    state.activeEffects = { bigBall: 0, lowGravity: 0, doublePoints: 0 };

    ui.menu.classList.add('hidden');
    ui.gameOver.classList.add('hidden');
    ui.hud.classList.remove('hidden');

    resetBall();
    // Initial pop up
    state.ball.vy = -10;
}

function showShop() {
    state.screen = 'shop';
    ui.menu.classList.add('hidden');
    ui.shop.classList.remove('hidden');
    switchTab(state.shopTab);
}

function gameOver() {
    state.screen = 'gameover';

    // Update economy
    state.coins += state.score;

    // Update High Score
    if (state.score > state.highScore) {
        state.highScore = state.score;
    }

    // Submit to leaderboard
    submitScore(state.nickname, state.score);

    saveData();
    audio.playGameOver();

    // Update UI
    ui.finalScore.innerText = state.score;
    ui.earnedCoins.innerText = `+${state.score}`;
    ui.hud.classList.add('hidden');
    ui.gameOver.classList.remove('hidden');
}

function resetBall() {
    state.ball.x = canvas.width / 2;
    state.ball.y = canvas.height / 2;
    state.ball.vx = 0;
    state.ball.vy = 0;
}

function updateWalletUI() {
    ui.menuCoins.innerText = state.coins;
    ui.shopCoins.innerText = state.coins;
}

function updateScoreUI() {
    ui.menuBest.innerText = state.highScore;
    ui.hudBest.innerText = state.highScore;
}

// --- Core Logic ---
function handleInput(e) {
    if (state.screen !== 'playing') return;

    // Simple jump for now
    state.ball.vy = BOUNCE_FORCE;

    // Low Gravity Effect
    if (state.activeEffects.lowGravity > 0) {
        state.ball.vy *= 0.7;
    }

    // Add horizontal impulse based on tap position relative to ball
    let inputX;
    if (e.type === 'touchstart') {
        inputX = e.touches[0].clientX;
    } else {
        inputX = e.clientX;
    }

    const diffX = state.ball.x - inputX;
    state.ball.vx = diffX * 0.1;

    // Score
    let points = 1;
    if (state.activeEffects.doublePoints > 0) points = 2;

    state.score += points;
    ui.score.innerText = state.score;
    audio.playPop();

    // Spawn Particles
    for (let i = 0; i < 8; i++) {
        state.particles.push({
            x: state.ball.x,
            y: state.ball.y + state.ball.radius,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: state.selectedColor
        });
    }
}

function update() {
    if (state.screen !== 'playing') return;

    // --- Physics ---
    let gravity = GRAVITY;
    if (state.activeEffects.lowGravity > 0) gravity *= 0.5;

    state.ball.vy += gravity;
    state.ball.x += state.ball.vx;
    state.ball.y += state.ball.vy;

    // Friction
    state.ball.vx *= 0.98;

    // Ball Size Effect
    state.ball.radius = state.activeEffects.bigBall > 0 ? 30 : 20;

    // Wall collisions
    if (state.ball.x - state.ball.radius < 0) {
        state.ball.x = state.ball.radius;
        state.ball.vx *= -0.8;
    }
    if (state.ball.x + state.ball.radius > canvas.width) {
        state.ball.x = canvas.width - state.ball.radius;
        state.ball.vx *= -0.8;
    }

    // Ceiling collision
    if (state.ball.y - state.ball.radius < 0) {
        state.ball.y = state.ball.radius;
        state.ball.vy *= -0.5; // Bounce back down
    }

    // Floor collision (Game Over)
    if (state.ball.y + state.ball.radius > canvas.height) {
        gameOver();
    }

    // --- Effects Timers ---
    if (state.activeEffects.bigBall > 0) state.activeEffects.bigBall--;
    if (state.activeEffects.lowGravity > 0) state.activeEffects.lowGravity--;
    if (state.activeEffects.doublePoints > 0) state.activeEffects.doublePoints--;

    // --- Spawners ---

    // Obstacles (Score > 20)
    if (state.score > 20 && Math.random() < 0.01) {
        const side = Math.random() < 0.5 ? -1 : 1;
        state.obstacles.push({
            x: side === -1 ? -50 : canvas.width + 50,
            y: Math.random() * (canvas.height / 2),
            vx: side === -1 ? 3 + Math.random() * 3 : -3 - Math.random() * 3,
            radius: 15 + Math.random() * 20,
            color: '#ef4444'
        });
    }

    // Powerups (Random)
    if (Math.random() < 0.002) {
        const types = ['big', 'grav', '2x'];
        const type = types[Math.floor(Math.random() * types.length)];
        let color = '#fff';
        if (type === 'big') color = '#facc15'; // Yellow
        if (type === 'grav') color = '#a855f7'; // Purple
        if (type === '2x') color = '#22c55e'; // Green

        state.powerups.push({
            x: Math.random() * canvas.width,
            y: -50,
            vy: 2,
            radius: 15,
            type: type,
            color: color
        });
    }

    // --- Entities Update ---

    // Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
        let p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) state.particles.splice(i, 1);
    }

    // Obstacles
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
        let o = state.obstacles[i];
        o.x += o.vx;

        // Collision with Ball
        const dx = state.ball.x - o.x;
        const dy = state.ball.y - o.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < state.ball.radius + o.radius) {
            // Push ball away with force that scales with score
            const angle = Math.atan2(dy, dx);
            const baseForce = 15;
            const scoreMultiplier = 1 + (state.score / 100); // +1% per point, capped
            const force = Math.min(baseForce * scoreMultiplier, 50); // Max force of 50

            state.ball.vx += Math.cos(angle) * force;
            state.ball.vy += Math.sin(angle) * force;

            // Remove obstacle
            state.obstacles.splice(i, 1);
            audio.playGameOver(); // Use hit sound
            continue;
        }

        // Remove if off screen
        if (o.x < -100 || o.x > canvas.width + 100) {
            state.obstacles.splice(i, 1);
        }
    }

    // Powerups
    for (let i = state.powerups.length - 1; i >= 0; i--) {
        let p = state.powerups[i];
        p.y += p.vy;

        // Collision
        const dx = state.ball.x - p.x;
        const dy = state.ball.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < state.ball.radius + p.radius) {
            // Activate Effect (600 frames = ~10s)
            if (p.type === 'big') state.activeEffects.bigBall = 600;
            if (p.type === 'grav') state.activeEffects.lowGravity = 600;
            if (p.type === '2x') state.activeEffects.doublePoints = 600;

            state.powerups.splice(i, 1);
            audio.playCoin();
            continue;
        }

        if (p.y > canvas.height) state.powerups.splice(i, 1);
    }
}

function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Ball
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = state.selectedColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();

    // Draw Obstacles
    state.obstacles.forEach(o => {
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.fillStyle = o.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    });

    // Draw Powerups
    state.powerups.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();

        // Icon text
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let icon = '?';
        if (p.type === 'big') icon = 'B';
        if (p.type === 'grav') icon = 'G';
        if (p.type === '2x') icon = '2x';
        ctx.fillText(icon, p.x, p.y);
    });

    // Draw Particles
    state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });

    // Draw "Ground" hint
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

    // Draw Active Effects UI
    let yOffset = 150;
    if (state.activeEffects.bigBall > 0) {
        ctx.fillStyle = '#facc15';
        ctx.fillText('BIG BALL', 50, yOffset);
        yOffset += 20;
    }
    if (state.activeEffects.lowGravity > 0) {
        ctx.fillStyle = '#a855f7';
        ctx.fillText('LOW GRAVITY', 50, yOffset);
        yOffset += 20;
    }
    if (state.activeEffects.doublePoints > 0) {
        ctx.fillStyle = '#22c55e';
        ctx.fillText('DOUBLE POINTS', 50, yOffset);
        yOffset += 20;
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();
