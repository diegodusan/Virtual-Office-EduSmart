class WebRTCManager {
    constructor(playerManager) {
        this.playerManager = playerManager;

        this.localStream = null;
        this.peers = {}; // id -> RTCPeerConnection (Para el modo REAL)
        this.mediaElements = {}; // id -> HTMLVideoElement / HTMLAudioElement

        // Distancia fisica para WebRTC
        this.PROXIMITY_RADIUS = 300;
        this.HYSTERESIS = 50;
        this.globalAudioVolume = 1.0;
    }

    setGlobalVolume(vol) {
        this.globalAudioVolume = vol;
        for (let id in this.mediaElements) {
            let el = this.mediaElements[id].querySelector('video, audio');
            if (el) el.volume = vol;
        }
    }

    async initLocalMedia() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const localVideoEl = document.getElementById("local-video");
            if (localVideoEl) {
                localVideoEl.srcObject = this.localStream;
            }
            console.log("[WebRTC] Medios locales obtenidos.");
        } catch (e) {
            console.warn("[WebRTC] Permisos denegados o sin cámara.", e);
            // Mostrar UI Placeholder si falla
            const localVideoEl = document.getElementById("local-video");
            if (localVideoEl) {
                localVideoEl.parentElement.innerHTML = `<div style="width:160px; height:120px; background:#333; display:flex; align-items:center; justify-content:center; border-radius:8px;"><span style="font-size:12px;color:#aaa;">Sin Cámara</span></div>`;
            }
        }
    }

    // Modo REAL: Crear conexión peer
    createPeerConnection(peerId, signalingAdapter) {
        console.log(`[WebRTC] TODO: RTCPeerConnection implementation for ${peerId}`);
        /*
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => pc.addTrack(track, this.localStream));
        }

        pc.ontrack = (event) => {
            this.handleRemoteTrack(peerId, event.streams[0]);
        };

        // ICE Candidates, SDP Offers/Answers go via signalingAdapter.send(...)
        this.peers[peerId] = pc;
        return pc;
        */
    }

    handleRemoteTrack(peerId, stream) {
        // En una implementacion real, crear el elemento de video aqui
        console.log(`[WebRTC] Received track from ${peerId}`);
    }

    // Lógica de Proximidad acoplada a la interfaz visual (válida tanto para Demo como para Real)
    updateProximity() {
        if (!this.playerManager.localPlayer) return;

        const lp = this.playerManager.localPlayer;
        const container = document.getElementById("remote-videos-container");

        for (let [id, rp] of this.playerManager.remotePlayers.entries()) {
            const dist = Math.hypot(lp.x - rp.x, lp.y - rp.y);
            let isConnected = dist < this.PROXIMITY_RADIUS;

            // Hysteresis: wait until they are further to disconnect
            if (this.mediaElements[id] && dist > this.PROXIMITY_RADIUS + this.HYSTERESIS) {
                isConnected = false;
            } else if (this.mediaElements[id] && dist <= this.PROXIMITY_RADIUS + this.HYSTERESIS) {
                isConnected = true;
            }

            // Actualizar UI
            if (isConnected) {
                if (!this.mediaElements[id]) {
                    this.createRemoteUIPanel(id, rp.nickname);
                }

                // Efecto de distanciado/volumen visual (simulado)
                const card = this.mediaElements[id];
                card.classList.remove("disconnected");
                card.classList.add("connected");

                // TODO (Real): node.gain.value = 1.0 - (dist / MAX_DIST);

            } else {
                if (this.mediaElements[id]) {
                    const card = this.mediaElements[id];
                    card.classList.add("disconnected");
                    card.classList.remove("connected");

                    // TODO (Real): node.gain.value = 0;

                    // Si se aleja mucho, borrar panel para no saturar UI
                    if (dist > this.PROXIMITY_RADIUS + this.HYSTERESIS + 200) {
                        this.removeRemoteUIPanel(id);
                    }
                }
            }
        }
    }

    createRemoteUIPanel(id, nickname) {
        const container = document.getElementById("remote-videos-container");

        const card = document.createElement("div");
        card.id = `remote-card-${id}`;
        card.className = "remote-card connected";

        card.innerHTML = `
            <div class="flex-row space-between align-center">
                <span><span class="status-indicator"></span><b style="font-size:12px;">${nickname}</b></span>
            </div>
            <!-- Video Placeholder para DEMO -->
            <video autoplay playsinline muted loop style="background:var(--accent-hover);"></video>
            <div style="font-size:10px; text-align:center; color:white; z-index:2; position:absolute; top:60px; left:0; right:0;">Remote/Simulado</div>
        `;

        container.appendChild(card);
        this.mediaElements[id] = card;

        const videoEl = card.querySelector('video');
        if (videoEl) {
            videoEl.volume = this.globalAudioVolume;
        }

        // Simular conexion
        const status = document.createElement("div");
    }

    removeRemoteUIPanel(id) {
        const card = this.mediaElements[id];
        if (card && card.parentNode) {
            card.parentNode.removeChild(card);
        }
        delete this.mediaElements[id];
    }
}
