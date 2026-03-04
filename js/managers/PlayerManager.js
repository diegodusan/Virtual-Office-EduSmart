class PlayerManager {
    constructor(map) {
        this.map = map;
        this.localPlayer = null;
        this.remotePlayers = new Map(); // id -> RemotePlayer
    }

    setLocalPlayer(player) {
        this.localPlayer = player;
    }

    addRemotePlayer(id, x, y, skin, outfit, nickname) {
        const rp = new RemotePlayer(id, x, y);
        rp.nickname = nickname;
        rp.skinColor = skin;
        rp.outfitColor = outfit;
        this.remotePlayers.set(id, rp);
        return rp;
    }

    removeRemotePlayer(id) {
        this.remotePlayers.delete(id);
    }

    update(dt) {
        if (!this.localPlayer) return;

        // Limpiar remotos desconectados o expirar (en un juego real se quitan via websocket)

        for (let rp of this.remotePlayers.values()) {
            rp.update(dt);
        }
    }

    render(ctx) {
        // Draw remote players first (under local player normally, though proper depth sort by Y is better)

        // Depth Sort (Y based)
        let entities = [];
        if (this.localPlayer) entities.push(this.localPlayer);
        for (let rp of this.remotePlayers.values()) entities.push(rp);

        entities.sort((a, b) => a.y - b.y);

        for (let ent of entities) {
            ent.render(ctx);
        }
    }

    // Para la demo, simulamos 2 NPCs moviendose y estando quietos
    initDemoNPCs() {
        const npc1 = this.addRemotePlayer("npc_1", 200, 200, "#ffdbac", "#10b981", "Alice (Sim)");
        npc1.isNPC = true;
        npc1.patrolPoints = [
            { x: 200, y: 200 },
            { x: 600, y: 200 },
            { x: 600, y: 500 },
            { x: 200, y: 500 }
        ];

        const npc2 = this.addRemotePlayer("npc_2", 800, 700, "#8d5524", "#8b5cf6", "Bob (Sim)");
        npc2.isNPC = true;
        // Se queda quieto en la oficina 1
        npc2.patrolPoints = [{ x: 800, y: 700 }];
    }
}
