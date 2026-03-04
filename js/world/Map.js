class Map {
    constructor() {
        this.tileSize = 32;
        this.cols = 40;
        this.rows = 30;
        this.width = this.cols * this.tileSize;
        this.height = this.rows * this.tileSize;

        // Simple tilemap definition
        // 0: Floor, 1: Wall/Desk, 2: Archivero
        this.grid = [];
        this.generateMap();

        // Regions/Rooms: x, y, width, height, name
        this.rooms = [
            { id: "lobby", name: "Lobby", x: 0, y: 0, w: 20 * 32, h: 30 * 32 },
            { id: "conf", name: "Sala de Conferencias", x: 20 * 32, y: 0, w: 20 * 32, h: 15 * 32 },
            { id: "office1", name: "Oficina 1", x: 20 * 32, y: 15 * 32, w: 10 * 32, h: 15 * 32 },
            { id: "office2", name: "Oficina 2", x: 30 * 32, y: 15 * 32, w: 10 * 32, h: 15 * 32 }
        ];

        // Archiveros interactivos (x, y en pixeles, id, name)
        this.interactables = [
            { x: 5 * 32, y: 5 * 32, w: 32, h: 32, id: "files_hr", name: "Recursos Humanos", type: "archivero" },
            { x: 6 * 32, y: 5 * 32, w: 32, h: 32, id: "files_clients", name: "Clientes A", type: "archivero" },
            { x: 25 * 32, y: 5 * 32, w: 32, h: 32, id: "files_projects", name: "Proyectos Activos", type: "archivero" }
        ];
    }

    generateMap() {
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.cols; c++) {
                // Borders are walls
                if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
                    row.push(1);
                }
                // Walls between rooms
                else if (c === 20 && r !== 10 && r !== 25) { // Doors at r=10, r=25
                    row.push(1);
                }
                else if (r === 15 && c > 20 && c !== 25 && c !== 35) { // Doors for offices
                    row.push(1);
                }
                else if (c === 30 && r > 15 && r !== 22) { // Wall between office 1 and 2
                    row.push(1);
                }
                else {
                    row.push(0); // Floor
                }
            }
            this.grid.push(row);
        }

        // Add interactables to grid as walls (collidable)
        this.grid[5][5] = 2;
        this.grid[5][6] = 2;
        this.grid[5][25] = 2;
    }

    isSolid(x, y) {
        const c = Math.floor(x / this.tileSize);
        const r = Math.floor(y / this.tileSize);

        if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return true;
        return this.grid[r][c] !== 0; // Anything not 0 is solid
    }

    getRoomAt(x, y) {
        for (let room of this.rooms) {
            if (x >= room.x && x <= room.x + room.w && y >= room.y && y <= room.y + room.h) {
                return room.name;
            }
        }
        return "Pasillo";
    }

    getInteractableAt(x, y, radius = 40) {
        for (let item of this.interactables) {
            // Check distance to center
            const cx = item.x + item.w / 2;
            const cy = item.y + item.h / 2;
            const dist = Math.hypot(x - cx, y - cy);
            if (dist < radius) return item;
        }
        return null;
    }

    render(ctx) {
        // Simple rendering loop for MVP
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.grid[r][c];
                const x = c * this.tileSize;
                const y = r * this.tileSize;

                if (cell === 1) {
                    ctx.fillStyle = "#3b4252"; // Paredes color oscuro
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);

                    // Borde ligero
                    ctx.strokeStyle = "#4c566a";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, this.tileSize, this.tileSize);
                } else if (cell === 2) {
                    ctx.fillStyle = "#d08770"; // Archivero
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);

                    // Detalle
                    ctx.fillStyle = "#bf616a";
                    ctx.fillRect(x + 4, y + 4, this.tileSize - 8, 4);
                } else {
                    // Piso (patron ajedrez pálido)
                    ctx.fillStyle = (r + c) % 2 === 0 ? "#eceff4" : "#e5e9f0";
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                }
            }
        }

        // Dibujar nombres de zonas para claridad
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.font = "20px var(--font-main)";
        ctx.textAlign = "center";
        for (let room of this.rooms) {
            ctx.fillText(room.name, room.x + room.w / 2, room.y + room.h / 2);
        }
    }
}
