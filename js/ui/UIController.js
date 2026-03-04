class UIController {
    constructor(player) {
        this.player = player;

        // Cargar persistencia
        this.loadProfile();

        this.bindEvents();
    }

    loadProfile() {
        const profileStr = localStorage.getItem("playerProfile");
        if (profileStr) {
            try {
                const profile = JSON.parse(profileStr);
                document.getElementById("input-nickname").value = profile.nickname || "Empleado";
                document.getElementById("select-skin").value = profile.skinColor || "#ffdbac";
                document.getElementById("select-outfit").value = profile.outfitColor || "#3b82f6";
            } catch (e) { }
        }
    }

    bindEvents() {
        // Modal Perfil / Login
        document.getElementById("btn-enter").addEventListener("click", () => {
            const nickname = document.getElementById("input-nickname").value || "Empleado";
            const skin = document.getElementById("select-skin").value;
            const outfit = document.getElementById("select-outfit").value;

            // Persistir
            localStorage.setItem("playerProfile", JSON.stringify({ nickname, skinColor: skin, outfitColor: outfit }));

            // Setear Jugador
            this.player.setProfile(nickname, skin, outfit);

            // UI
            document.getElementById("player-name-display").textContent = nickname;
            document.getElementById("profile-modal").classList.add("hidden");

            // Event disparado en main.js para init camera
            window.dispatchEvent(new Event("game-started"));
        });

        // Chat
        document.getElementById("btn-send-chat").addEventListener("click", () => this.sendChat());
        document.getElementById("chat-input").addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.sendChat();
        });

        // Ficheros Modals
        document.getElementById("btn-close-fichero").addEventListener("click", () => {
            document.getElementById("fichero-modal").classList.add("hidden");
            // Devolver foco al juego
            window.focus();
        });

        document.getElementById("btn-create-file").addEventListener("click", () => {
            alert("Acción Simulada: Archivo creado. (Falta integrar cloud)");
        });

        document.getElementById("btn-upload-file").addEventListener("click", () => {
            alert("Acción Simulada: Subiendo archivo local... (Falta integrar cloud)");
        });
    }

    sendChat() {
        const input = document.getElementById("chat-input");
        const text = input.value.trim();
        if (text === "") return;

        const messages = document.getElementById("chat-messages");
        const msgEl = document.createElement("p");
        msgEl.innerHTML = `<b>${this.player.nickname}:</b> ${text}`;
        messages.appendChild(msgEl);

        // Auto scroll
        messages.scrollTop = messages.scrollHeight;

        input.value = "";
    }

    openFichero(archiveroType) {
        document.getElementById("fichero-modal").classList.remove("hidden");
        document.getElementById("fichero-title").textContent = archiveroType;

        const list = document.getElementById("fichero-list");
        list.innerHTML = `
            <div class="folder-item"><span>📁 Presupuestos_2024.pdf</span> <span>↓</span></div>
            <div class="folder-item"><span>📁 Actas_Reunion.docx</span> <span>↓</span></div>
            <div class="folder-item"><span>📄 Notas_Rapidas.txt</span> <span>↓</span></div>
        `;
    }

    updateCurrentRoom(roomName) {
        const el = document.getElementById("current-room");
        if (el && el.textContent !== roomName) {
            el.textContent = roomName;
        }
    }
}
