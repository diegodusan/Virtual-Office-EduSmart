class GameLoop {
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;

        this.lastTime = 0;
        this.running = false;
        this.fps = 0;
        this.frameCounter = 0;
        this.lastFpsUpdate = 0;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    stop() {
        this.running = false;
    }

    loop(currentTime) {
        if (!this.running) return;

        // Calculate dt in seconds
        let dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap dt to prevent massive jumps when tab is inactive
        if (dt > 0.1) dt = 0.1;

        // FPS tracking
        this.frameCounter++;
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCounter;
            this.frameCounter = 0;
            this.lastFpsUpdate = currentTime;

            // Update UI FPS (hacked direct DOM update for MVP)
            const fpsEl = document.getElementById("fps-counter");
            if (fpsEl) fpsEl.textContent = this.fps;
        }

        // Cycle phases
        this.updateFn(dt);
        this.renderFn();

        requestAnimationFrame((time) => this.loop(time));
    }
}
