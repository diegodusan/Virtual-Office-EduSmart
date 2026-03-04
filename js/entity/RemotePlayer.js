class RemotePlayer {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.radius = 12;

        this.nickname = "Remote";
        this.skinColor = "#ffdbac";
        this.outfitColor = "#ef4444";

        // Simulacion en demo
        this.isNPC = false;
        this.patrolPoints = [];
        this.patrolIndex = 0;
        this.timer = 0;
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    update(dt) {
        // Interpolacion suave para remotos
        this.x += (this.targetX - this.x) * 10 * dt;
        this.y += (this.targetY - this.y) * 10 * dt;

        // Logica dummy si es NPC de demo
        if (this.isNPC && this.patrolPoints.length > 0) {
            const p = this.patrolPoints[this.patrolIndex];
            const dist = Math.hypot(p.x - this.targetX, p.y - this.targetY);

            if (dist < 5) {
                this.timer += dt;
                if (this.timer > 2) { // pause 2 secs
                    this.timer = 0;
                    this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
                }
            } else {
                const angle = Math.atan2(p.y - this.targetY, p.x - this.targetX);
                const speed = 100;
                this.targetX += Math.cos(angle) * speed * dt;
                this.targetY += Math.sin(angle) * speed * dt;
            }
        }
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

        // Nombre
        ctx.fillStyle = "black";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";

        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.strokeText(this.nickname, this.x, this.y - 20);
        ctx.fillText(this.nickname, this.x, this.y - 20);
    }
}
