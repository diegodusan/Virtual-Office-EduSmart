class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");

        // Handle window resize
        window.addEventListener("resize", () => this.resize());
        this.resize();

        // Camera properties (centered around player)
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1.5 // 2D retro feel
        };
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Smooth disabled for retro look
        this.ctx.imageSmoothingEnabled = false;
    }

    beginFrame() {
        // Clear screen with a dark base
        this.ctx.fillStyle = "#1e1e24";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        // Center camera on screen
        const hw = this.canvas.width / 2;
        const hh = this.canvas.height / 2;

        this.ctx.translate(hw, hh);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));
    }

    endFrame() {
        this.ctx.restore();
    }

    // Centramos la camara apuntando al jugador
    follow(targetX, targetY) {
        // Lerp simple para la camara
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
    }
}
