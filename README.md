# Virtual Office MVP

¡Bienvenido al prototipo de **Virtual Office**! Una experiencia 2D top-down estilo videojuego, diseñada nativamente en **HTML, CSS, y JavaScript puro** (Vanilla JS). Sin frameworks de terceros, sin bundlers, ni backend.
Diseñado para hostearse de forma 100% gratuita usando GitHub Pages.

## Características:
- Motor 2D renderizado en Canvas estable y minimalista.
- Avatar personalizable y persitencia local en `localStorage`.
- Sistema de interacciones: "Archiveros" repartidos por el mapa y accesibles mediante la tecla `E`.
- Proximidad WebRTC (Simulación UI/DEMO): Acércate a otros jugadores ("Remotos") para habilitar su feed de video.
- Panel UI overlay (glassmorphism moderno) integrado.
- Soporte base para controles mobile (Botones en HUD + Joypad style).

## ¿Cómo desplegar gratis en GitHub Pages?

1. Crea un nuevo repositorio público en [GitHub](https://github.com/new).
2. Sube todos los archivos (esta misma carpeta completa) a la rama `main` del repositorio.
3. En la interfaz web de tu repositorio de GitHub, ve a **Settings** (Configuración) de ese repositorio.
4. En el menú de la izquierda (Side-panel), busca la sección **Pages** (Páginas).
5. Bajo el apartado **Source** o **Build and Deployment**, selecciona que GitHub Pages despliegue desde la rama `main` (o `master` dependiendo del nombre), apuntando a la carpeta `/ (root)`.
6. Haz clic en **Save** y espera unos un par de minutos. Podrás ver un enlace público estilo: `https://[tu-username].github.io/[nombre-repo]/`.

¡Listo! Cualquier persona que abra el link podrá entrar a la sala.

## Para probar localmente

Solamente abre el archivo `index.html` en Chrome, Firefox o Edge, o usa la extensión *Live Server* de VS Code si quieres servirlo desde localhost (Requerido para que la API WebRTC pida permisos de cámara en algunos navegadores sin fallar por políticas de CORS/SSL).

## Siguientes Pasos (TODO)

1. **Signaling Server Real:** Se dejó configurado la clase `SignalingAdapter.js` y `WebRTCManager.js` para conectar un WebSocket fácilmente (o Firebase RTDB).
2. **Archiveros con GDrive:** El UI del archivador en `UIController.js` está listo para disparar los flujos de OAuth en caso de querer integrar la API de Google Drive.
