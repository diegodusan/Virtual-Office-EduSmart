// Main Application Bootstrap
let map, localPlayer, playerManager, rtcManager, signaling, uiController, renderer, gameLoop;

function init() {
    console.log("[App] Instanciando motor...");

    // Core engine
    renderer = new Renderer("game-canvas");

    // Mundo
    map = new Map();

    // Managers
    playerManager = new PlayerManager(map);
    rtcManager = new WebRTCManager(playerManager);
    signaling = new SignalingAdapter();

    // Jugador Local (Spawn point hardcodeado temporal)
    localPlayer = new Player(100, 100, map);
    playerManager.setLocalPlayer(localPlayer);

    // UI Controller
    uiController = new UIController(localPlayer);

    // Listen to Enter event from Modal
    window.addEventListener("game-started", startGame);

    // First render to show background
    renderer.beginFrame();
    map.render(renderer.ctx);
    renderer.endFrame();

    // Check saved profile to auto-fill or just show modal
    // Modal is visible by default in HTML
}

async function startGame() {
    console.log("[App] Iniciando juego, pidiendo cámara...");

    // 1. Pedir Medios
    await rtcManager.initLocalMedia();

    // 2. Setup DEMO network environment
    signaling.connect("demo-mode");
    playerManager.initDemoNPCs();

    // 3. Start loop
    gameLoop = new GameLoop(update, render);
    gameLoop.start();

    console.log("[App] GameLoop Iniciado.");
}

function update(dt) {
    // 1. Input y Movimiento Local
    localPlayer.update(dt, input);

    // 2. Gestion de Zona / Room
    const currentRoom = map.getRoomAt(localPlayer.x, localPlayer.y);
    uiController.updateCurrentRoom(currentRoom);

    // 3. Interacciones (Archiveros) -> E key
    if (input.isInteract() && localPlayer.nearbyInteractable) {
        if (localPlayer.nearbyInteractable.type === "archivero") {
            uiController.openFichero(localPlayer.nearbyInteractable.name);
            // Reset input state to avoid multiple opens (hacky para MVP)
            input.keys["KeyE"] = false;
        }
    }

    // 4. Update Remotes / NPCs
    playerManager.update(dt);

    // 5. Update Networking / Proximity
    rtcManager.updateProximity();

    // 6. Update Camera
    renderer.follow(localPlayer.x, localPlayer.y);
}

function render() {
    renderer.beginFrame();

    // Dibujar Mundo
    map.render(renderer.ctx);

    // Dibujar Entidades
    playerManager.render(renderer.ctx);

    renderer.endFrame();
}

// Arrancar cuando cargue el DOM
window.onload = init;
