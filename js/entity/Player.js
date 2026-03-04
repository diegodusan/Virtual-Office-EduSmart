class Player {
    constructor(x, y, map) {
        this.x = x;
        this.y = y;
        this.map = map;
        this.radius = 12; // Collision radius

        // Settings from Profile
        this.nickname = "Empleado";
        this.skinColor = "#f1c27d";
        this.outfitColor = "#3b82f6";

        this.speed = 150; // px per second
        this.runSpeedMulti = 1.8;

        this.nearbyInteractable = null;
    }

    setProfile(nickname, skin, outfit) {
        this.nickname = nickname;
        this.skinColor = skin;
        this.outfitColor = outfit;
    }

    update(dt, input) {
        let vx = input.getAxisX();
        let vy = input.getAxisY();
        let isRunning = input.isShift();

        // Normalize diagonal movement
        if (vx !== 0 && vy !== 0) {
            const length = Math.sqrt(vx * vx + vy * vy);
            vx /= length;
            vy /= length;
        }

        const currentSpeed = this.speed * (isRunning ? this.runSpeedMulti : 1);

        // Target positions
        let tx = this.x + vx * currentSpeed * dt;
        let ty = this.y + vy * currentSpeed * dt;

        // X collision
        if (!this.map.isSolid(tx + (vx > 0 ? this.radius : -this.radius), this.y)) {
            this.x = tx;
        }

        // Y collision
        if (!this.map.isSolid(this.x, ty + (vy > 0 ? this.radius : -this.radius))) {
            this.y = ty;
        }

        // Restrain bounds hard fallback
        this.x = Math.max(this.radius, Math.min(this.map.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(this.map.height - this.radius, this.y));

        // Check nearby interactables
        this.nearbyInteractable = this.map.getInteractableAt(this.x, this.y);
    }

    render(ctx) {
        // Sombra
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.radius, this.radius, this.radius / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cuerpo (Outfit)
        ctx.fillStyle = this.outfitColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Cabeza (Skin)
        ctx.fillStyle = this.skinColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y - 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar indicador E si hay interactable cerca
        if (this.nearbyInteractable) {
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(this.x - 10, this.y - 35, 20, 20);
            ctx.fillStyle = "#fff";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("E", this.x, this.y - 21);
        }

        // Nombre
        ctx.fillStyle = "black";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";

        // Delineado
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.strokeText(this.nickname, this.x, this.y - 20 - (this.nearbyInteractable ? 20 : 0));
        ctx.fillText(this.nickname, this.x, this.y - 20 - (this.nearbyInteractable ? 20 : 0));
    }
}
