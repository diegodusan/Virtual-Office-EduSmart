/**
 * Interfaz Desacoplada para Signaling.
 * En el futuro, se puede instanciar aquí un WebSocket, Firebase Realtime Database, 
 * o lo que el backend requiera sin modificar el MVP visual.
 */
class SignalingAdapter {
    constructor() {
        this.onMessage = null; // Callback: (msg) => {}
    }

    connect(urlOrConfig) {
        console.log("[Signaling] TODO: Connect to explicit signaling server: " + urlOrConfig);
        // Ex: this.ws = new WebSocket(urlOrConfig);
        // this.ws.onmessage = (e) => this.onMessage(JSON.parse(e.data));
    }

    send(message) {
        console.log("[Signaling] Enviar datos: ", message);
        // Ex: this.ws.send(JSON.stringify(message));
    }

    // Para la demo, podemos inyectar mensajes locales
    simulateIncomingMessage(msg) {
        if (this.onMessage) {
            this.onMessage(msg);
        }
    }
}
