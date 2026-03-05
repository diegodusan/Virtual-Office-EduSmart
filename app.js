/* =====================================================================
   EDUSMART VIRTUAL HQ - V3 (MAP EXPANSION, DOORS, OUTDOORS, NPC)
   Architecture: Vanilla JS, No Frameworks, Zero Dependencies 
====================================================================== */

const TILE = 48; // Base tile size 

/* =====================================================================
   1. INPUT MANAGER
====================================================================== */
class InputManager {
    constructor() {
        this.keys = {};
        window.addEventListener("keydown", e => { if (window.gameEngineInputEnabled) this.keys[e.code] = true; });
        window.addEventListener("keyup", e => this.keys[e.code] = false);
    }
    isDown(code) { return this.keys[code] === true; }
    getAxis() {
        let x = 0, y = 0;
        if (this.isDown("ArrowLeft") || this.isDown("KeyA")) x -= 1;
        if (this.isDown("ArrowRight") || this.isDown("KeyD")) x += 1;
        if (this.isDown("ArrowUp") || this.isDown("KeyW")) y -= 1;
        if (this.isDown("ArrowDown") || this.isDown("KeyS")) y += 1;

        if (x !== 0 && y !== 0) {
            const len = Math.sqrt(x * x + y * y); x /= len; y /= len;
        }
        return { x, y };
    }
    isShift() { return this.isDown("ShiftLeft") || this.isDown("ShiftRight"); }
    isInteract() { return this.isDown("KeyE"); }
    consumeInteract() { this.keys["KeyE"] = false; }
    isWork() { return this.isDown("KeyF"); }
    consumeWork() { this.keys["KeyF"] = false; }
    isPlatform() { return this.isDown("KeyG"); }
    consumePlatform() { this.keys["KeyG"] = false; }
    isReaction() { return this.isDown("KeyT"); }
    consumeReaction() { this.keys["KeyT"] = false; }
    isPhone() { return this.isDown("KeyP"); }
    consumePhone() { this.keys["KeyP"] = false; }
}

/* =====================================================================
   2. WORLD SPRITES & RENDERERS (POKEMON AESTHETIC)
====================================================================== */
function outlineRect(ctx, x, y, w, h, fill, stroke = '#27272a', lw = 2) {
    ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h);
}
function outlineArc(ctx, x, y, r, fill, stroke = '#27272a', lw = 2, s = 0, e = Math.PI * 2) {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, s, e); ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, r, s, e); ctx.stroke();
}
function shadowRect(ctx, x, y, w, h) {
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(x + 6, y + 8, w, h);
}
function shadowArc(ctx, x, y, r) {
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.arc(x + 4, y + 6, r, 0, Math.PI * 2); ctx.fill();
}

const DrawSprites = {
    plant: (ctx, x, y) => {
        shadowArc(ctx, x + 24, y + 24, 16); // Pot shadow
        // Maceta terracota
        outlineRect(ctx, x + 14, y + 24, 20, 20, '#b45309', '#78350f');
        outlineRect(ctx, x + 12, y + 18, 24, 8, '#d97706', '#92400e');
        // Planta Monstera gruesa estilo stardew (capas oscuras atras, claras adelante)
        shadowArc(ctx, x + 24, y + 10, 20); // leaf shadow
        outlineArc(ctx, x + 24, y + 10, 18, '#065f46', '#022c22');
        outlineArc(ctx, x + 14, y + 8, 14, '#059669', '#064e3b');
        outlineArc(ctx, x + 34, y + 12, 12, '#059669', '#064e3b');
        outlineArc(ctx, x + 24, y + 2, 12, '#34d399', '#065f46');
    },
    desk: (ctx, x, y, options) => {
        let isManager = options && options.type === 'gerente';
        shadowRect(ctx, x, y, 48, 30);

        // Patas
        outlineRect(ctx, x + 4, y + 10, 6, 30, '#3f2c19');
        outlineRect(ctx, x + 38, y + 10, 6, 30, '#3f2c19');

        // Madera estilo stardew
        let topColor = isManager ? '#78350f' : '#8b5a2b';
        let edgeColor = isManager ? '#451a03' : '#5c3a21';

        outlineRect(ctx, x, y + 6, 48, 24, topColor, '#27272a');
        ctx.fillStyle = edgeColor; ctx.fillRect(x + 1, y + 1, 46, 6); // Grosor de mesa
        ctx.strokeStyle = '#27272a'; ctx.lineWidth = 2; ctx.strokeRect(x, y, 48, 30);

        if (options && options.pc) {
            // Monitor retro crema/gris
            outlineRect(ctx, x + 21, y - 4, 6, 12, '#94a3b8'); // Pie 
            outlineRect(ctx, x + 9, y - 20, 30, 18, '#cbd5e1', '#334155');
            ctx.fillStyle = isManager ? '#0369a1' : '#0ea5e9'; ctx.fillRect(x + 11, y - 18, 26, 14); // Pantalla

            // Detalles del teclado
            outlineRect(ctx, x + 12, y + 14, 16, 6, '#f8fafc', '#94a3b8', 1);
            ctx.fillStyle = '#cbd5e1'; ctx.fillRect(x + 13, y + 15, 14, 4); // teclas simuladas

            // Mouse y pad
            ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(x + 30, y + 12, 10, 10);
            outlineRect(ctx, x + 32, y + 14, 4, 6, '#f8fafc', '#94a3b8', 1);

            // Accesorios (Taza de Cafe y papeles)
            if (!isManager) {
                // Taza
                outlineArc(ctx, x + 40, y + 8, 3, '#fef08a', '#854d0e', 1); // taza
                ctx.fillStyle = '#451a03'; ctx.fillRect(x + 39, y + 7, 2, 2); // cafe
                // block notas
                outlineRect(ctx, x + 4, y + 12, 6, 8, '#fef9c3', '#ca8a04', 1);
            } else {
                // Taza gerente
                outlineArc(ctx, x + 40, y + 8, 3, '#e0f2fe', '#0284c7', 1);
                ctx.fillStyle = '#451a03'; ctx.fillRect(x + 39, y + 7, 2, 2);
                // Lapicero
                outlineRect(ctx, x + 6, y + 8, 4, 6, '#475569', '#1e293b', 1);
                ctx.fillStyle = '#ef4444'; ctx.fillRect(x + 7, y + 6, 2, 4);
            }
        }

        if (options && options.isMyDesk) {
            ctx.fillStyle = "rgba(250, 204, 21, 0.3)";
            ctx.fillRect(x - 4, y - 24, 56, 60);
            ctx.fillStyle = "#facc15"; ctx.font = "16px VT323"; ctx.textAlign = "center";
            ctx.fillText("Tu PC", x + 24, y - 28);
        }
    },
    chair: (ctx, x, y) => {
        shadowRect(ctx, x + 12, y + 16, 24, 20); // Shadow
        // Llantas / Base
        outlineRect(ctx, x + 22, y + 24, 4, 14, '#1e293b');
        outlineRect(ctx, x + 8, y + 22, 6, 10, '#0f172a'); outlineRect(ctx, x + 34, y + 22, 6, 10, '#0f172a');
        // Asiento Acolchadito Stardew
        outlineRect(ctx, x + 12, y + 26, 24, 12, '#64748b', '#334155');
        outlineRect(ctx, x + 14, y + 6, 20, 22, '#475569', '#1e293b'); // Respaldo mullido
        // Textura respaldo
        ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(x + 16, y + 8, 8, 18);
    },
    archivero: (ctx, x, y) => {
        shadowRect(ctx, x + 6, y, 36, 48);
        outlineRect(ctx, x + 6, y, 36, 48, '#78350f', '#451a03'); // Madera oscura
        ctx.fillStyle = '#92400e'; ctx.fillRect(x + 8, y + 2, 32, 6); // Tope luz
        for (let i = 0; i < 3; i++) {
            let cy = y + 12 + (i * 12);
            outlineRect(ctx, x + 10, cy, 28, 10, '#b45309', '#451a03', 1); // Cajones madera clara
            ctx.fillStyle = '#fcd34d'; ctx.fillRect(x + 22, cy + 3, 4, 4); // Tirador dorado
        }
    },
    sofa: (ctx, x, y, w) => {
        shadowRect(ctx, x, y, w, 40);
        outlineRect(ctx, x, y + 14, w, 26, '#991b1b', '#450a0a'); // Sillon rojo velvet
        ctx.fillStyle = '#ef4444'; ctx.fillRect(x + 2, y + 16, w - 4, 8); // Cojin base luz
        outlineRect(ctx, x + 4, y, w - 8, 16, '#7f1d1d', '#450a0a'); // Respaldo
        // Apoyabrazos
        outlineRect(ctx, x, y + 6, 16, 32, '#b91c1c', '#450a0a');
        outlineRect(ctx, x + w - 16, y + 6, 16, 32, '#b91c1c', '#450a0a');
    },
    confTable: (ctx, x, y, w, h) => {
        shadowRect(ctx, x, y, w, h);
        outlineRect(ctx, x, y, w, h - 16, '#d97706', '#78350f'); // Madera calida mesa grande
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(x + 2, y + h - 15, w - 4, 13);
        ctx.strokeStyle = '#451a03'; ctx.strokeRect(x, y, w, h - 16);
        outlineRect(ctx, x + w / 2 - 24, y + h / 2 - 18, 48, 16, '#1e293b'); // Decoracion central

        // Agregar laptops distribuidas
        for (let i = 10; i < w - 40; i += 60) {
            // laptop arriba
            outlineRect(ctx, x + i, y + 10, 16, 10, '#94a3b8', '#334155', 1);
            ctx.fillStyle = '#3b82f6'; ctx.fillRect(x + i + 2, y + 12, 12, 6);
            // laptop abajo
            outlineRect(ctx, x + i + 20, y + h - 36, 16, 12, '#e2e8f0', '#64748b', 1);
            ctx.fillStyle = '#0284c7'; ctx.fillRect(x + i + 22, y + h - 34, 12, 6);
        }
    },
    wallFront: (ctx, x, y, w, h, isGlass) => {
        shadowRect(ctx, x, y, w, h); // sombra piso
        if (isGlass) {
            ctx.fillStyle = "rgba(186, 230, 253, 0.4)"; ctx.fillRect(x, y, w, h);
            outlineRect(ctx, x, y, w, 8, '#475569'); outlineRect(ctx, x, y + h - 8, w, 8, '#475569');
        } else {
            outlineRect(ctx, x, y, w, h, '#eaddc5', '#a38f72'); // Pared crema
            outlineRect(ctx, x, y, w, 14, '#fef08a', '#a38f72'); // Tope superior empapelado
            outlineRect(ctx, x, y + h - 12, w, 12, '#8b5a2b', '#451a03'); // Zócalo madera

            // Textura sutil manchitas pared
            ctx.fillStyle = "rgba(0,0,0,0.03)";
            for (let i = 0; i < w; i += 20) ctx.fillRect(x + i, y + 16, 4, 4);
        }
    },
    wallSide: (ctx, x, y, w, h, isGlass) => {
        shadowRect(ctx, x, y, w, h);
        if (isGlass) {
            ctx.fillStyle = "rgba(186, 230, 253, 0.6)"; ctx.fillRect(x, y, w, h);
        } else {
            outlineRect(ctx, x, y, w, h, '#d4c5ae', '#a38f72');
            outlineRect(ctx, x, y, w, 14, '#eaddc5', '#a38f72');
        }
    },
    tree: (ctx, x, y) => {
        ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath(); ctx.ellipse(x + 48, y + 85, 30, 12, 0, 0, Math.PI * 2); ctx.fill();
        outlineRect(ctx, x + 40, y + 50, 16, 40, '#78350f', '#451a03'); // Tronco
        outlineArc(ctx, x + 48, y + 32, 36, '#064e3b', '#022c22');
        outlineArc(ctx, x + 30, y + 16, 24, '#059669', '#064e3b');
        outlineArc(ctx, x + 64, y + 20, 24, '#047857', '#064e3b');
        outlineArc(ctx, x + 48, y + 6, 26, '#34d399', '#059669');
    },
    waterCooler: (ctx, x, y) => {
        shadowRect(ctx, x + 12, y + 24, 24, 32);
        outlineRect(ctx, x + 12, y + 24, 24, 32, '#e2e8f0', '#94a3b8');
        outlineRect(ctx, x + 16, y + 30, 4, 4, '#ef4444', '#991b1b', 1); outlineRect(ctx, x + 28, y + 30, 4, 4, '#3b82f6', '#1d4ed8', 1);
        outlineRect(ctx, x + 14, y + 48, 20, 6, '#475569');
        // Botellon translucido
        ctx.fillStyle = "rgba(56, 189, 248, 0.7)"; ctx.fillRect(x + 14, y, 20, 24);
        outlineRect(ctx, x + 14, y, 20, 24, "rgba(56, 189, 248, 0.4)", '#0369a1', 2);
    },
    shelf: (ctx, x, y) => {
        shadowRect(ctx, x, y - 12, 48, 36);
        outlineRect(ctx, x, y - 12, 48, 36, '#8b5a2b', '#451a03'); // Librero madera oscura
        ctx.fillStyle = '#451a03'; ctx.fillRect(x + 4, y - 8, 40, 6); ctx.fillRect(x + 4, y + 4, 40, 6); ctx.fillRect(x + 4, y + 16, 40, 6); // vacios profundos
        // Libros Stardew style
        ctx.fillStyle = '#fcd34d'; outlineRect(ctx, x + 6, y - 10, 6, 10, '#fcd34d', '#b45309', 1);
        outlineRect(ctx, x + 14, y - 12, 8, 12, '#38bdf8', '#0284c7', 1);
        outlineRect(ctx, x + 24, y - 8, 4, 8, '#f43f5e', '#be123c', 1);

        outlineRect(ctx, x + 10, y + 2, 6, 10, '#a7f3d0', '#059669', 1);
        outlineRect(ctx, x + 28, y + 4, 8, 8, '#c084fc', '#7e22ce', 1);

        outlineRect(ctx, x + 6, y + 14, 10, 10, '#fbbf24', '#d97706', 1);
        outlineRect(ctx, x + 30, y + 12, 6, 12, '#9ca3af', '#4b5563', 1);
    },
    rug: (ctx, x, y, w, h) => {
        // Redibujado al nivel del suelo en renderFloors
    },
    door: (ctx, x, y, w, h) => {
        // Puerta explícita abierta "estilo Stardew"
        ctx.fillStyle = '#d4c5ae'; ctx.fillRect(x, y, w, h); // Alfombra pase

        if (w > h) { // Puerta Horizontal
            // Marco
            outlineRect(ctx, x, y, w, 8, '#78350f', '#451a03');
            // Hoja abierta hacia arriba
            outlineRect(ctx, x, y - w + 8, 8, w, '#b45309', '#451a03');
            // Sombra que proyecta la puerta abierta
            ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x + 8, y - w + 16, 8, w - 8);
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y + 8, w, h - 8); // sombra interior pase
        } else { // Puerta vertical
            outlineRect(ctx, x, y, 8, h, '#78350f', '#451a03');
            // Hoja abierta
            outlineRect(ctx, x - h + 8, y, h, 8, '#b45309', '#451a03');
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + 8, y, w - 8, h);
        }
    },
    wallWindow: (ctx, x, y, w, h) => {
        shadowRect(ctx, x, y, w, h); // sombra base
        outlineRect(ctx, x, y, w, h, '#eaddc5', '#a38f72'); // Pared base
        outlineRect(ctx, x, y + h - 12, w, 12, '#8b5a2b', '#451a03'); // Zócalo

        // Ventana panorámica
        outlineRect(ctx, x + 4, y + 4, w - 8, h - 20, '#f8fafc', '#94a3b8');
        ctx.fillStyle = '#bae6fd'; ctx.fillRect(x + 6, y + 6, w - 12, h - 24); // vidrio celeste

        // Reflejos vidrio
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.moveTo(x + 10, y + h - 18); ctx.lineTo(x + w - 10, y + 8); ctx.lineTo(x + w - 6, y + 8); ctx.lineTo(x + 14, y + h - 18); ctx.fill();

        // Rays de luz solar que caen al piso (composición aditiva/transparente)
        ctx.fillStyle = 'rgba(253, 230, 138, 0.15)';
        ctx.beginPath();
        ctx.moveTo(x + 4, y + h - 10); ctx.lineTo(x + w - 4, y + h - 10); // base ventana
        ctx.lineTo(x + w + 40, y + h + 80); ctx.lineTo(x - 20, y + h + 80); // proyeccion en el pizo
        ctx.fill();
    },
    wallPainting: (ctx, x, y, w, h) => {
        shadowRect(ctx, x, y, w, h);
        outlineRect(ctx, x, y, w, h, '#eaddc5', '#a38f72');
        outlineRect(ctx, x, y, w, 14, '#fef08a', '#a38f72');
        outlineRect(ctx, x, y + h - 12, w, 12, '#8b5a2b', '#451a03');

        // Cuadro colgando
        let pw = 32; let ph = 24;
        let px = x + w / 2 - pw / 2; let py = y + 16;
        shadowRect(ctx, px, py, pw, ph);
        outlineRect(ctx, px, py, pw, ph, '#fbbf24', '#b45309'); // marco dorado
        outlineRect(ctx, px + 4, py + 4, pw - 8, ph - 8, '#38bdf8', '#0284c7', 1); // pintura paisaje
        ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(px + 10, py + 14, 4, 0, Math.PI * 2); ctx.fill(); // arbolito pintura
        ctx.fillStyle = '#fde047'; ctx.fillRect(px + 20, py + 6, 4, 4); // solete
    },
    lamp: (ctx, x, y) => {
        shadowArc(ctx, x + 12, y + 30, 10);
        outlineRect(ctx, x + 10, y + 30, 4, 4, '#1e293b'); // base metal
        outlineRect(ctx, x + 11, y + 10, 2, 20, '#64748b'); // palo
        // Sombrilla
        outlineArc(ctx, x + 12, y + 8, 12, '#fef08a', '#ca8a04'); // amarillo prendido
        // luz
        ctx.fillStyle = 'rgba(253, 230, 138, 0.1)';
        ctx.beginPath(); ctx.arc(x + 12, y + 8, 40, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 12, y + 8, 20, 0, Math.PI * 2); ctx.fill();
    },
    presScreen: (ctx, x, y, w, h) => {
        shadowRect(ctx, x, y, w, h);
        outlineRect(ctx, x, y, w, h, '#0f172a', '#020617');
        ctx.fillStyle = '#1e293b'; ctx.fillRect(x + 8, y + 8, w - 16, h - 16);

        if (window._isPresentationActive) {
            ctx.fillStyle = '#38bdf8'; ctx.fillRect(x + 10, y + 10, w - 20, h - 20); // Pantalla Encedida
            ctx.fillStyle = '#0284c7'; ctx.font = "bold 20px Inter"; ctx.textAlign = "center";
            ctx.fillText("🔴 PROYECTANDO", x + w / 2, y + h / 2 + 6);
        } else {
            ctx.fillStyle = '#020617'; ctx.fillRect(x + 10, y + 10, w - 20, h - 20); // Pantalla Apagada
            ctx.fillStyle = '#334155'; ctx.font = "bold 14px Inter"; ctx.textAlign = "center";
            ctx.fillText("[F] Encender Proyector", x + w / 2, y + h / 2 + 5);
        }
    }
};

class GameObject {
    constructor({ type, x, y, w, h, id = null, interactable = false, pc = false, extra = null, isGlass = false }) {
        this.type = type; this.rect = { x, y, w, h };
        this.id = id; this.interactable = interactable; this.pc = pc; this.extra = extra; this.isGlass = isGlass;

        this.col = { x, y: y + h / 2, w, h: h / 2 };

        if (type === 'wall' || type === 'desk' || type === 'archivero') {
            this.col = { x, y: y + 12, w, h: h - 12 };
        } else if (type === 'sofa') {
            this.col = { x, y: y + 10, w, h: h - 10 };
        } else if (type === 'confTable') {
            this.col = { x: x + 10, y: y + 10, w: w - 20, h: h - 20 };
        } else if (type === 'tree') {
            this.col = { x: x + 36, y: y + 70, w: 24, h: 20 }; // Solo el tronco
        } else if (type === 'waterCooler') {
            this.col = { x: x + 12, y: y + 24, w: 24, h: 32 };
        } else if (type === 'shelf') {
            this.col = { x, y: y - 12, w: 48, h: 48 };
        } else if (type === 'presScreen') {
            this.col = { x, y, w, h }; // Colision entera
        } else {
            // Sillas, Plantas, Doors, Rugs
            this.col = { x: 0, y: 0, w: 0, h: 0 };
        }
        if (type === 'rug') {
            this.sortY = -999999;
        } else {
            this.sortY = y + h;
        }
    }

    render(ctx) {
        let r = this.rect;
        switch (this.type) {
            case 'plant': DrawSprites.plant(ctx, r.x, r.y); break;
            case 'desk': DrawSprites.desk(ctx, r.x, r.y, { pc: this.pc, type: this.extra, isMyDesk: window._myDeskId && this.id === window._myDeskId });
                if (this.pc && this.id) {
                    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.font = "14px VT323"; ctx.textAlign = "center";
                    let labelStr = this.id.replace(/-T|-B/g, ''); // Fix visual trunc
                    ctx.fillText(labelStr, r.x + r.w / 2, r.y - 25);
                }
                break;
            case 'chair': DrawSprites.chair(ctx, r.x, r.y); break;
            case 'archivero': DrawSprites.archivero(ctx, r.x, r.y); break;
            case 'sofa': DrawSprites.sofa(ctx, r.x, r.y, r.w); break;
            case 'confTable': DrawSprites.confTable(ctx, r.x, r.y, r.w, r.h); break;
            case 'tree': DrawSprites.tree(ctx, r.x, r.y); break;
            case 'waterCooler': DrawSprites.waterCooler(ctx, r.x, r.y); break;
            case 'shelf': DrawSprites.shelf(ctx, r.x, r.y); break;
            case 'rug': DrawSprites.rug(ctx, r.x, r.y, r.w, r.h); break;
            case 'door': DrawSprites.door(ctx, r.x, r.y, r.w, r.h); break;
            case 'wallWindow': DrawSprites.wallWindow(ctx, r.x, r.y, r.w, r.h); break;
            case 'wallPainting': DrawSprites.wallPainting(ctx, r.x, r.y, r.w, r.h); break;
            case 'lamp': DrawSprites.lamp(ctx, r.x, r.y); break;
            case 'wall':
                if (r.w > r.h) DrawSprites.wallFront(ctx, r.x, r.y, r.w, r.h, this.isGlass);
                else DrawSprites.wallSide(ctx, r.x, r.y, r.w, r.h, this.isGlass);
                break;
        }

        // Indicadores Flotantes
        if (this.interactable && this.highlighted) {
            if (this.type === 'desk' && window._myDeskId && this.id === window._myDeskId) {
                // UI doble boton Ocupado / Plataforma
                ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
                ctx.beginPath(); ctx.roundRect(r.x + r.w / 2 - 45, r.y - 65, 90, 48, 8); ctx.fill();
                ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.stroke();

                // [F] Ocupado
                ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.roundRect(r.x + r.w / 2 - 38, r.y - 58, 20, 16, 4); ctx.fill();
                ctx.fillStyle = "#0f172a"; ctx.font = "bold 11px Inter"; ctx.textAlign = "center"; ctx.fillText("F", r.x + r.w / 2 - 28, r.y - 46);
                ctx.fillStyle = "#f8fafc"; ctx.textAlign = "left"; ctx.fillText("Ocupado", r.x + r.w / 2 - 14, r.y - 46);

                // [G] Plataforma
                ctx.fillStyle = "#10b981"; ctx.beginPath(); ctx.roundRect(r.x + r.w / 2 - 38, r.y - 38, 20, 16, 4); ctx.fill();
                ctx.fillStyle = "#0f172a"; ctx.textAlign = "center"; ctx.fillText("G", r.x + r.w / 2 - 28, r.y - 26);
                ctx.fillStyle = "#f8fafc"; ctx.textAlign = "left"; ctx.fillText("Acceder", r.x + r.w / 2 - 14, r.y - 26);

            } else {
                ctx.fillStyle = "#facc15";
                ctx.beginPath(); ctx.roundRect(r.x + r.w / 2 - 16, r.y - 50, 32, 22, 8); ctx.fill();
                ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.stroke();
                ctx.fillStyle = "#0f172a"; ctx.font = "900 14px Inter"; ctx.textAlign = "center";
                ctx.fillText("E", r.x + r.w / 2, r.y - 34);
            }
        }
    }
}

class GameMap {
    constructor() {
        this.width = 72 * TILE; // Compactado 72x46
        this.height = 46 * TILE;

        this.floors = [
            // Piso base completo para sellar resquicios (bordes verdes)
            { id: 'base_foundation', x: 0, y: 0, w: 72, h: 46, type: 'wood_dark', name: '' },
            // Corredores principales (Fondo de madera clara)
            { id: 'pasillos', x: 20, y: 15, w: 40, h: 29, type: 'wood', name: '' },
            { id: 'pasillos_top', x: 2, y: 15, w: 18, h: 5, type: 'wood', name: '' },

            // Izquierda
            { id: 'lounge', x: 2, y: 2, w: 18, h: 12, type: 'wood', name: 'Lounge' },
            { id: 'recepcion', x: 2, y: 21, w: 18, h: 23, type: 'wood', name: 'Recepción' },

            // Centro Arriba
            { id: 'gerencia', x: 21, y: 2, w: 12, h: 12, type: 'carpet_red', name: 'Gerencia' },
            { id: 'reyes', x: 34, y: 2, w: 12, h: 12, type: 'office', name: 'Reyes Asesorías' },
            { id: 'tesifive', x: 47, y: 2, w: 12, h: 12, type: 'carpet_green', name: 'TesiFive' },

            // Centro Abajo
            { id: 'vacias_inf1', x: 20, y: 35, w: 12, h: 9, type: 'wood_dark', name: 'Oficina 1' },
            { id: 'vacias_inf2', x: 33, y: 35, w: 12, h: 9, type: 'wood_dark', name: 'Oficina 2' },
            { id: 'dufy', x: 46, y: 35, w: 14, h: 9, type: 'carpet_green', name: 'Dufy Asesorías' },

            // Centro Medio (Open Space Compacto)
            { id: 'empleados', x: 22, y: 22, w: 36, h: 11, type: 'carpet', name: 'Empleados EduSmart' },

            // Derecha
            { id: 'conf', x: 60, y: 2, w: 10, h: 22, type: 'carpet_blue', name: 'Sala Conferencias' },
            { id: 'archivo', x: 60, y: 25, w: 10, h: 19, type: 'office', name: 'Archivo Central' }
        ];

        this.objects = [];
        this.desks = [];
        this.grassPattern = null;
        this.generateEntities();
    }

    addObj(type, tx, ty, tw = 1, th = 1, id = null, interactable = false, pc = false, extra = null, isGlass = false) {
        let obj = new GameObject({ type, id, interactable, pc, extra, isGlass, x: tx * TILE, y: ty * TILE, w: tw * TILE, h: th * TILE });
        this.objects.push(obj);
        return obj;
    }

    registerDesk(obj, zoneId) {
        this.desks.push({ obj, zone: zoneId, occupied: false });
    }

    generateEntities() {
        // --- BORDES DEL EDIFICIO (72x46) ---
        this.addObj('wall', 1, 1, 70, 1); // Tope
        this.addObj('wall', 1, 44, 15, 1); this.addObj('wall', 20, 44, 52, 1); // Bot. Hueco en X: 16-19
        this.addObj('door', 16, 44, 4, 1); // Entrada ppal real (recepcion sur)

        // Ventanales (Arriba y Abajo)
        this.addObj('wallWindow', 6, 1, 6, 1); this.addObj('wallWindow', 24, 1, 6, 1);
        this.addObj('wallWindow', 37, 1, 6, 1); this.addObj('wallWindow', 50, 1, 6, 1); this.addObj('wallWindow', 62, 1, 6, 1);
        this.addObj('wallWindow', 23, 34, 6, 1); this.addObj('wallWindow', 36, 34, 6, 1); this.addObj('wallWindow', 51, 34, 6, 1);
        this.addObj('wallWindow', 62, 44, 6, 1);

        this.addObj('wall', 1, 2, 1, 42); // lateral Izq
        this.addObj('wall', 71, 2, 1, 42); // lateral Der

        // --- DIVISIONES INTERNAS SEGMENTADAS (Paredes Huecas) ---
        // Lounge | Recepción (Horizontal + Puerta)
        this.addObj('wall', 2, 14, 14, 1); this.addObj('door', 16, 14, 4, 1);

        // Recepcion | Pasillo (Vertical)
        this.addObj('wall', 20, 20, 1, 24);

        // Piso Superior (Gerencia/Reyes/Tesifive) -> Pasillo Superior (Total X=20 a X=59)
        this.addObj('wall', 20, 14, 6, 1); this.addObj('door', 26, 14, 3, 1);
        this.addObj('wall', 29, 14, 6, 1); this.addObj('door', 35, 14, 3, 1);
        this.addObj('wall', 38, 14, 7, 1); this.addObj('door', 45, 14, 3, 1);
        this.addObj('wall', 48, 14, 11, 1);

        // Divisiones Verticales Gerencia | Reyes | TesiFive
        this.addObj('wall', 20, 2, 1, 12); // Pared Izquierda Gerencia (Separa del Lounge)
        this.addObj('wall', 33, 2, 1, 12);
        this.addObj('wall', 46, 2, 1, 12);

        // Division Vertical Conf_Archivo | Pasillo Derecho
        this.addObj('wall', 59, 2, 1, 14); // conf pared 
        this.addObj('door', 59, 16, 1, 3); // puerta izq-der conf
        this.addObj('wall', 59, 19, 1, 12);
        this.addObj('door', 59, 31, 1, 3); // puerta arch
        this.addObj('wall', 59, 34, 1, 10);

        // Separacion Horizontal Conf | Archivo
        this.addObj('wall', 60, 24, 11, 1);

        // Techo de oficinas inferiores (Gen 1, Gen 2, Dufy)
        this.addObj('wall', 16, 34, 8, 1); this.addObj('door', 24, 34, 3, 1);
        this.addObj('wall', 27, 34, 8, 1); this.addObj('door', 35, 34, 3, 1);
        this.addObj('wall', 38, 34, 8, 1); this.addObj('door', 46, 34, 3, 1);
        this.addObj('wall', 49, 34, 10, 1);

        // Sep Vertical inferior (Gen 1 | Gen 2 | Dufy)
        this.addObj('wall', 32, 35, 1, 10);
        this.addObj('wall', 45, 35, 1, 10);

        // Cuadros
        this.addObj('wallPainting', 21, 14, 4, 1); this.addObj('wallPainting', 30, 14, 4, 1);
        this.addObj('wallPainting', 39, 14, 4, 1); this.addObj('wallPainting', 21, 34, 3, 1);
        this.addObj('wallPainting', 39, 34, 4, 1);

        // Pantalla Conf
        this.addObj('presScreen', 61, 2, 8, 2, 'pantalla_conf', true);

        // --- MUEBLES ---
        // Recepción y Lounge
        this.addObj('confTable', 6, 28, 10, 2); this.addObj('wall', 6, 28, 1, 6);
        this.addObj('sofa', 10, 36, 4, 1);
        this.addObj('sofa', 6, 5, 4, 1); this.addObj('sofa', 12, 5, 4, 1);
        this.addObj('desk', 8, 10, 1, 1, null, false, false, 'empleado');
        this.addObj('lamp', 4, 4); this.addObj('plant', 6, 38);

        // Pasillos (Coolers / Plantas)
        this.addObj('rug', 22, 16, 36, 6);
        this.addObj('waterCooler', 21, 20); this.addObj('plant', 56, 18);
        this.addObj('lamp', 20, 32);

        // Empleados Open Space (3x4 -> Ajustado)
        for (let c = 24; c <= 54; c += 6) {
            for (let r = 24; r <= 31; r += 5) {
                let d1 = this.addObj('desk', c, r, 1, 1, `PC-${c}-${r}-T`, true, true, 'empleado'); this.addObj('chair', c, r + 1);
                let d2 = this.addObj('desk', c + 2, r, 1, 1, `PC-${c + 2}-${r}-B`, true, true, 'empleado'); this.addObj('chair', c + 2, r + 1);
                this.registerDesk(d1, 'empleado'); this.registerDesk(d2, 'empleado');
            }
        }
        this.addObj('lamp', 22, 23); this.addObj('lamp', 55, 23);

        // --- MUEBLES: GERENCIA EDUSMART (VIP) ---
        let gdesk = this.addObj('desk', 27, 4, 1, 1, 'PC Gerencia', true, true, 'gerente'); this.addObj('chair', 27, 5);
        this.registerDesk(gdesk, 'gerente'); this.addObj('archivero', 22, 3, 1, 1, 'Arch. Gerencia', true);
        this.addObj('plant', 30, 4); this.addObj('plant', 22, 10);
        this.addObj('sofa', 24, 8, 4, 1); // Asientos invitados VIP
        this.addObj('presScreen', 24, 2, 4, 1, 'mini_pantalla_gerencia', true); // Mini Pantalla Inteligente

        // --- MUEBLES: REYES ---
        let rdesk = this.addObj('desk', 38, 4, 1, 1, 'PC Reyes', true, true, 'gerente'); this.addObj('chair', 38, 5);
        this.registerDesk(rdesk, 'coordinador_reyes'); this.addObj('sofa', 35, 8, 4, 1); this.addObj('plant', 44, 4);
        this.addObj('presScreen', 38, 2, 4, 1, 'mini_pantalla_reyes', true); // Mini Pantalla Inteligente

        // --- MUEBLES: TESIFIVE ---
        let tdesk = this.addObj('desk', 52, 4, 1, 1, 'PC TesiFive', true, true, 'gerente'); this.addObj('chair', 52, 5);
        this.registerDesk(tdesk, 'coordinador_tesifive'); this.addObj('plant', 56, 4); this.addObj('lamp', 48, 4);
        this.addObj('presScreen', 51, 2, 4, 1, 'mini_pantalla_tesifive', true); // Mini Pantalla Inteligente

        // --- MUEBLES: OFICINAS INFERIORES GENÉRICAS ---
        this.addObj('desk', 24, 38, 1, 1, 'Gen 1', true, true, 'empleado'); this.addObj('chair', 24, 39);
        this.addObj('presScreen', 26, 34, 4, 1, 'mini_pantalla_gen1', true); // Mini Pantalla Inteligente

        this.addObj('desk', 37, 38, 1, 1, 'Gen 2', true, true, 'empleado'); this.addObj('chair', 37, 39);
        this.addObj('presScreen', 39, 34, 4, 1, 'mini_pantalla_gen2', true); // Mini Pantalla Inteligente

        // --- MUEBLES: DUFY ---
        let dfdesk = this.addObj('desk', 52, 38, 1, 1, 'PC Dufy', true, true, 'gerente'); this.addObj('chair', 52, 39);
        this.addObj('sofa', 47, 40, 4, 1); this.registerDesk(dfdesk, 'coordinador_dufy');
        this.addObj('presScreen', 51, 34, 4, 1, 'mini_pantalla_dufy', true); // Mini Pantalla Inteligente

        // Sala Conf (Redimensionada)
        this.addObj('confTable', 63, 6, 4, 14);
        for (let y = 6; y <= 18; y += 3) { this.addObj('chair', 61, y); this.addObj('chair', 68, y); }
        this.addObj('waterCooler', 67, 21); this.addObj('plant', 61, 21);

        // Archivo Central (Compactado)
        for (let ix = 61; ix <= 67; ix += 3) { this.addObj('shelf', ix, 28); this.addObj('shelf', ix, 36); }
        this.addObj('archivero', 61, 41, 1, 1, 'A1', true); this.addObj('archivero', 64, 41, 1, 1, 'A2', true); this.addObj('archivero', 67, 41, 1, 1, 'A3', true);
        let archdesk = this.addObj('desk', 64, 42, 1, 1, 'PC Archivo', true, true, 'empleado'); this.addObj('chair', 64, 43);

        // Ext Trees
        for (let ox = 0; ox < 30; ox += 6) { this.addObj('tree', ox, 48); this.addObj('tree', ox + 3, 52); }
        for (let ox = 35; ox < 72; ox += 8) { this.addObj('tree', ox, 49); }
    }

    renderFloors(ctx) {
        if (!this.patterns) {
            this.patterns = {};
            let makePattern = (c1, c2, drawFn) => {
                let p = document.createElement('canvas'); p.width = TILE; p.height = TILE;
                let pct = p.getContext('2d');
                pct.fillStyle = c1; pct.fillRect(0, 0, TILE, TILE);
                pct.fillStyle = c2;
                drawFn(pct);
                return ctx.createPattern(p, 'repeat');
            };

            this.patterns.grass = makePattern('#22c55e', '#16a34a', p => {
                p.fillRect(0, 0, TILE / 2, TILE / 2); p.fillRect(TILE / 2, TILE / 2, TILE / 2, TILE / 2);
                p.strokeStyle = '#15803d'; p.lineWidth = 1; p.strokeRect(0, 0, TILE, TILE);
            });
            this.patterns.wood = makePattern('#d4a373', '#b5835a', p => {
                p.fillRect(0, 8, TILE, 3); p.fillRect(0, 24, TILE, 3); p.fillRect(0, 40, TILE, 3);
                p.strokeStyle = 'rgba(0,0,0,0.1)'; p.lineWidth = 1; p.strokeRect(0, 0, TILE, TILE);
            });
            this.patterns.wood_dark = makePattern('#8b5a2b', '#6b4423', p => {
                p.fillRect(0, 12, TILE, 4); p.fillRect(0, 36, TILE, 4);
                p.strokeStyle = 'rgba(0,0,0,0.2)'; p.lineWidth = 1; p.strokeRect(0, 0, TILE, TILE);
            });
            this.patterns.office = makePattern('#f8fafc', '#e2e8f0', p => {
                p.fillRect(0, 0, TILE / 2, TILE / 2); p.fillRect(TILE / 2, TILE / 2, TILE / 2, TILE / 2);
            });
            this.patterns.carpet = makePattern('#9ca3af', '#6b7280', p => {
                p.fillRect(0, 0, TILE / 2, TILE / 2); p.fillRect(TILE / 2, TILE / 2, TILE / 2, TILE / 2);
            });
            this.patterns.carpet_blue = makePattern('#3b82f6', '#2563eb', p => {
                p.fillRect(0, 0, TILE / 2, TILE / 2); p.fillRect(TILE / 2, TILE / 2, TILE / 2, TILE / 2);
            });
            this.patterns.carpet_green = makePattern('#10b981', '#059669', p => {
                p.fillRect(0, 0, TILE / 2, TILE / 2); p.fillRect(TILE / 2, TILE / 2, TILE / 2, TILE / 2);
            });
            this.patterns.carpet_red = makePattern('#ef4444', '#dc2626', p => {
                p.fillRect(0, 0, TILE / 2, TILE / 2); p.fillRect(TILE / 2, TILE / 2, TILE / 2, TILE / 2);
            });
        }

        ctx.fillStyle = this.patterns.grass;
        ctx.fillRect(0, 0, this.width, this.height);

        for (let f of this.floors) {
            let fx = f.x * TILE; let fy = f.y * TILE; let fw = f.w * TILE; let fh = f.h * TILE;

            if (f.type.startsWith('carpet')) {
                // Suelo base madera 100%
                ctx.fillStyle = this.patterns.wood;
                ctx.fillRect(fx, fy, fw, fh);
                // Alfombra inset (margen de 8px)
                ctx.fillStyle = this.patterns[f.type];
                ctx.fillRect(fx + 8, fy + 8, fw - 16, fh - 16);
                ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 2; ctx.strokeRect(fx + 8, fy + 8, fw - 16, fh - 16);
            } else {
                ctx.fillStyle = this.patterns[f.type] || this.patterns.wood;
                ctx.fillRect(fx, fy, fw, fh);
            }

            ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1; ctx.strokeRect(fx, fy, fw, fh);

            if (f.name) {
                ctx.fillStyle = "rgba(0,0,0,0.2)";
                ctx.font = "bold 34px Inter"; ctx.textAlign = "center";
                ctx.fillText(f.name.toUpperCase(), fx + fw / 2, fy + fh / 2 + 15);
            }
        }
    }

    checkCollision(rect) {
        for (let obj of this.objects) {
            if (obj.col.w > 0 && this._intersect(rect, obj.col)) return true;
        }
        return false;
    }

    getInteractableNear(rect) {
        for (let obj of this.objects) {
            if (!obj.interactable) continue;
            let range = { x: rect.x - 30, y: rect.y - 30, w: rect.w + 60, h: rect.h + 60 };
            if (this._intersect(range, obj.col.w > 0 ? obj.col : obj.rect)) return obj;
        }
        return null;
    }

    getRoomAt(x, y) {
        let rs = this.floors.find(f => x >= f.x * TILE && x <= (f.x + f.w) * TILE && y >= f.y * TILE && y <= (f.y + f.h) * TILE);
        return rs ? rs : null;
    }

    _intersect(r1, r2) { return !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y); }
}

/* =====================================================================
   3. ENTITIES (Player, NPC, SpawnSystem)
====================================================================== */
class BasePlayer {
    constructor(id, x, y, isLocal) {
        this.id = id; this.x = x; this.y = y; this.isLocal = isLocal;

        this.nickname = isLocal ? "Tú" : "Remoto";
        this.role = "empleado";
        this.props = { skin: "#ffdbac", hair: "#27272a", shirt: "#3b82f6", pants: "#1e293b", glasses: false, hat: false };
        this.w = 24; this.h = 24;
        this.speed = 280;

        this.timer = 0; this.frame = 0;
        this.connectedDist = false;

        this.isWorking = false;
        this.sortY = 0;
    }

    updateAnim(dt, isMoving) {
        if (this.isWorking) {
            this.frame = 4; // sentado
        } else if (isMoving) {
            this.timer += dt * 8; // Velocidad de caminata ajustada
            this.frame = Math.floor(this.timer) % 4;
        } else {
            this.frame = 0; this.timer = 0;
        }
        this.sortY = this.y + this.h / 2;
    }

    render(ctx) {
        const cx = this.x; const cy = this.y;
        const skin = this.props.skin || '#ffdbac';
        const hair = this.props.hair || '#27272a';
        const shirt = this.props.shirt || '#3b82f6';
        const pants = this.props.pants || '#1e293b';

        const bodyType = this.props.body || 'masculino_delgado';
        const isFemale = bodyType.startsWith('femenino');
        const isRobusto = bodyType.includes('robusto') || bodyType.includes('curvilineo') || bodyType.includes('musculoso');
        const isCurvilinea = bodyType.includes('curvilineo');
        const isAlto = bodyType.includes('alto') || bodyType.includes('alta');
        const isMusculoso = bodyType.includes('musculoso');

        const hairStyle = this.props.hairStyle || 'corto';
        const outfit = this.props.outfit || 'casual';
        const acc = this.props.accessory || 'ninguno';

        // 1. Sombra base
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.ellipse(cx, cy + 18, 14, 6, 0, 0, Math.PI * 2); ctx.fill();

        // Helpers de dibujo con borde grueso (Stardew Style)
        const drawRect = (x, y, w, h, fill, border = '#0f172a', lw = 2) => {
            ctx.fillStyle = fill; ctx.strokeStyle = border; ctx.lineWidth = lw;
            ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke();
        };

        const drawRoundedRect = (x, y, w, h, r, fill, border = '#0f172a', lw = 2) => {
            ctx.fillStyle = fill; ctx.strokeStyle = border; ctx.lineWidth = lw;
            ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.stroke();
        };

        const drawArc = (x, y, r, fill, border = '#0f172a', lw = 2, start = 0, end = Math.PI * 2) => {
            ctx.fillStyle = fill; ctx.strokeStyle = border; ctx.lineWidth = lw;
            ctx.beginPath(); ctx.arc(x, y, r, start, end); ctx.fill();
            if (lw > 0) ctx.stroke();
        };

        // --- ANIMACIÓN DE CAMINADO ---
        // Frames: 0 (Idle), 1 (Right leg up), 2 (Idle), 3 (Left leg up), 4 (Sitting)
        let baseHeight = isAlto ? 18 : 14;
        let legL_Y = cy + 4, legR_Y = cy + 4;
        let legL_H = baseHeight, legR_H = baseHeight;
        let armL_Y = cy - (isAlto ? 10 : 8), armR_Y = cy - (isAlto ? 10 : 8);

        if (this.frame === 1) { legL_Y -= 4; legL_H -= 2; armR_Y -= 2; }
        else if (this.frame === 3) { legR_Y -= 4; legR_H -= 2; armL_Y -= 2; }
        else if (this.frame === 4) { legL_Y -= 2; legR_Y -= 2; legL_H = 10; legR_H = 10; }

        // 2. Cabello Trasero ... (Omitido visualmente igual, anclaje)
        let hairYOffset = isAlto ? 4 : 0;
        if (hairStyle === 'largo') {
            drawRoundedRect(cx - 15, cy - 25 - hairYOffset, 30, 35, 4, hair);
        } else if (hairStyle === 'coleta') {
            drawRoundedRect(cx - 12, cy - 25 - hairYOffset, 24, 25, 6, hair);
            drawRoundedRect(cx - 8, cy - 5 - hairYOffset, 16, 12, 4, hair);
        }

        // 3. Brazo Trasero (Derecho)
        let armW = isMusculoso ? 8 : (isFemale ? 5 : (isRobusto ? 8 : 6));
        let torsoW = isMusculoso ? 24 : (isRobusto ? 22 : (isCurvilinea ? 18 : (isFemale ? 14 : 18)));
        let shoulderX = torsoW / 2 - 1;

        let armLength = isAlto ? 18 : 14;
        let sleeveLength = isAlto ? 10 : 8;

        if (outfit === 'deportivo_corto' || outfit === 'traje_bano' || outfit === 'verano_playa' || outfit === 'vestido_noche' || outfit === 'vestido_verano') {
            sleeveLength = isAlto ? 4 : 3;
        } else if (outfit === 'invierno_abrigo' || outfit === 'invierno_sueter' || outfit === 'laboratorio' || outfit === 'pijama') {
            sleeveLength = armLength; // Manga larga
        }
        if (outfit === 'traje_bano' && !isFemale) { sleeveLength = 0; }

        let sleeveColorR = shirt;
        if (outfit === 'laboratorio') sleeveColorR = '#f8fafc';
        else if (outfit === 'punk_cuero') sleeveColorR = '#1e293b';
        else if (outfit === 'invierno_abrigo') sleeveColorR = '#78350f';

        if (this.frame !== 4) drawRoundedRect(cx + shoulderX, armR_Y, armW, armLength, skin);
        if (this.frame !== 4 && sleeveLength > 0) drawRoundedRect(cx + shoulderX, armR_Y, armW, sleeveLength, sleeveColorR);

        // 4. Piernas (Pantalones o Falda)
        let legW = isMusculoso ? 8 : (isFemale ? 6 : (isRobusto ? 8 : 7));
        let legSpace = torsoW / 2 - (isFemale ? 1 : 2);

        let rxOffset = cx + legSpace / 2 + (this.frame === 4 ? 2 : 0) - (isFemale ? 1 : 0);
        let lxOffset = cx - legSpace / 2 - legW - (this.frame === 4 ? 1 : 0) + (isFemale ? 1 : 0);

        let pColor = pants;
        if (outfit === 'vestido' || outfit === 'vestido_noche' || outfit === 'vestido_verano' || outfit === 'traje_bano' || outfit === 'deportivo_corto') pColor = skin; // Skin por defecto
        if (outfit === 'overol' || outfit === 'pijama' || outfit === 'deportivo_chandal') pColor = shirt; // Conjunto 1 sola pieza

        // Dibujar Piernas
        if (outfit === 'deportivo_corto' || outfit === 'traje_bano' || outfit === 'vestido_verano') {
            drawRoundedRect(rxOffset, legR_Y, legW, legR_H, 3, skin);
            drawRoundedRect(lxOffset, legL_Y, legW, legL_H, 3, skin);
            let shortL = isAlto ? 8 : 6;
            if (outfit === 'traje_bano' || outfit === 'vestido_verano') shortL = isAlto ? 5 : 4;
            drawRoundedRect(rxOffset, legR_Y, legW, shortL, 2, pants);
            drawRoundedRect(lxOffset, legL_Y, legW, shortL, 2, pants);
        } else {
            drawRoundedRect(rxOffset, legR_Y, legW, legR_H, 3, pColor);
            drawRoundedRect(lxOffset, legL_Y, legW, legL_H, 3, pColor);
        }

        // Zapatos
        let shoeColor = '#fff';
        if (outfit === 'formal' || outfit === 'invierno_abrigo' || outfit === 'punk_cuero') shoeColor = '#000';
        else if (outfit === 'vestido' || outfit === 'vestido_noche' || outfit === 'vestido_verano') shoeColor = '#fb7185';
        else if (outfit === 'laboratorio' || outfit === 'deportivo_chandal') shoeColor = '#cbd5e1';
        else if (outfit === 'traje_bano') shoeColor = 'transparent'; // Descalzo o chanclas
        else if (outfit === 'pijama') shoeColor = shirt;

        if (shoeColor !== 'transparent') {
            drawRoundedRect(rxOffset - 1, legR_Y + legR_H - 4, legW + 2, 5, 2, shoeColor);
            drawRoundedRect(lxOffset - 1, legL_Y + legL_H - 4, legW + 2, 5, 2, shoeColor);
        }

        // 5. Torso y Ropa Principal
        let torsoY = cy - (isAlto ? 16 : 12);
        let torsoH = isAlto ? 20 : 16;
        let isCurvilineaFix = isCurvilinea ? 6 : 2;

        if (outfit === 'vestido' || outfit === 'vestido_noche' || outfit === 'vestido_verano') {
            let faldaLargo = (outfit === 'vestido_noche') ? (isAlto ? 28 : 24) : (outfit === 'vestido_verano' ? (isAlto ? 16 : 12) : torsoH + 4);
            ctx.fillStyle = shirt; ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - torsoW / 2 + 1, torsoY);
            ctx.lineTo(cx + torsoW / 2 - 1, torsoY);
            ctx.lineTo(cx + torsoW / 2 + 6, torsoY + faldaLargo);
            ctx.lineTo(cx - torsoW / 2 - 6, torsoY + faldaLargo);
            ctx.closePath();
            ctx.fill(); ctx.stroke();

            if (outfit === 'vestido_noche') drawRect(cx - torsoW / 2 - 1, torsoY + 10, torsoW + 2, 3, '#facc15', '#cb5a04', 1);
            else if (outfit === 'vestido') drawRect(cx - torsoW / 2, torsoY + 10, torsoW, 3, '#0f172a', '#0f172a', 0);
        } else {
            drawRoundedRect(cx - torsoW / 2, torsoY, torsoW, torsoH, isCurvilineaFix, shirt);

            if (outfit === 'formal' || outfit === 'laboratorio' || outfit === 'invierno_abrigo' || outfit === 'punk_cuero' || outfit === 'verano_playa') {
                let sacoColor = (outfit === 'laboratorio') ? '#f8fafc' : (outfit === 'punk_cuero' ? '#1e293b' : (outfit === 'invierno_abrigo' ? '#78350f' : '#0f172a'));
                let solapaLargo = (outfit === 'laboratorio' || outfit === 'invierno_abrigo') ? torsoH + (isAlto ? 8 : 6) : torsoH;

                if (outfit === 'formal') {
                    let tieLength = isAlto ? 14 : 10;
                    drawRect(cx - 2, torsoY, 4, tieLength, pants, '#0f172a', 1);
                } else if (outfit === 'verano_playa') { // Pecho descubierto
                    drawRoundedRect(cx - 3, torsoY, 6, 8, 2, skin, 'transparent', 0);
                    sacoColor = shirt;
                    drawRoundedRect(cx - torsoW / 2, torsoY, torsoW, torsoH, isCurvilineaFix, '#e2e8f0');
                }

                drawRect(cx - torsoW / 2, torsoY, 4, solapaLargo, sacoColor, '#0f172a', 1);
                drawRect(cx + torsoW / 2 - 4, torsoY, 4, solapaLargo, sacoColor, '#0f172a', 1);

                if (outfit === 'laboratorio' || outfit === 'invierno_abrigo') {
                    drawRect(cx - torsoW / 2, torsoY + torsoH, torsoW, (isAlto ? 8 : 6), sacoColor, '#0f172a', 1);
                }
            } else if (outfit === 'overol') {
                drawRect(cx - torsoW / 2 + 1, torsoY, 3, 6, pants, '#0f172a', 1);
                drawRect(cx + torsoW / 2 - 4, torsoY, 3, 6, pants, '#0f172a', 1);
                drawRect(cx - torsoW / 2, torsoY + 6, torsoW, torsoH - 6, pants, '#0f172a', 1);
                drawRect(cx - 2, torsoY + 8, 4, 4, '#eab308', 'transparent', 0);
            } else if (outfit === 'urbano_hoodie') {
                drawRoundedRect(cx - 6, torsoY + torsoH - 6, 12, 6, 2, '#0f172a', 'transparent', 0);
                drawRoundedRect(cx - 5, torsoY + torsoH - 5, 10, 4, shirt, 'transparent', 0);
            } else if (outfit === 'deportivo_chandal') {
                drawRect(cx - 2, torsoY, 4, torsoH, '#f8fafc', 'transparent', 0);
                drawRect(cx - torsoW / 2, torsoY + 4, torsoW, 2, '#ef4444', 'transparent', 0);
            } else if (outfit === 'invierno_sueter') {
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                for (let yy = 0; yy < torsoH; yy += 4) ctx.fillRect(cx - torsoW / 2 + 2, torsoY + yy, torsoW - 4, 2);
            } else if (outfit === 'traje_bano') {
                if (isFemale) {
                    drawRoundedRect(cx - torsoW / 2, torsoY, torsoW, torsoH, isCurvilineaFix, skin);
                    drawRoundedRect(cx - torsoW / 2 + 1, torsoY + 3, torsoW / 2 - 1, 4, shirt, '#0f172a', 1);
                    drawRoundedRect(cx + 1, torsoY + 3, torsoW / 2 - 1, 4, shirt, '#0f172a', 1);
                } else {
                    drawRoundedRect(cx - torsoW / 2, torsoY, torsoW, torsoH, isCurvilineaFix, skin);
                }
            }
        }

        // 6. Brazo Frontal (Izquierdo)
        let armLeftX = cx - torsoW / 2 - Math.max(armW - 2, 2);

        if (this.frame === 4) {
            // Sentado
            drawRoundedRect(armLeftX, cy - 8, armW, 10, sleeveColorR);
            drawRoundedRect(armLeftX, cy + 2, armW, 5, skin); // Mano
        } else {
            drawRoundedRect(armLeftX, armL_Y, armW, armLength, skin);
            if (sleeveLength > 0) drawRoundedRect(armLeftX, armL_Y, armW, sleeveLength, sleeveColorR);
        }

        // 7. CABEZA
        let headY = cy - (isAlto ? 26 : 22);
        // Orejas
        drawArc(cx - 13, headY + 2, 4, skin);
        drawArc(cx + 13, headY + 2, 4, skin);
        // Rostro Base
        drawRoundedRect(cx - 13, headY - 12, 26, 22, 10, skin); // Forma ligeramente achatada

        // 8. Ojos y Sonrisa
        ctx.fillStyle = '#0f172a';
        let eyeSeparation = isFemale ? 6 : 5;
        let eyeSize = isFemale ? 3 : 2;
        let eyeYOffset = isFemale ? headY : headY - 1;

        ctx.beginPath(); ctx.arc(cx - eyeSeparation, eyeYOffset, eyeSize, 0, Math.PI * 2); ctx.fill(); // Izq
        ctx.beginPath(); ctx.arc(cx + eyeSeparation, eyeYOffset, eyeSize, 0, Math.PI * 2); ctx.fill(); // Der

        // Brillo Ojos
        ctx.fillStyle = '#fff';
        if (isFemale) {
            ctx.beginPath(); ctx.arc(cx - eyeSeparation + 1, eyeYOffset - 1, 1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + eyeSeparation + 1, eyeYOffset - 1, 1, 0, Math.PI * 2); ctx.fill();
        }

        // Sonrisa (apenas visible)
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, headY + 4, 3, 0.2, Math.PI - 0.2); ctx.stroke();

        // Rubor
        if (isFemale) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.beginPath(); ctx.arc(cx - 9, headY + 3, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + 9, headY + 3, 3, 0, Math.PI * 2); ctx.fill();
        }

        // VELLO FACIAL
        if (this.props.facialHair && this.props.facialHair !== 'ninguno') {
            ctx.fillStyle = hair; // Mismo color que el cabello
            if (this.props.facialHair === 'candado') {
                drawRoundedRect(cx - 6, headY + 6, 12, 6, 2, hair, 'transparent', 0); // Barba
                drawRect(cx - 5, headY + 2, 10, 2, hair, 'transparent', 0); // Bigote
            } else if (this.props.facialHair === 'completa') {
                drawRoundedRect(cx - 13, headY + 4, 26, 8, 4, hair, 'transparent', 0);
            } else if (this.props.facialHair === 'bigote') {
                drawRoundedRect(cx - 6, headY + 2, 12, 3, 1, hair, 'transparent', 0);
            } else if (this.props.facialHair === 'bigote_fino') {
                drawRect(cx - 8, headY + 2, 16, 1, hair, 'transparent', 0);
            } else if (this.props.facialHair === 'chivo') {
                drawRoundedRect(cx - 4, headY + 6, 8, 8, 2, hair, 'transparent', 0); // Perilla inferior
            } else if (this.props.facialHair === 'sombreado') {
                drawRoundedRect(cx - 13, headY + 4, 26, 8, 4, 'rgba(0,0,0,0.15)', 'transparent', 0); // Sombreado translucido
            } else if (this.props.facialHair === 'leñador') {
                drawRoundedRect(cx - 14, headY + 4, 28, 14, 6, hair, 'transparent', 0); // Barba enorme
            } else if (this.props.facialHair === 'mosquetero') {
                drawRect(cx - 8, headY + 1, 16, 2, hair, 'transparent', 0);
                drawRoundedRect(cx - 2, headY + 6, 4, 6, 1, hair, 'transparent', 0);
            } else if (this.props.facialHair === 'patillas') {
                drawRect(cx - 13, headY - 2, 4, 10, hair, 'transparent', 0);
                drawRect(cx + 9, headY - 2, 4, 10, hair, 'transparent', 0);
            }
        }

        // 9. CABELLO FRONTAL
        if (hairStyle !== 'calvo') {
            if (hairStyle === 'corto' || hairStyle === 'puntiagudo') {
                drawRoundedRect(cx - 14, headY - 14, 28, 10, 5, hair); // Flequillo base
                if (hairStyle === 'puntiagudo') {
                    ctx.fillStyle = hair; ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(cx - 10, headY - 14); ctx.lineTo(cx - 5, headY - 24); ctx.lineTo(cx, headY - 14);
                    ctx.moveTo(cx, headY - 14); ctx.lineTo(cx + 6, headY - 26); ctx.lineTo(cx + 10, headY - 14);
                    ctx.fill(); ctx.stroke();
                } else {
                    drawRect(cx - 14, headY - 8, 4, 8, hair, '#0f172a', 0);
                    drawRect(cx + 10, headY - 8, 4, 8, hair, '#0f172a', 0);
                }
            } else if (hairStyle === 'largo' || hairStyle === 'coleta') {
                drawRoundedRect(cx - 14, headY - 14, 14, 12, 4, hair);
                drawRoundedRect(cx + 2, headY - 14, 12, 10, 4, hair);
                drawRoundedRect(cx - 15, headY - 4, 6, 12, 2, hair);
                drawRoundedRect(cx + 10, headY - 4, 5, 12, 2, hair);
            } else if (hairStyle === 'rapado') {
                drawRoundedRect(cx - 13, headY - 13, 26, 6, 4, hair); // Base muy corta
            } else if (hairStyle === 'afro') {
                drawArc(cx, headY - 14, 16, hair); // Esfera central
                drawArc(cx - 10, headY - 8, 12, hair); // Lados
                drawArc(cx + 10, headY - 8, 12, hair);
            } else if (hairStyle === 'raya_lado') {
                drawRoundedRect(cx - 14, headY - 14, 18, 10, 4, hair); // Mayor parte a la izq
                drawRoundedRect(cx + 6, headY - 14, 8, 8, 2, hair); // Poca parte a la der
            } else if (hairStyle === 'hongo') {
                drawArc(cx, headY - 8, 15, hair, '#0f172a', 2, Math.PI, 0); // Semi-circulo perfecto
            } else if (hairStyle === 'trenzas') {
                drawRoundedRect(cx - 14, headY - 14, 28, 8, 4, hair); // Base
                drawRect(cx - 12, headY - 6, 4, 16, hair); // Trenza izq
                drawRect(cx + 8, headY - 6, 4, 16, hair); // Trenza der
            } else if (hairStyle === 'pompadour') {
                drawRoundedRect(cx - 12, headY - 14, 24, 8, 4, hair); // Base
                drawRoundedRect(cx - 10, headY - 22, 20, 14, 10, hair); // Bulto arriba
            } else if (hairStyle === 'mohawk') {
                drawRoundedRect(cx - 4, headY - 24, 8, 20, 4, hair); // Cresta central larga
            } else if (hairStyle === 'desordenado') {
                drawRoundedRect(cx - 14, headY - 14, 28, 10, 5, hair);
                ctx.fillStyle = hair; ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cx - 12, headY - 14); ctx.lineTo(cx - 16, headY - 20); ctx.lineTo(cx - 8, headY - 14);
                ctx.moveTo(cx + 2, headY - 14); ctx.lineTo(cx + 8, headY - 22); ctx.lineTo(cx + 12, headY - 14);
                ctx.fill(); ctx.stroke();
            } else if (hairStyle === 'ondas') {
                drawRoundedRect(cx - 15, headY - 14, 30, 10, 5, hair);
                drawArc(cx - 12, headY - 4, 6, hair);
                drawArc(cx + 12, headY - 4, 6, hair);
                drawArc(cx, headY - 4, 5, hair);
            } else if (hairStyle === 'bun') {
                drawRoundedRect(cx - 14, headY - 14, 28, 10, 5, hair); // Pegado
                drawArc(cx, headY - 18, 6, hair); // Chongo superior
            }
        }

        // 10. ACCESORIOS
        if (acc === 'gafas') {
            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            drawRoundedRect(cx - 10, headY - 3, 8, 6, 2, ctx.fillStyle, '#0f172a', 2);
            drawRoundedRect(cx + 2, headY - 3, 8, 6, 2, ctx.fillStyle, '#0f172a', 2);
            drawRect(cx - 2, headY - 1, 4, 2, '#0f172a', '#0f172a', 0);
        } else if (acc === 'gafas_redondas') {
            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            drawArc(cx - 6, headY, 4, ctx.fillStyle, '#0f172a', 2);
            drawArc(cx + 6, headY, 4, ctx.fillStyle, '#0f172a', 2);
            drawRect(cx - 2, headY - 1, 4, 2, '#0f172a', '#0f172a', 0);
        } else if (acc === 'gafas_sol') {
            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            drawArc(cx - 6, headY, 4, ctx.fillStyle, '#0f172a', 2);
            drawArc(cx + 6, headY, 4, ctx.fillStyle, '#0f172a', 2);
            drawRect(cx - 2, headY - 1, 4, 2, '#0f172a', '#0f172a', 0);
        } else if (acc === 'gafas_cuadradas') {
            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3; // Lente grueso
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            drawRect(cx - 11, headY - 4, 9, 7, ctx.fillStyle, '#0f172a', 3);
            drawRect(cx + 2, headY - 4, 9, 7, ctx.fillStyle, '#0f172a', 3);
            drawRect(cx - 2, headY - 1, 4, 2, '#0f172a', '#0f172a', 0);
        } else if (acc === 'gafas_lectura') {
            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            // Medias lunas
            drawArc(cx - 6, headY + 1, 4, ctx.fillStyle, '#0f172a', 2, 0, Math.PI);
            drawArc(cx + 6, headY + 1, 4, ctx.fillStyle, '#0f172a', 2, 0, Math.PI);
            drawRect(cx - 2, headY + 1, 4, 1, '#0f172a', '#0f172a', 0);
        } else if (acc === 'headset') {
            drawArc(cx, headY - 14, 14, 'transparent', '#0f172a', 3, Math.PI, 0); // Diadema
            drawRoundedRect(cx - 16, headY - 5, 4, 10, 3, '#10b981'); // Auriculares verdes
            drawRoundedRect(cx + 12, headY - 5, 4, 10, 3, '#10b981');
            drawRect(cx - 12, headY + 2, 8, 2, '#64748b', 'transparent', 0); // Microfono
            drawArc(cx - 4, headY + 3, 2, '#eab308'); // Led
        } else if (acc === 'auriculares_nuca') {
            drawArc(cx, headY + 6, 15, 'transparent', '#1e293b', 3, 0, Math.PI); // Por detras de cuello (aprox renderizado bajo menton)
            drawRoundedRect(cx - 15, headY - 2, 3, 8, 2, '#cbd5e1'); // Auriculares in-ear asomando
            drawRoundedRect(cx + 12, headY - 2, 3, 8, 2, '#cbd5e1');
        } else if (acc === 'gorra') {
            drawRoundedRect(cx - 14, headY - 16, 28, 8, 4, shirt); // Base gorra (mismo color camisa)
            drawRect(cx - 16, headY - 8, 20, 3, shirt, '#0f172a', 2); // Visera al frente
        } else if (acc === 'gorra_atras') {
            drawRoundedRect(cx - 14, headY - 16, 28, 8, 4, shirt); // Base
            drawArc(cx + 8, headY - 10, 6, shirt, '#0f172a', 2); // Visera atras
        } else if (acc === 'sombrero') {
            drawRoundedRect(cx - 12, headY - 22, 24, 12, 2, '#451a03'); // Copa
            drawRect(cx - 18, headY - 10, 36, 3, '#451a03', '#0f172a', 2); // Ala ancha
            drawRect(cx - 12, headY - 12, 24, 2, '#ef4444', 'transparent', 0); // Cinta roja
        } else if (acc === 'boina') {
            drawRoundedRect(cx - 14, headY - 18, 24, 8, 6, '#be185d'); // Boina
            drawRect(cx + 4, headY - 20, 2, 2, '#0f172a', 'transparent', 0); // Pitutito
        } else if (acc === 'lanyard') {
            drawRect(cx - torsoW / 2 + 2, torsoY, 2, torsoH - 4, '#3b82f6', 'transparent', 0);
            drawRect(cx + torsoW / 2 - 4, torsoY, 2, torsoH - 4, '#3b82f6', 'transparent', 0);
            drawRect(cx - torsoW / 2 + 2, torsoY + torsoH - 5, torsoW - 4, 2, '#3b82f6', 'transparent', 0);
            drawRect(cx - 3, torsoY + torsoH - 6, 6, 8, '#fff', '#0f172a', 1);
        } else if (acc === 'corbata_moño') {
            drawRect(cx - 4, torsoY + 1, 8, 4, '#ef4444', '#0f172a', 1); // Centro moño
            ctx.fillStyle = '#ef4444'; ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx - 4, torsoY + 3); ctx.lineTo(cx - 8, torsoY + 1); ctx.lineTo(cx - 8, torsoY + 5); ctx.closePath(); ctx.fill(); ctx.stroke(); // Ala izq
            ctx.beginPath(); ctx.moveTo(cx + 4, torsoY + 3); ctx.lineTo(cx + 8, torsoY + 1); ctx.lineTo(cx + 8, torsoY + 5); ctx.closePath(); ctx.fill(); ctx.stroke(); // Ala der
        } else if (acc === 'bufanda') {
            drawRoundedRect(cx - torsoW / 2, torsoY - 2, torsoW, 6, 2, '#ca8a04'); // Alrededor cuello
            drawRoundedRect(cx + 2, torsoY - 2, 6, 12, 2, '#ca8a04'); // Colgando
        } else if (acc === 'mascarilla') {
            drawRoundedRect(cx - 8, headY + 2, 16, 10, 4, '#38bdf8'); // Tela
            drawRect(cx - 12, headY + 4, 4, 1, '#1e293b', 'transparent', 0); // Tira izq
            drawRect(cx + 8, headY + 4, 4, 1, '#1e293b', 'transparent', 0); // Tira der
        }

        this.drawLabel(ctx);
    }

    drawLabel(ctx) {
        ctx.font = "bold 13px Inter";
        let subfix = this.isWorking ? " (Trabajando)" : (this.isLocal ? " (Tú)" : "");
        if (this.isAbsent) subfix = " (Ausente)";
        let vipStar = (this.role === 'gerente') ? "⭐ " : "";
        const textW = ctx.measureText(vipStar + this.nickname + subfix).width;
        let boxW = textW + 36;

        const bx = this.x - boxW / 2; const by = this.y - 65;

        // Bubble Emoji Reaction Rendering (Animated)
        if (this.activeReaction) {
            // Calculate progress (0 to 1 over 3 seconds)
            let elapsed = performance.now() - this.reactionStartTime;
            if (elapsed < 3000) {
                let progress = elapsed / 3000;
                let offsetY = progress * 40; // Float up 40px
                let alpha = 1.0;
                if (progress > 0.7) alpha = 1 - ((progress - 0.7) / 0.3); // Fade out last 30%

                let ry = by - 36 - offsetY;

                ctx.save();
                ctx.globalAlpha = alpha;

                // Bubble
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.strokeStyle = "#cbd5e1";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x, ry, 16, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();

                // Tail
                ctx.beginPath();
                ctx.moveTo(this.x - 4, ry + 14);
                ctx.lineTo(this.x, ry + 22);
                ctx.lineTo(this.x + 4, ry + 14);
                ctx.fill(); ctx.stroke();

                // Emoji
                ctx.font = "20px Inter";
                ctx.fillStyle = "#000"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText(this.activeReaction, this.x, ry + 2);

                ctx.restore();
            } else {
                this.activeReaction = null;
            }
        }

        ctx.fillStyle = "rgba(15,23,42,0.85)";
        ctx.strokeStyle = (this.role === 'gerente') ? "#eab308" : "#475569";
        ctx.lineWidth = (this.role === 'gerente') ? 2 : 1;
        ctx.beginPath(); ctx.roundRect(bx, by, boxW, 24, 12); ctx.fill(); ctx.stroke();

        let dotColor = this.isWorking ? "#facc15" : (this.isLocal || this.connectedDist ? "#10b981" : "#ef4444");
        ctx.fillStyle = dotColor; ctx.beginPath(); ctx.arc(bx + 14, by + 12, 5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = dotColor; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;

        ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(vipStar + this.nickname, bx + 24, by + 13);
        ctx.fillStyle = this.isWorking ? "#facc15" : "#94a3b8";
        ctx.fillText(subfix, bx + 24 + ctx.measureText(vipStar + this.nickname).width, by + 13);
    }
}

class LocalPlayer extends BasePlayer {
    constructor(map) {
        super("local", 5 * TILE, 5 * TILE, true);
        this.map = map; this.nearbyObj = null;
        this.myDeskId = null;
    }

    update(dt, input) {
        let i = input.getAxis();

        if (this.isWorking && (i.x !== 0 || i.y !== 0)) {
            this.isWorking = false;
            this.y += 10;
        }

        if (!this.isWorking) {
            let vel = this.speed * (input.isShift() ? 1.6 : 1);
            let vx = i.x * vel * dt; let vy = i.y * vel * dt;

            let colRectX = { x: this.x + vx - this.w / 2, y: this.y - this.h / 2 + 10, w: this.w, h: this.h - 10 };
            if (!this.map.checkCollision(colRectX)) this.x += vx;

            let colRectY = { x: this.x - this.w / 2, y: this.y + vy - this.h / 2 + 10, w: this.w, h: this.h - 10 };
            if (!this.map.checkCollision(colRectY)) this.y += vy;
        }

        this.updateAnim(dt, i.x !== 0 || i.y !== 0);

        if (this.nearbyObj) this.nearbyObj.highlighted = false;

        let interactRect = { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h };
        this.nearbyObj = this.map.getInteractableNear(interactRect);

        if (this.nearbyObj) {
            if (input.isInteract()) {
                if (this.nearbyObj.type === 'archivero') {
                    document.getElementById('fichero-modal').classList.remove('hidden');
                    input.consumeInteract();
                }
            }
            if (input.isWork() && this.nearbyObj.type === 'presScreen') {
                if (!window._isPresentationActive) {
                    // Abrir modal de subida si no hay nada proyectado
                    document.getElementById('upload-pres-modal').classList.remove('hidden');
                } else {
                    // Si ya hay algo, ver si la quiero apagar
                    if (window._presentationOwner === this.id || this.isLocal) {
                        window.dispatchEvent(new Event("pres-stop"));
                    }
                }
                input.consumeWork();
            }

            if (this.nearbyObj.type === 'desk' && this.nearbyObj.id === this.myDeskId) {
                if (input.isWork()) {
                    if (!this.isWorking) {
                        this.isWorking = true;
                        this.x = this.nearbyObj.rect.x + TILE / 2;
                        this.y = this.nearbyObj.rect.y + 40;
                    } else {
                        this.isWorking = false;
                        this.y += 10;
                    }
                    input.consumeWork();
                }

                if (input.isPlatform()) {
                    document.getElementById('pc-os-modal').classList.remove('hidden');
                    input.consumePlatform();
                }
            }
            if (this.nearbyObj.type === 'archivero' || this.nearbyObj.type === 'presScreen' || this.nearbyObj.id === this.myDeskId) {
                this.nearbyObj.highlighted = true;
            }
        }
    }
}

class RemotePlayer extends BasePlayer {
    constructor(id, x, y, name, role, props) {
        super(id, x, y, false);
        this.nickname = name;
        this.role = role || 'empleado';
        if (props) this.props = props;

        // Variables de interpolación (suavizado)
        this.targetX = x;
        this.targetY = y;
        this.updateTime = performance.now();
    }

    update(dt) {
        // Interpolación lineal hacia targetX, targetY
        const speed = 10 * dt;
        this.x += (this.targetX - this.x) * speed;
        this.y += (this.targetY - this.y) * speed;

        // Calcular si se está moviendo usando la distancia al target
        const dist = Math.sqrt(Math.pow(this.targetX - this.x, 2) + Math.pow(this.targetY - this.y, 2));
        const isMoving = dist > 2 && !this.isWorking;

        this.updateAnim(dt, isMoving);
    }

    // update from server network
    updateFromServer(data) {
        this.targetX = data.x;
        this.targetY = data.y;
        this.frame = data.frame;
        this.isWorking = data.isWorking;
        this.isAbsent = data.isAbsent;
        this.updateTime = performance.now();
    }
}

class NPC extends BasePlayer {
    constructor(id, x, y, name, role, isAI = false) {
        super(id, x, y, false);
        this.nickname = name;
        this.role = role;
        this.isAI = isAI;
        this.props = { skin: "#f1c27d", hair: "#fbbf24", shirt: "#ec4899", pants: "#000", glasses: false, hat: false };
        this.showMsg = false;
        this.msgs = [
            "¡Bienvenid@ a EduSmart!",
            "Puedes usar el mapa a tu lado.",
            "Las reuniones son en Conferencias.",
            "Usa viaje rápido (🌍) para moverte."
        ];
        this.msgIdx = 0;
        this.lastChangeTime = 0;
    }
    update(player, timestamp) {
        let dx = player.x - this.x; let dy = player.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        let wasShowing = this.showMsg;
        this.showMsg = (dist < 100); // 100px range for interaction

        if (this.showMsg && !this.isAI) {
            if (!wasShowing) {
                // When player enters range, show a new random message
                this.msgIdx = Math.floor(Math.random() * this.msgs.length);
                this.lastChangeTime = timestamp;
            } else if (timestamp - this.lastChangeTime > 4000) {
                // Change message every 4 seconds if they stick around
                this.msgIdx = (this.msgIdx + 1) % this.msgs.length;
                this.lastChangeTime = timestamp;
            }
        }

        // Trigger AI Modal on E press
        if (this.showMsg && this.isAI && window._inputEngineInstance) {
            if (window._inputEngineInstance.isInteract()) {
                window._inputEngineInstance.consumeInteract();
                openAIChat(this);
            }
        }

        this.sortY = this.y + this.h / 2;
    }
    render(ctx) {
        super.render(ctx);
        if (this.showMsg) {
            ctx.font = "bold 13px Inter";

            let msg = this.isAI ? "Presiona [E] para Hablar" : this.msgs[this.msgIdx];
            let tw = ctx.measureText(msg).width;
            let bx = this.x - tw / 2; let by = this.y - 80;

            let bgColor = this.isAI ? "#3b82f6" : "#fff";
            let fgColor = this.isAI ? "#fff" : "#0f172a";

            ctx.fillStyle = bgColor; ctx.strokeStyle = "#0f172a"; ctx.lineWidth = this.isAI ? 0 : 2;

            ctx.beginPath(); ctx.roundRect(bx - 10, by - 12, tw + 20, 24, 8);
            ctx.fill();
            if (!this.isAI) ctx.stroke();

            ctx.beginPath(); ctx.moveTo(this.x - 6, by + 12); ctx.lineTo(this.x, by + 20); ctx.lineTo(this.x + 6, by + 12); ctx.fill();
            if (!this.isAI) ctx.stroke();

            ctx.fillStyle = fgColor; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(msg, this.x, by);
        }
    }
}

const SpawnSystem = {
    spawnPlayer(player, map) {
        let desk = map.desks.find(d => !d.occupied && d.zone === player.role);
        if (!desk) desk = map.desks.find(d => !d.occupied && d.zone === 'empleado');

        if (desk) {
            desk.occupied = true;
            let firstName = player.nickname.split(' ')[0];
            desk.obj.id = `PC de ${firstName}`;
            player.myDeskId = desk.obj.id;
            window._myDeskId = player.myDeskId;

            player.x = desk.obj.rect.x + TILE / 2;
            player.y = desk.obj.rect.y + (desk.obj.id.includes("-T") ? -20 : TILE + 20); // Sit behind if TOP cluster
        } else {
            // Reception fallback (X:12, Y:38)
            player.x = 12 * TILE; player.y = 38 * TILE;
        }
    }
};

/* =====================================================================
   4. RENDERER (NATIVE CANVAS)
====================================================================== */
class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.container = document.getElementById("main-content");
        window.addEventListener("resize", () => this.resize());
        this.resize();
        this.cx = 0; this.cy = 0;
    }
    resize() {
        if (!this.container) return;
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.ctx.imageSmoothingEnabled = false;
    }
    renderScene(map, entities) {
        this.ctx.fillStyle = "#020617";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        let hw = this.canvas.width / 2; let hh = this.canvas.height / 2;
        this.ctx.translate(hw, hh);
        this.ctx.scale(1.2, 1.2);
        this.ctx.translate(-Math.floor(this.cx), -Math.floor(this.cy));

        map.renderFloors(this.ctx);

        let ySortList = [...map.objects, ...entities];
        ySortList.sort((a, b) => a.sortY - b.sortY);

        for (let obj of ySortList) obj.render(this.ctx);

        this.ctx.restore();
    }
}

/* =====================================================================
   5. UI CONTROLLER (SPA, FORMS, PREVIEW)
====================================================================== */
class UIController {
    constructor(player) {
        this.p = player;
        this.bindEvents();
        this.loadProfile();
        this.renderAvatarPreview();
        this.switchView('view-map');

        // Pres controller variables
        this.presFiles = [];
        this.presCurrentIdx = 0;

        window.addEventListener("pres-stop", () => {
            window._isPresentationActive = false;
            window._presentationOwner = null;
            document.getElementById('presentation-viewer').classList.add('hidden');
            if (_renderer) _renderer.resize();
        });
    }

    loadProfile() {
        let profile = localStorage.getItem("eduSmartProfile");
        if (profile) {
            try {
                let data = JSON.parse(profile);
                if (data.nick) document.getElementById('input-nickname').value = data.nick;
                if (data.role) document.getElementById('select-role').value = data.role;
                if (data.props) {
                    this.activateColor('#picker-skin', data.props.skin);
                    this.activateColor('#picker-hair', data.props.hair);
                    this.activateColor('#picker-shirt', data.props.shirt);
                    this.activateColor('#picker-pants', data.props.pants);

                    if (data.props.body) document.getElementById('select-body').value = data.props.body;
                    if (data.props.hairStyle) document.getElementById('select-hairstyle').value = data.props.hairStyle;
                    if (data.props.facialHair) document.getElementById('select-facialhair').value = data.props.facialHair;
                    if (data.props.outfit) document.getElementById('select-outfit').value = data.props.outfit;
                    if (data.props.accessory) document.getElementById('select-accessory').value = data.props.accessory;
                }
            } catch (e) { }
        }
    }

    activateColor(parentSelector, hex) {
        let parent = document.querySelector(parentSelector);
        if (!parent) return;
        parent.querySelectorAll('.color-btn').forEach(b => {
            b.classList.remove('active');
            if (b.dataset.color === hex) b.classList.add('active');
        });
    }

    updatePreviewData() {
        this.p.nickname = document.getElementById('input-nickname').value || 'Invitado';
        this.p.role = document.getElementById('select-role').value;
        this.p.props.skin = document.querySelector('#picker-skin .active')?.dataset?.color || '#ffdbac';
        this.p.props.hair = document.querySelector('#picker-hair .active')?.dataset?.color || '#27272a';
        this.p.props.shirt = document.querySelector('#picker-shirt .active')?.dataset?.color || '#3b82f6';
        this.p.props.pants = document.querySelector('#picker-pants .active')?.dataset?.color || '#1e293b';

        this.p.props.body = document.getElementById('select-body').value || 'masculino_delgado';
        this.p.props.hairStyle = document.getElementById('select-hairstyle').value || 'corto';
        this.p.props.facialHair = document.getElementById('select-facialhair').value || 'ninguno';
        this.p.props.outfit = document.getElementById('select-outfit').value || 'casual';
        this.p.props.accessory = document.getElementById('select-accessory').value || 'ninguno';

        this.renderAvatarPreview();
    }

    renderAvatarPreview() {
        let canvas = document.getElementById('avatar-preview');
        if (!canvas) return;
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.scale(2, 2);

        let tempX = this.p.x; let tempY = this.p.y;
        this.p.x = 25; this.p.y = 40;

        let oldName = this.p.nickname;
        this.p.nickname = "";

        this.p.render(ctx);

        this.p.nickname = oldName;
        this.p.x = tempX; this.p.y = tempY;
        ctx.restore();
    }

    bindEvents() {
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                let parent = e.target.parentElement;
                parent.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updatePreviewData();
            });
        });

        let inputs = ['input-nickname', 'select-role', 'select-body', 'select-hairstyle', 'select-facialhair', 'select-outfit', 'select-accessory'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updatePreviewData());
            document.getElementById(id).addEventListener('input', () => this.updatePreviewData());
        });

        document.getElementById('btn-enter').addEventListener('click', () => {
            this.updatePreviewData();
            localStorage.setItem("eduSmartProfile", JSON.stringify({ nick: this.p.nickname, role: this.p.role, props: this.p.props }));

            document.getElementById('nav-username').textContent = this.p.nickname;
            document.getElementById('nav-role').textContent = this.p.role.replace('_', ' ');
            document.getElementById('player-name-display').textContent = this.p.nickname;

            let ma = document.getElementById('mini-avatar');
            ma.style.background = this.p.props.shirt;
            ma.style.border = `4px solid ${this.p.props.skin}`;

            document.getElementById('profile-modal').classList.add('hidden');
            window.dispatchEvent(new Event("init-engine"));

            // Start Background Music on interaction
            let bgm = document.getElementById('bgm-audio');
            if (bgm) {
                bgm.volume = 0.2; // Soft volume
                bgm.play().catch(e => console.log("Auto-play prevented"));
            }

            if (window._renderer) window._renderer.resize();
        });

        // Audio Config Listeners
        const bgmInput = document.getElementById('volume-bgm');
        if (bgmInput) {
            bgmInput.addEventListener('input', (e) => {
                let bgm = document.getElementById('bgm-audio');
                if (bgm) bgm.volume = parseFloat(e.target.value);
            });
        }

        const voicesInput = document.getElementById('volume-voices');
        if (voicesInput) {
            voicesInput.addEventListener('input', (e) => {
                let vol = parseFloat(e.target.value);
                if (window._networkController && window._networkController.webrtcManager) {
                    window._networkController.webrtcManager.setGlobalVolume(vol);
                }
            });
        }

        const btnToggleBgm = document.getElementById('btn-toggle-bgm');
        if (btnToggleBgm) {
            btnToggleBgm.addEventListener('click', () => {
                let bgm = document.getElementById('bgm-audio');
                if (!bgm) return;
                if (bgm.paused) {
                    bgm.play();
                    btnToggleBgm.textContent = "🔊";
                } else {
                    bgm.pause();
                    btnToggleBgm.textContent = "🔇";
                }
                window.focus();
            });
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                let target = e.currentTarget;
                target.classList.add('active');
                this.switchView(target.dataset.target);
            });
        });

        document.getElementById('btn-close-fichero').addEventListener('click', () => {
            document.getElementById('fichero-modal').classList.add('hidden');
            if (document.getElementById('view-map').classList.contains('active')) window.focus();
        });

        document.getElementById('btn-close-system-choice').addEventListener('click', () => {
            document.getElementById('system-choice-modal').classList.add('hidden');
            window.focus();
        });

        const openWebView = (url, title) => {
            document.getElementById('system-choice-modal').classList.add('hidden');
            document.getElementById('webview-title').textContent = title;
            document.getElementById('platform-frame').src = url;
            document.getElementById('webview-modal').classList.remove('hidden');
        };
        window.openWebViewGlobal = openWebView;
        window._switchViewGlobal = (id) => this.switchView(id);

        // --- PC OS DESKTOP LOGIC ---
        document.getElementById('btn-close-pc').addEventListener('click', () => {
            document.getElementById('pc-os-modal').classList.add('hidden');
            window.focus();
        });

        document.querySelectorAll('.pc-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                let app = e.currentTarget.dataset.app;
                if (app === 'archivos') {
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                    let targetNav = document.querySelector('.nav-item[data-target="view-files"]');
                    if (targetNav) targetNav.classList.add('active');
                    this.switchView('view-files');
                    document.getElementById('pc-os-modal').classList.add('hidden');
                } else if (app === 'tareas') {
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                    let targetNav = document.querySelector('.nav-item[data-target="view-tasks"]');
                    if (targetNav) targetNav.classList.add('active');
                    this.switchView('view-tasks');
                    document.getElementById('pc-os-modal').classList.add('hidden');
                } else if (app === 'calendario') {
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                    let targetNav = document.querySelector('.nav-item[data-target="view-calendar"]');
                    if (targetNav) targetNav.classList.add('active');
                    this.switchView('view-calendar');
                    document.getElementById('pc-os-modal').classList.add('hidden');
                } else if (app === 'configuracion') {
                    document.getElementById('profile-modal').classList.remove('hidden');
                    document.getElementById('pc-os-modal').classList.add('hidden');
                } else if (app === 'admin') {
                    openWebView("https://edusmart.dufyasesorias.com/dashboard", "Sistema Administrativo - EduSmart");
                    document.getElementById('pc-os-modal').classList.add('hidden');
                } else if (app === 'tutor') {
                    openWebView("https://tutor.dufyasesorias.com/dashboard", "Sistema Tutores - Dufy Asesorías");
                    document.getElementById('pc-os-modal').classList.add('hidden');
                }
            });
        });

        setInterval(() => {
            let el = document.getElementById('pc-time-display');
            if (el) {
                let d = new Date();
                let hrs = d.getHours(); let ampm = hrs >= 12 ? 'PM' : 'AM';
                hrs = hrs % 12; hrs = hrs ? hrs : 12;
                let mins = d.getMinutes().toString().padStart(2, '0');
                el.textContent = `${hrs}:${mins} ${ampm}`;
            }
        }, 1000);
        // ---------------------------

        // Canvas NPC Mouse Click interaction
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                if (!window.gameEngineInputEnabled) return;
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const clickX = (e.clientX - rect.left) * scaleX;
                const clickY = (e.clientY - rect.top) * scaleY;

                // Adjust click coordinates to World Space based on localPlayer's camera constraints
                if (!window._renderer || !window._renderer.playerManager || !window._renderer.playerManager.localPlayer) return;

                let p = window._renderer.playerManager.localPlayer;
                let camX = p.x - canvas.width / 2;
                let camY = p.y - canvas.height / 2;
                camX = Math.max(0, Math.min(camX, 2000 - canvas.width));
                camY = Math.max(0, Math.min(camY, 2000 - canvas.height));

                const worldX = clickX + camX;
                const worldY = clickY + camY;

                // Check active scene components
                if (window._renderer.sceneElements) {
                    for (let npc of window._renderer.sceneElements) {
                        if (npc.isAI) {
                            // Check distance from click to NPC
                            let dx = worldX - npc.x;
                            let dy = worldY - npc.y;
                            let distToClick = Math.sqrt(dx * dx + dy * dy);

                            // Check distance from Player to NPC (must be close to interact)
                            let pdx = p.x - npc.x;
                            let pdy = p.y - npc.y;
                            let distToPlayer = Math.sqrt(pdx * pdx + pdy * pdy);

                            if (distToClick < 60 && distToPlayer < 120) {
                                openAIChat(npc);
                                return;
                            }
                        }
                    }
                }
            });
        }

        document.getElementById('btn-sys-admin').addEventListener('click', () => {
            openWebView("https://edusmart.dufyasesorias.com/dashboard", "Sistema Administrativo - EduSmart");
        });

        document.getElementById('btn-sys-tutor').addEventListener('click', () => {
            openWebView("https://tutor.dufyasesorias.com/dashboard", "Sistema Tutores - Dufy Asesorías");
        });

        document.getElementById('btn-close-webview').addEventListener('click', () => {
            document.getElementById('webview-modal').classList.add('hidden');
            document.getElementById('platform-frame').src = "";
            window.focus();
        });

        // FAST TRAVEL LOGIC
        document.getElementById('btn-close-travel').addEventListener('click', () => {
            document.getElementById('fast-travel-modal').classList.add('hidden');
            window.focus();
        });

        document.getElementById('btn-fast-travel').addEventListener('click', () => {
            document.getElementById('fast-travel-modal').classList.remove('hidden');
        });

        document.querySelectorAll('.travel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                let dx = e.currentTarget.dataset.x;
                let dy = e.currentTarget.dataset.y;

                if (dx === 'my-desk') {
                    if (this.p.myDeskId) {
                        let deskObj = _map.objects.find(o => o.id === this.p.myDeskId);
                        if (deskObj) {
                            this.p.x = deskObj.rect.x + TILE / 2;
                            this.p.y = deskObj.rect.y + 40;
                        }
                    }
                } else {
                    this.p.x = parseInt(dx) * TILE;
                    this.p.y = parseInt(dy) * TILE;
                }

                document.getElementById('fast-travel-modal').classList.add('hidden');

                if (this.p.isWorking) this.p.isWorking = false;
                window.focus();
            });
        });

        // PRESENTATION LOGIC
        const btnCloseUploadPres = document.getElementById('btn-close-upload-pres');
        if (btnCloseUploadPres) btnCloseUploadPres.addEventListener('click', () => document.getElementById('upload-pres-modal').classList.add('hidden'));

        const btnSubmitPres = document.getElementById('btn-submit-pres');
        const presInput = document.getElementById('presentation-file-input');

        if (btnSubmitPres && presInput) {
            btnSubmitPres.addEventListener('click', async () => {
                const files = presInput.files;
                if (!files || files.length === 0) return;

                this.presFiles = [];
                for (let i = 0; i < files.length; i++) {
                    const f = files[i];
                    // Convertir a base64 para enviarlo por red a los otros jugadores
                    const base64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(f);
                    });
                    this.presFiles.push({ url: base64, type: f.type });
                }

                document.getElementById('upload-pres-modal').classList.add('hidden');

                // Activar Presentación Global
                window._isPresentationActive = true;
                window._presentationOwner = this.p.nickname;

                document.getElementById('presentation-presenter-name').textContent = "Presenta: " + this.p.nickname;
                document.getElementById('presentation-viewer').classList.remove('hidden');
                document.getElementById('presentation-controls').classList.remove('hidden');
                document.getElementById('presentation-viewer-hint').classList.add('hidden');

                this.presCurrentIdx = 0;
                this.renderSlide();

                // Emitir al servidor
                if (window._network && window._network.socket) {
                    let roomName = window._map.getRoomAt(window._player.x, window._player.y)?.name || 'Global';
                    window._presentationRoom = roomName;
                    window._network.socket.emit('startPresentation', {
                        owner: this.p.nickname,
                        files: this.presFiles,
                        idx: 0,
                        roomName: roomName
                    });
                }

                presInput.value = ""; // clear
            });
        }

        const btnPrevPres = document.getElementById('btn-pres-prev');
        const btnNextPres = document.getElementById('btn-pres-next');
        const btnStopPres = document.getElementById('btn-pres-close');

        if (btnPrevPres) btnPrevPres.addEventListener('click', () => {
            if (this.presCurrentIdx > 0) {
                this.presCurrentIdx--;
                this.renderSlide();
                if (window._network && window._network.socket) {
                    window._network.socket.emit('changeSlide', { idx: this.presCurrentIdx, roomName: window._presentationRoom });
                }
            }
        });
        if (btnNextPres) btnNextPres.addEventListener('click', () => {
            if (this.presCurrentIdx < this.presFiles.length - 1) {
                this.presCurrentIdx++;
                this.renderSlide();
                if (window._network && window._network.socket) {
                    window._network.socket.emit('changeSlide', { idx: this.presCurrentIdx, roomName: window._presentationRoom });
                }
            }
        });
        if (btnStopPres) btnStopPres.addEventListener('click', () => {
            window.dispatchEvent(new Event("pres-stop"));
            if (window._network && window._network.socket) {
                window._network.socket.emit('stopPresentation', { roomName: window._presentationRoom });
            }
        });

        document.getElementById('btn-send-chat').addEventListener('click', () => this.sendChat());
        document.getElementById('chat-input').addEventListener('keypress', e => { if (e.key === 'Enter') this.sendChat(); });
        let c = document.getElementById('chat-input');
        if (c) {
            c.addEventListener('focus', () => window.gameEngineInputEnabled = false);
            c.addEventListener('blur', () => window.gameEngineInputEnabled = true);
        }
    }

    renderSlide() {
        const file = this.presFiles[this.presCurrentIdx];
        const container = document.getElementById('presentation-content-area');
        container.innerHTML = "";

        if (file.type === "application/pdf") {
            const iframe = document.createElement('iframe');
            iframe.src = file.url + "#page=1&zoom=page-fit";
            container.appendChild(iframe);
            document.getElementById('pres-page-counter').textContent = "PDF (Controles nativos)";
        } else {
            const img = document.createElement('img');
            img.src = file.url;
            container.appendChild(img);
            document.getElementById('pres-page-counter').textContent = `${this.presCurrentIdx + 1} / ${this.presFiles.length}`;
        }
    }

    switchView(viewId) {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active', 'hidden'));
        document.querySelectorAll('.view-section').forEach(s => {
            if (s.id !== viewId) s.classList.add('hidden');
        });
        document.getElementById(viewId).classList.add('active');
        if (viewId === 'view-map' && window._renderer) {
            window._renderer.resize();
            window.focus();
        } else if (viewId === 'view-tasks') {
            if (typeof loadTasks === 'function') loadTasks();
        } else if (viewId === 'view-calendar') {
            if (typeof loadCalendar === 'function') loadCalendar();
        } else if (viewId === 'view-files') {
            if (typeof loadDriveFiles === 'function') loadDriveFiles();
        }
    }

    sendChat() {
        let ipt = document.getElementById('chat-input');
        if (!ipt.value.trim()) return;
        let msg = document.createElement('p');
        msg.innerHTML = `<b style="color:var(--accent)">${this.p.nickname}:</b> ${ipt.value}`;
        document.getElementById('chat-messages').appendChild(msg);
        document.getElementById('chat-messages').scrollTop = 9999;
        ipt.value = '';
    }
}

/* =====================================================================
   7. MULTIPLAYER NETWORK CONTROLLER (SOCKET.IO)
====================================================================== */
class NetworkController {
    constructor(player, map, ui) {
        this.p = player;
        this.map = map;
        this.ui = ui;

        this.remotePlayers = {}; // id -> RemotePlayer

        // --- CONECTAR AL BACKEND RENDER ---
        // DEBES CAMBIAR ESTA URL POR TU URL DE RENDER.COM
        this.socket = io('https://edusmart-multiplayer.onrender.com');

        this.bindEvents();
    }

    bindEvents() {
        this.socket.on('connect', () => {
            console.log("Conectado al servidor multijugador!");

            // Initialize PeerJS para WebRTC
            this.peer = new Peer(this.socket.id);
            this.activeCalls = {};

            this.peer.on('open', (id) => {
                console.log('PeerJS conectado con ID:', id);
            });

            this.peer.on('call', (call) => {
                if (window.localStream) {
                    call.answer(window.localStream);
                } else {
                    call.answer();
                }

                call.on('stream', (remoteStream) => {
                    this.addRemoteVideoStream(call.peer, remoteStream);
                });

                call.on('close', () => {
                    this.removeRemoteVideoStream(call.peer);
                });

                call.on('error', (err) => {
                    console.log("Call error:", err);
                    this.removeRemoteVideoStream(call.peer);
                });

                this.activeCalls[call.peer] = call;
            });

            // Avisar que entramos
            this.socket.emit('playerJoined', {
                x: this.p.x,
                y: this.p.y,
                nickname: this.p.nickname,
                role: this.p.role,
                props: this.p.props,
                frame: this.p.frame,
                isWorking: this.p.isWorking
            });
        });

        this.socket.on('currentPlayers', (players) => {
            for (let id in players) {
                if (id === this.socket.id) continue;
                this.addRemotePlayer(players[id]);
            }
        });

        this.socket.on('newPlayer', (playerData) => {
            this.addRemotePlayer(playerData);
        });

        this.socket.on('playerMoved', (data) => {
            if (this.remotePlayers[data.id]) {
                this.remotePlayers[data.id].updateFromServer(data);
            }
        });

        this.socket.on('playerDisconnected', (id) => {
            if (this.remotePlayers[id]) {
                delete this.remotePlayers[id];
            }
        });

        this.socket.on('chatMessage', (msgObj) => {
            let msg = document.createElement('p');
            msg.innerHTML = `<b style="color:var(--accent)">${msgObj.nick}:</b> ${msgObj.text}`;
            document.getElementById('chat-messages').appendChild(msg);
            document.getElementById('chat-messages').scrollTop = 9999;
        });

        this.socket.on('playerReacted', (data) => {
            let rp = this.remotePlayers[data.id];
            if (rp) {
                rp.activeReaction = data.emoji;
                rp.reactionStartTime = performance.now();
                if (rp.reactionTimeout) clearTimeout(rp.reactionTimeout);
                rp.reactionTimeout = setTimeout(() => { rp.activeReaction = null; }, 3000);
            }
        });

        // REACTION UI LOGIC (Key T)
        const reactionsOverlay = document.getElementById('reactions-overlay');
        if (reactionsOverlay) {
            document.querySelectorAll('.reaction-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    let emoji = e.currentTarget.dataset.emoji;
                    // Activar localmente
                    this.p.activeReaction = emoji;
                    this.p.reactionStartTime = performance.now();
                    if (this.p.reactionTimeout) clearTimeout(this.p.reactionTimeout);
                    this.p.reactionTimeout = setTimeout(() => { this.p.activeReaction = null; }, 3000);
                    // Ocultar Overlay
                    reactionsOverlay.classList.add('hidden');
                    window.focus();
                    window.gameEngineInputEnabled = true; // IMPORTANT: Vuelve a habilitar el input
                    // Emitir a los demás
                    if (this.socket.connected) this.socket.emit('playerReacted', { emoji: emoji });
                });
            });

            // InputManager is listening for T. We check it inside the main Engine Loop, BUT
            // here we can also bind a standalone DOM listener to avoid interfering with Engine tick rates.
            window.addEventListener("keydown", (e) => {
                if (window.gameEngineInputEnabled && (e.code === "KeyT" || e.key === "t" || e.key === "T")) {
                    if (reactionsOverlay.classList.contains('hidden')) {
                        reactionsOverlay.classList.remove('hidden');
                        window.gameEngineInputEnabled = false; // block movement
                    } else {
                        reactionsOverlay.classList.add('hidden');
                        window.gameEngineInputEnabled = true;
                    }
                }
            });

            // To unlock movement if clicked outside
            document.addEventListener('click', (e) => {
                if (!reactionsOverlay.classList.contains('hidden') && !e.target.closest('#reactions-overlay')) {
                    reactionsOverlay.classList.add('hidden');
                    window.gameEngineInputEnabled = true;
                }
            });
        }

        // Sincronización de Presentaciones
        this.socket.on('startPresentation', (data) => {
            // Verificar si el jugador actual está en la misma habitación que el presentador
            let myRoom = this.map.getRoomAt(this.p.x, this.p.y);

            // Si el presentador está en la misma sala (ej. Sala Conferencias)
            if (myRoom && myRoom.name === data.roomName) {
                window._isPresentationActive = true;
                window._presentationOwner = data.owner;
                window._presentationRoom = data.roomName;
                this.ui.presFiles = data.files;
                this.ui.presCurrentIdx = data.idx;

                document.getElementById('presentation-presenter-name').textContent = "Presenta: " + data.owner;
                document.getElementById('presentation-viewer').classList.remove('hidden');
                document.getElementById('presentation-controls').classList.add('hidden'); // Ocultar controles al espectador
                document.getElementById('presentation-viewer-hint').classList.remove('hidden');

                this.ui.renderSlide();
            }
        });

        this.socket.on('changeSlide', (data) => {
            if (window._isPresentationActive && window._presentationRoom === data.roomName) {
                this.ui.presCurrentIdx = data.idx;
                this.ui.renderSlide();
            }
        });

        this.socket.on('stopPresentation', (data) => {
            if (window._isPresentationActive && window._presentationRoom === data.roomName) {
                // Remove without triggering pres-stop backwards
                window._isPresentationActive = false;
                window._presentationOwner = null;
                document.getElementById('presentation-viewer').classList.add('hidden');
            }
        });

        // PHONE HUD LOGIC (Key P)
        const phoneHud = document.getElementById('phone-hud');
        if (phoneHud) {
            this.activeChatUserId = null;

            // DOM Key listener
            window.addEventListener("keydown", (e) => {
                if (window.gameEngineInputEnabled && (e.code === "KeyP" || e.key === "p" || e.key === "P")) {
                    if (phoneHud.classList.contains('hidden')) {
                        phoneHud.classList.remove('hidden');
                        if (typeof openPhoneHome === 'function') openPhoneHome();
                    } else {
                        phoneHud.classList.add('hidden');
                        if (typeof openPhoneHome === 'function') openPhoneHome();

                        // Force game focus so movement works
                        window.focus();
                        window.gameEngineInputEnabled = true;
                    }
                }
            });

            // Update Time
            setInterval(() => {
                let d = new Date();
                let timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                let tE = document.getElementById('phone-time');
                if (tE) tE.textContent = timeStr;
            }, 10000);

            // Bind Views handled mostly by global functions now. 
            // We just need to handle the specific actions.

            // Reset target user on close
            window._phoneCloseChatSession = () => {
                this.activeChatUserId = null;
            }
            window._phoneRenderContacts = () => {
                this.renderPhoneContacts();
                this.renderPhoneCalls();
            }

            // Send DM
            const sendDM = () => {
                let ipt = document.getElementById('phone-chat-input');
                let txt = ipt.value.trim();
                if (!txt || !this.activeChatUserId) return;

                // Print local message
                this.printPhoneMsg("Tú", txt, true);

                // Send to socket
                if (this.socket.connected) {
                    this.socket.emit('privateMessage', { targetId: this.activeChatUserId, text: txt, fromNick: this.p.nickname });
                }
                ipt.value = '';
            };
            document.getElementById('btn-phone-send')?.addEventListener('click', sendDM);
            document.getElementById('phone-chat-input')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendDM();
            });

            // Disable Engine input while typing in Phone
            let inputDom = document.getElementById('phone-chat-input');
            if (inputDom) {
                inputDom.addEventListener('focus', () => window.gameEngineInputEnabled = false);
                inputDom.addEventListener('blur', () => window.gameEngineInputEnabled = true);
            }

            // Listen for Incoming DMs
            this.socket.on('privateMessage', (data) => {
                // If phone is hidden, show a small visual hint or just un-hide it
                if (phoneHud.classList.contains('hidden')) {
                    phoneHud.classList.remove('hidden');
                }

                // If we are currently chatting with this person
                if (this.activeChatUserId === data.fromId) {
                    this.printPhoneMsg(data.fromNick, data.text, false);
                } else {
                    // Notification on the contact list or auto-switch
                    this.activeChatUserId = data.fromId;
                    document.getElementById('phone-chat-title').textContent = data.fromNick;

                    document.getElementById('phone-view-home').style.display = 'none';
                    document.getElementById('phone-view-contacts').style.display = 'none';
                    document.getElementById('phone-view-calls').style.display = 'none';
                    document.getElementById('phone-view-chat').style.display = 'flex';

                    document.getElementById('phone-chat-messages').innerHTML = ''; // clear history for now
                    this.printPhoneMsg(data.fromNick, data.text, false);
                }
            });

            // Define global helper to bind clicks for Chat
            window._openPhoneChat = (id, nick) => {
                this.activeChatUserId = id;
                document.getElementById('phone-chat-title').textContent = nick;
                document.getElementById('phone-view-home').style.display = 'none';
                document.getElementById('phone-view-contacts').style.display = 'none';
                document.getElementById('phone-view-calls').style.display = 'none';
                document.getElementById('phone-view-chat').style.display = 'flex';
                document.getElementById('phone-chat-messages').innerHTML = ''; // clear session
            };

            // Define Call Trigger
            window._triggerPhoneCall = (remotePeer, nick) => {
                if (window.localStream && this.peer && remotePeer) {
                    // Start call with audio and video
                    console.log("Llamando a " + nick);

                    // Actually attempt to call
                    const call = this.peer.call(remotePeer, window.localStream);
                    if (call) {
                        call.on('stream', (remoteStream) => {
                            this.addRemoteVideoStream(remotePeer, remoteStream);
                        });
                        call.on('close', () => {
                            this.removeRemoteVideoStream(remotePeer);
                        });
                        call.on('error', (err) => {
                            console.log("Phone Call error:", err);
                            this.removeRemoteVideoStream(remotePeer);
                        });
                        this.activeCalls[remotePeer] = call;
                        // Return to home
                        if (typeof openPhoneHome === 'function') openPhoneHome();
                    }
                } else {
                    console.warn("No camera permission to call");
                }
            };
        }

        // Interceptar SendChat de UI (Global)
        const oldSendChat = this.ui.sendChat.bind(this.ui);
        this.ui.sendChat = () => {
            let ipt = document.getElementById('chat-input');
            if (!ipt.value.trim()) return;
            this.socket.emit('chatMessage', { nick: this.p.nickname, text: ipt.value, roomName: this.map.getRoomAt(this.p.x, this.p.y)?.name || 'Global' });
            ipt.value = '';
        }
    }

    // PHONE HELPERS
    renderPhoneContacts() {
        let listContainer = document.getElementById('phone-contacts-list');
        if (!listContainer) return;

        let remotes = Object.values(this.remotePlayers);
        if (remotes.length === 0) {
            listContainer.innerHTML = '<p style="color:#94a3b8; font-size:14px; text-align:center; padding: 20px 0;">Nadie más en línea.</p>';
            return;
        }

        let html = '';
        remotes.forEach(r => {
            let rpRoom = this.map.getRoomAt(r.x, r.y);
            let locationStr = rpRoom ? rpRoom.name : "Jardín Exterior";

            html += `<div class="flex-row space-between align-center" style="background:#1e293b; padding:10px; border-radius:10px; cursor:pointer;" onclick="window._openPhoneChat('${r.id}', '${r.nickname}')">
                <div class="flex-row gap-sm align-center">
                    <div style="width:10px; height:10px; background:#10b981; border-radius:50%;"></div>
                    <div class="flex-col">
                        <b style="font-size:14px; color:white;">${r.nickname}</b>
                        <span style="font-size:11px; color:#94a3b8;">${locationStr}</span>
                    </div>
                </div>
                <button class="btn btn-primary" style="padding:6px 10px; font-size:12px; border-radius:10px;">💬</button>
            </div>`;
        });
        listContainer.innerHTML = html;
    }

    renderPhoneCalls() {
        let listContainer = document.getElementById('phone-calls-list');
        if (!listContainer) return;

        let remotes = Object.values(this.remotePlayers);
        if (remotes.length === 0) {
            listContainer.innerHTML = '<p style="color:#94a3b8; font-size:14px; text-align:center; padding: 20px 0;">Nadie a quien llamar.</p>';
            return;
        }

        let html = '';
        remotes.forEach(r => {
            let isActive = this.activeCalls[r.id] != null;
            let iconText = isActive ? "Cerrar" : "Llamar";
            let btnClass = isActive ? "btn-danger" : "btn-primary";
            let clickAction = isActive ? `window._phoneEngineInstance.removeRemoteVideoStream('${r.id}')` : `window._triggerPhoneCall('${r.id}', '${r.nickname}')`;

            html += `<div class="flex-row space-between align-center" style="background:#1e293b; padding:10px; border-radius:10px;">
                <div class="flex-row gap-sm align-center">
                    <div style="width:40px; height:40px; background:#334155; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:18px;">👤</div>
                    <div class="flex-col">
                        <b style="font-size:14px; color:white;">${r.nickname}</b>
                        <span style="font-size:11px; color:${isActive ? '#10b981' : '#94a3b8'};">${isActive ? 'En Llamada' : 'Disponible'}</span>
                    </div>
                </div>
                <button class="btn ${btnClass}" onclick="${clickAction}" style="padding:6px 12px; font-size:12px; border-radius:10px;">${iconText}</button>
            </div>`;
        });
        listContainer.innerHTML = html;
        window._phoneEngineInstance = this; // Store instance to cancel calls from the UI
    }

    printPhoneMsg(author, text, isMe) {
        let chatContainer = document.getElementById('phone-chat-messages');
        if (!chatContainer) return;

        let align = isMe ? "flex-end" : "flex-start";
        let bg = isMe ? "#3b82f6" : "#334155";
        let rx = isMe ? "12px 12px 0px 12px" : "12px 12px 12px 0px";

        // Check if text is an image URL
        let contentHtml = text;
        if (text.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) || text.startsWith("data:image/")) {
            contentHtml = `<img src="${text}" style="max-width:100%; border-radius:8px;" />`;
        }

        let msgHtml = `
            <div style="display:flex; flex-direction:column; align-items:${align}; margin-bottom:5px;">
                <span style="font-size:11px; color:#94a3b8;">${author}</span>
                <div style="background:${bg}; padding:8px 12px; border-radius:${rx}; max-width:85%; word-wrap:break-word;">
                    ${contentHtml}
                </div>
            </div>
        `;
        let div = document.createElement('div');
        div.innerHTML = msgHtml;
        chatContainer.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    addRemotePlayer(data) {
        if (!this.remotePlayers[data.id]) {
            this.remotePlayers[data.id] = new RemotePlayer(
                data.id, data.x, data.y, data.nickname, data.role, data.props
            );
            this.remotePlayers[data.id].isWorking = data.isWorking;
            this.remotePlayers[data.id].isAbsent = data.isAbsent;
            this.remotePlayers[data.id].frame = data.frame;
        }
    }

    // Llamado 10 veces por segundo idealmente
    sendLocalUpdate() {
        if (!this.socket.connected) return;

        // Solo enviar si hubo cambio real para optimizar
        if (this.lastX !== this.p.x || this.lastY !== this.p.y || this.lastFrame !== this.p.frame || this.lastWork !== this.p.isWorking || this.lastAbsent !== this.p.isAbsent) {
            this.socket.emit('playerMoved', {
                x: this.p.x,
                y: this.p.y,
                frame: this.p.frame,
                isWorking: this.p.isWorking,
                isAbsent: this.p.isAbsent
            });

            this.lastX = this.p.x; this.lastY = this.p.y;
            this.lastFrame = this.p.frame; this.lastWork = this.p.isWorking;
            this.lastAbsent = this.p.isAbsent;
        }
    }

    update(dt) {
        for (let id in this.remotePlayers) {
            this.remotePlayers[id].update(dt);
        }
        this.updateWebRTCProximity();
    }

    getRenderList() {
        return Object.values(this.remotePlayers);
    }

    addRemoteVideoStream(peerId, stream) {
        const container = document.getElementById("remote-videos-container");
        let videoEl = document.getElementById(`remote-video-${peerId}`);
        if (!videoEl) {
            videoEl = document.createElement("video");
            videoEl.id = `remote-video-${peerId}`;
            videoEl.autoplay = true;
            videoEl.playsInline = true;
            videoEl.className = "remote-video";

            let rp = this.remotePlayers[peerId];
            let name = rp ? rp.nickname : "Usuario";

            let card = document.createElement("div");
            card.id = `remote-card-${peerId}`;
            card.className = "remote-card connected";
            card.innerHTML = `
                <div class="flex-row space-between align-center" style="margin-bottom: 5px;">
                    <span><span class="status-indicator"></span><b style="font-size:12px;">${name}</b></span>
                </div>
            `;
            videoEl.style.width = "100%";
            videoEl.style.borderRadius = "8px";
            videoEl.style.backgroundColor = "#000";
            card.appendChild(videoEl);
            container.appendChild(card);
        }
        videoEl.srcObject = stream;
    }

    removeRemoteVideoStream(peerId) {
        let card = document.getElementById(`remote-card-${peerId}`);
        if (card) {
            card.remove();
        }
        // Cerrar llamada si sigue activa
        if (this.activeCalls[peerId]) {
            this.activeCalls[peerId].close();
            delete this.activeCalls[peerId];
        }
    }

    updateWebRTCProximity() {
        if (!this.peer || !this.peer.id) return;

        const PROXIMITY_RADIUS = 180;
        const HYSTERESIS = 60;

        let myRoom = this.map.getRoomAt(this.p.x, this.p.y);
        let globalRooms = ['Sala Conferencias', 'Oficina TesiFive', 'Oficina Dufy', 'Oficina Reyes'];
        let amIInGlobalRoom = myRoom && globalRooms.includes(myRoom.name);

        for (let id in this.remotePlayers) {
            let rp = this.remotePlayers[id];

            let effectiveDist = Math.sqrt(Math.pow(this.p.x - rp.x, 2) + Math.pow(this.p.y - rp.y, 2));

            if (amIInGlobalRoom) {
                let rpRoom = this.map.getRoomAt(rp.x, rp.y);
                if (rpRoom && rpRoom.name === myRoom.name) {
                    effectiveDist = 0; // Force connection if in the same global room
                }
            }

            // Feedback visual en el canvas
            rp.connectedDist = effectiveDist < (PROXIMITY_RADIUS + HYSTERESIS);

            if (effectiveDist < PROXIMITY_RADIUS) {
                if (!this.activeCalls[id] && window.localStream) {
                    // Para evitar llamadas dobles (glare), solo el peer de menor ID inicia la llamada
                    if (this.peer.id < id) {
                        const call = this.peer.call(id, window.localStream);
                        if (call) {
                            call.on('stream', (remoteStream) => {
                                this.addRemoteVideoStream(id, remoteStream);
                            });
                            call.on('close', () => {
                                this.removeRemoteVideoStream(id);
                            });
                            call.on('error', (err) => {
                                console.log("Call error:", err);
                                this.removeRemoteVideoStream(id);
                            });
                            this.activeCalls[id] = call;
                        }
                    }
                }
            } else if (effectiveDist > PROXIMITY_RADIUS + HYSTERESIS) {
                if (this.activeCalls[id]) {
                    this.removeRemoteVideoStream(id);
                }
            }
        }
    }
}

/* =====================================================================
   7.B. AI SECRETARY CHAT CONTROLLER
====================================================================== */
let currentAINPC = null;

function openAIChat(npc) {
    currentAINPC = npc;
    window.gameEngineInputEnabled = false; // Freeze player movement

    let modal = document.getElementById("ai-chat-modal");
    document.getElementById("ai-chat-name").innerText = `${npc.nickname} (${npc.role})`;
    document.getElementById("ai-chat-history").innerHTML = `
        <div style="background:#1e293b; padding:10px; border-radius:10px 10px 10px 0; align-self:flex-start; max-width:85%;">
            <span style="color:var(--accent); font-weight:bold; font-size:12px;">${npc.nickname}</span><br>
            ¡Hola! Soy la ${npc.role} de la oficina. ¿En qué te puedo ayudar hoy?
        </div>
    `;
    modal.classList.remove("hidden");
    document.getElementById("ai-chat-input").value = "";
    document.getElementById("ai-chat-input").focus();
}

document.getElementById('btn-close-ai').addEventListener('click', () => {
    document.getElementById('ai-chat-modal').classList.add("hidden");
    window.gameEngineInputEnabled = true;
    currentAINPC = null;
    window.focus();
});

document.getElementById('btn-ai-send').addEventListener('click', sendPromptToAI);
document.getElementById('ai-chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendPromptToAI();
});

async function sendPromptToAI() {
    if (!currentAINPC) return;
    let inputEl = document.getElementById('ai-chat-input');
    let text = inputEl.value.trim();
    if (!text) return;

    let chatHistory = document.getElementById('ai-chat-history');

    // Add user message
    let divUser = document.createElement('div');
    divUser.style = "background:#3b82f6; padding:10px; border-radius:10px 10px 0 10px; align-self:flex-end; max-width:85%;";
    divUser.innerHTML = `<span style="color:#bfdbfe; font-weight:bold; font-size:12px;">Tú</span><br>${text}`;
    chatHistory.appendChild(divUser);

    inputEl.value = "";
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Add loading indicator
    let divLoading = document.createElement('div');
    divLoading.id = "ai-loading-indicator";
    divLoading.style = "background:#1e293b; padding:10px; border-radius:10px 10px 10px 0; align-self:flex-start; max-width:85%; color:#94a3b8; font-style:italic;";
    divLoading.innerText = `${currentAINPC.nickname} está escribiendo...`;
    chatHistory.appendChild(divLoading);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
        // Pollinations.ai Text generation (Free, no-auth logic)
        // We instruct it to act as the specific secretary
        let systemPrompt = `Eres ${currentAINPC.nickname}, la ${currentAINPC.role} de una oficina virtual llamada EduSmart. Responde brevemente (máximo 2-3 oraciones), de forma profesional y amable.`;
        let encodedPrompt = encodeURIComponent(`${systemPrompt}\nEl usuario dice: ${text}`);

        // Use text.pollinations.ai with a specific model or seed to get reliable text responses
        let res = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=openai&json=false`);
        if (!res.ok) throw new Error("AI Timeout");

        let aiResponse = await res.text();

        // Remove loading
        document.getElementById('ai-loading-indicator')?.remove();

        // Add AI message
        let divAI = document.createElement('div');
        divAI.style = "background:#1e293b; padding:10px; border-radius:10px 10px 10px 0; align-self:flex-start; max-width:85%;";
        divAI.innerHTML = `<span style="color:var(--accent); font-weight:bold; font-size:12px;">${currentAINPC.nickname}</span><br>${aiResponse}`;
        chatHistory.appendChild(divAI);

    } catch (e) {
        console.error(e);
        document.getElementById('ai-loading-indicator')?.remove();
        let divError = document.createElement('div');
        divError.style = "background:#ef4444; padding:10px; border-radius:10px 10px 10px 0; align-self:flex-start; max-width:85%; color:white;";
        divError.innerHTML = "❌ Uh oh, perdí la conexión. Intenta de nuevo más tarde.";
        chatHistory.appendChild(divError);
    }
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

window.openAIChatGlobal = () => {
    // Phone AI Assitant (Mocked NPC)
    currentAINPC = { nickname: "EduAsist", role: "Asistente Virtual General de EduSmart (En teléfono)" };
    document.getElementById('ai-chat-title').textContent = currentAINPC.nickname;
    document.getElementById('ai-chat-history').innerHTML =
        `<div style="text-align:center; color:#94a3b8; font-size:12px; margin-bottom:10px;">Chat iniciado con tu Asistente de Bolsillo</div>`;
    document.getElementById('ai-chat-modal').classList.remove('hidden');
    if (window.gameEngineInputEnabled !== undefined) window.gameEngineInputEnabled = false;
};

/* =====================================================================
   7.C. AI SPEECH-TO-TEXT (STT) & VOICE TASKS
====================================================================== */
let recognition = null;
let isListening = false;
let aiAudioNPC = null;
let _windowAudioCheckTime = 0;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
        isListening = true;
        let ind = document.getElementById('audio-listening-indicator');
        if (ind) ind.classList.remove('hidden');
    };

    recognition.onresult = async (event) => {
        let transcript = event.results[0][0].transcript;
        console.log("🗣️ STT Local Escuchado: " + transcript);
        await processVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
        console.warn("Speech Recognition Error", event.error);
        isListening = false;
        let ind = document.getElementById('audio-listening-indicator');
        if (ind) ind.classList.add('hidden');
    };

    recognition.onend = () => {
        isListening = false;
        let ind = document.getElementById('audio-listening-indicator');
        if (ind) ind.classList.add('hidden');
    };
}

async function processVoiceCommand(text) {
    if (!aiAudioNPC) return;

    let prompt = `Actúa como un procesador de lenguaje natural. Eres una secretaria analizando un texto dicho por tu jefe.
Texto escuchado: "${text}"

Si el texto es una orden clara para AGENDAR algo, CREAR UNA TAREA, ASIGNAR UN PENDIENTE o RECORDATORIO, retorna JSON: { "type": "task", "name": "Resumen conciso de la tarea de max 5 palabras", "date": "YYYY-MM-DD", "responsible": "Nombre (si lo menciona, sino vacio)" }
Si el texto está PREGUNTANDO por las tareas pendientes, o qué hay por hacer, retorna JSON: { "type": "query_tasks" }
Si el texto no encaja fuertemente con crear una tarea o consultarla, retorna JSON: { "type": "none" }`;

    try {
        let res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&json=true`);
        let dataStr = await res.text();

        let jsonStr = dataStr.replace(/```json/g, '').replace(/```/g, '').trim();
        let parsed = JSON.parse(jsonStr);

        if (parsed.type === 'task') {
            let desc = document.getElementById('ai-task-suggestion-desc');
            if (desc) desc.innerHTML = `<b>Tarea:</b> ${parsed.name}<br><b>Para:</b> ${parsed.responsible || 'Mí'}<br><b>Fecha:</b> ${parsed.date || 'Pronto'}`;

            let modal = document.getElementById('ai-task-suggestion-modal');
            if (modal) modal.classList.remove('hidden');

            let btnAccept = document.getElementById('btn-ai-task-accept');
            if (btnAccept) {
                btnAccept.onclick = async () => {
                    modal.classList.add('hidden');
                    try {
                        let btn = document.getElementById('btn-refresh-tasks');
                        if (btn) btn.innerHTML = "Subiendo Tarea...";
                        await fetch(GAS_BACKEND_URL, {
                            method: 'POST',
                            body: JSON.stringify({ action: 'createTask', name: parsed.name, deadline: parsed.date || '2023-12-31', responsible: parsed.responsible || 'Autocreado' })
                        });
                        if (typeof loadTasks === 'function') loadTasks();
                        if (typeof loadCalendar === 'function') loadCalendar();
                        if (btn) btn.innerHTML = "↻ Actualizar";
                    } catch (e) { }
                };
            }
            let btnReject = document.getElementById('btn-ai-task-reject');
            if (btnReject) {
                btnReject.onclick = () => {
                    modal.classList.add('hidden');
                };
            }

        } else if (parsed.type === 'query_tasks') {
            openAIChat(aiAudioNPC);
            let hist = document.getElementById('ai-chat-history');
            if (hist) {
                hist.innerHTML += `
                    <div style="background:#1e293b; padding:10px; border-radius:10px 10px 10px 0; align-self:flex-start; max-width:85%;">
                        <span style="color:var(--accent); font-weight:bold; font-size:12px;">${aiAudioNPC.nickname}</span><br>
                        ¡Claro, jefe! Abriendo el módulo de tareas en el entorno de la oficina... Por favor abre la app de Tareas en tu teléfono o PC para ver los detalles.
                    </div>`;
                hist.scrollTop = 9999;
            }
        }

    } catch (e) {
        console.error("AI STT Parse Error", e);
    }
}

/* =====================================================================
   8. MAIN ENGINE BOOTSTRAP
====================================================================== */
let _map, _input, _renderer, _ui, _network;
let _player, _sonora, _aiDufy, _aiReyes, _aiTesi;
let _lastTime = 0, _frameCount = 0, _fpsTime = 0;
let _isRunning = false;
window.gameEngineInputEnabled = true;

window.addEventListener('init-engine', async () => {
    SpawnSystem.spawnPlayer(_player, _map);

    // Arrancar NetworkController
    _network = new NetworkController(_player, _map, _ui);

    // Instanciar NPC Sonora (Recepción X:12, Y:35) con AI habilitada (true)
    _sonora = new NPC("npc_sonora", 12 * TILE, 35 * TILE, "Sonora", "Recepcionista", true);

    // Más secretarias para otras oficinas (Añadiendo variedad)
    _aiDufy = new NPC("npc_dufy", 40 * TILE, 30 * TILE, "Clara", "Secretaria Dufy", true);
    _aiReyes = new NPC("npc_reyes", 5 * TILE, 22 * TILE, "Marta", "Secretaria Reyes", true);
    _aiTesi = new NPC("npc_tesi", 42 * TILE, 20 * TILE, "Sofía", "Secretaria TesiFive", true);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('local-video').srcObject = stream;
        window.localStream = stream; // Guardar para PeerJS
    } catch (e) { console.warn("Cam fail"); document.getElementById('local-video-container').style.display = 'none'; }

    _isRunning = true;
    requestAnimationFrame(mainLoop);
});

window.onload = () => {
    _map = new GameMap();
    _input = new InputManager();
    _renderer = new Renderer("game-canvas");
    _player = new LocalPlayer(_map);
    _ui = new UIController(_player);

    _renderer.cx = 60 * TILE; _renderer.cy = 70 * TILE;
    _renderer.renderScene(_map, [_player]);
};

// Network transmit tick
setInterval(() => {
    if (_network) _network.sendLocalUpdate();
}, 100); // 10 ticks/s

/* =====================================================================
   CAMERA VERIFIER (MediaPipe Face Detection)
====================================================================== */
let _afkTimer = 60; // Segundos permitidos sin que se vea un rostro
let _isAFK = false;
let _faceDetector = null;
let _faceDetectionRunning = false;

if (window.FaceDetection) {
    _faceDetector = new FaceDetection({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}` });
    _faceDetector.setOptions({ model: 'short', minDetectionConfidence: 0.5 });

    _faceDetector.onResults((results) => {
        if (results.detections.length > 0) {
            // Rostro detectado
            _afkTimer = 60;
            if (_isAFK) {
                _isAFK = false;
                _player.isAbsent = false;
                if (_network && _network.socket.connected) {
                    _network.socket.emit('chatMessage', { nick: "Sistema", text: `${_player.nickname} ha regresado a la pantalla (Hora: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` });
                }
            }
        }
    });
}

// Check timer tick every second
setInterval(() => {
    if (!window.localStream || !window.localStream.getVideoTracks()[0] || !window.localStream.getVideoTracks()[0].enabled) return;

    // Tick AFK Timer naturally when face is not updating it back to 60
    _afkTimer--;
    if (_afkTimer <= 0 && !_isAFK) {
        _isAFK = true;
        _player.isAbsent = true;
        if (_network && _network.socket.connected) {
            _network.socket.emit('chatMessage', { nick: "Sistema", text: `${_player.nickname} se ha ausentado a las ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` });
        }
    }
}, 1000);

// Async Face poll loop
async function pollFaceDetection() {
    if (_faceDetector && window.localStream && window.localStream.getVideoTracks()[0].enabled) {
        let videoEl = document.getElementById('local-video');
        if (videoEl && videoEl.videoWidth > 0 && !_faceDetectionRunning) {
            _faceDetectionRunning = true;
            try {
                await _faceDetector.send({ image: videoEl });
            } catch (e) { }
            _faceDetectionRunning = false;
        }
    }
    // Poll again
    setTimeout(pollFaceDetection, 300); // Check face every 300ms
}
pollFaceDetection();

function mainLoop(timestamp) {
    if (!_isRunning) return;

    let dt = (timestamp - _lastTime) / 1000;
    _lastTime = timestamp;
    if (dt > 0.1) dt = 0.1;

    try {
        // FPS
        _frameCount++;
        if (timestamp - _fpsTime >= 1000) {
            document.getElementById('fps-counter').textContent = _frameCount;
            _frameCount = 0; _fpsTime = timestamp;
        }

        if (document.getElementById('view-map').classList.contains('active')) {
            if (window.gameEngineInputEnabled) {
                _player.update(dt, _input);
            } else {
                _player.updateAnim(dt, false);
            }

            if (_sonora) _sonora.update(_player, timestamp);
            if (_aiDufy) _aiDufy.update(_player, timestamp);
            if (_aiReyes) _aiReyes.update(_player, timestamp);
            if (_aiTesi) _aiTesi.update(_player, timestamp);

            // Update remotes
            if (_network) _network.update(dt);

            let rs = _map.floors.find(f => _player.x >= f.x * TILE && _player.x <= (f.x + f.w) * TILE && _player.y >= f.y * TILE && _player.y <= (f.y + f.h) * TILE);
            document.getElementById('current-room').textContent = rs ? rs.name : 'Jardín Exterior';

            // Cambiar modo visual si está conectado a la red
            if (_network && _network.socket.connected) {
                document.getElementById('game-mode').textContent = "ONLINE";
            }

            // Camera follow (lerp)
            _renderer.cx += (_player.x - _renderer.cx) * 5 * dt;
            _renderer.cy += (_player.y - _renderer.cy) * 5 * dt;

            let remotes = _network ? _network.getRenderList() : [];
            let allNPCs = [];
            if (_sonora) allNPCs.push(_sonora);
            if (_aiDufy) allNPCs.push(_aiDufy);
            if (_aiReyes) allNPCs.push(_aiReyes);
            if (_aiTesi) allNPCs.push(_aiTesi);

            // Audio Proximity Check para Secretarías IA
            if (timestamp - _windowAudioCheckTime > 2000 && recognition) {
                _windowAudioCheckTime = timestamp;
                let nearNPC = null;
                for (let npc of allNPCs) {
                    if (npc.isAI) {
                        let dx = _player.x - npc.x; let dy = _player.y - npc.y;
                        if (Math.sqrt(dx * dx + dy * dy) < 80) { nearNPC = npc; break; }
                    }
                }
                aiAudioNPC = nearNPC;
                if (nearNPC && !isListening) {
                    try { recognition.start(); } catch (e) { }
                } else if (!nearNPC && isListening) {
                    try { recognition.stop(); } catch (e) { }
                }
            }

            _renderer.renderScene(_map, [_player, ...allNPCs, ...remotes]);
        }

        requestAnimationFrame(mainLoop);
    } catch (e) {
        console.error("Game Loop Render Error:", e);
        _isRunning = false;
        document.getElementById('error-overlay').style.display = 'block';
        document.getElementById('error-overlay-msg').textContent = e.stack || e.message || String(e);
    }
}

/* =====================================================================
   9. GOOGLE APPS SCRIPT INTEGRATION (DRIVE, TASKS, CALENDAR)
====================================================================== */
// El usuario debe pegar la URL web resultante de publicar el Apps Script aquí
const GAS_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbw_yV0D4_nMIi5vHURBSw3CKkKc9odyX7R48_l-mOzsUQcQt-YN9kp0JhouS8k8JchklA/exec';
const TARGET_SPREADSHEET_ID = '1Zh2YRueqxpRFQbWMUdKRM9yunqt3HmWajXJxw0A1_jo';

document.addEventListener('DOMContentLoaded', () => {
    // Archivos
    const btnRefFiles = document.getElementById('btn-refresh-files');
    if (btnRefFiles) btnRefFiles.onclick = loadDriveFiles;
    const btnUpload = document.getElementById('btn-upload-drive');
    if (btnUpload) btnUpload.onclick = uploadDriveFile;

    // Tareas
    const btnRefTasks = document.getElementById('btn-refresh-tasks');
    if (btnRefTasks) btnRefTasks.onclick = loadTasks;

    const btnCreateTask = document.getElementById('btn-create-task');
    if (btnCreateTask) {
        btnCreateTask.onclick = async () => {
            let name = document.getElementById('input-task-name').value;
            let date = document.getElementById('input-task-date').value;
            let resp = document.getElementById('input-task-resp').value;
            if (!name || !date) return alert("Ingresa al menos el nombre y la fecha de la tarea.");

            btnCreateTask.textContent = "...";
            btnCreateTask.disabled = true;
            try {
                let res = await fetch(GAS_BACKEND_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'createTask', name: name, deadline: date, responsible: resp })
                });
                let data = await res.json();
                if (!data.success) throw new Error(data.error);
                document.getElementById('input-task-name').value = '';
                document.getElementById('input-task-date').value = '';
                document.getElementById('input-task-resp').value = '';
                loadTasks();
            } catch (e) { alert(e.message); }
            btnCreateTask.textContent = "+ Nueva Tarea";
            btnCreateTask.disabled = false;
        };
    }

    // Calendario
    const btnRefCal = document.getElementById('btn-refresh-cal');
    if (btnRefCal) btnRefCal.onclick = loadCalendar;
});

// ---------------------------------------------------------------------
// ARCHIVOS (Google Drive via GAS)
// ---------------------------------------------------------------------
async function loadDriveFiles() {
    let listUI = document.getElementById('drive-files-list');
    listUI.innerHTML = '<p style="text-align:center;">Cargando archivos desde Drive...</p>';
    if (GAS_BACKEND_URL === 'pega_aqui_la_url_de_tu_google_apps_script') {
        listUI.innerHTML = '<p style="color:var(--danger); text-align:center;">Falta configurar GAS_BACKEND_URL en app.js</p>';
        return;
    }

    try {
        let res = await fetch(`${GAS_BACKEND_URL}?action=getFiles`);
        let data = await res.json();
        if (!data.success) throw new Error(data.error);

        let files = data.files;

        let html = '';
        if (files && files.length > 0) {
            files.forEach((file) => {
                let icon = '📄';
                if (file.mimeType.includes('spreadsheet')) icon = '📊';
                if (file.mimeType.includes('document')) icon = '📝';
                if (file.mimeType.includes('image')) icon = '🖼️';
                if (file.mimeType.includes('folder')) icon = '📁';

                // Context Menu trigger
                html += `<div class="file-item flex-row space-between align-center" oncontextmenu="handleDriveContextMenu(event, '${file.id}', '${file.name}', '${file.url}')" style="background:rgba(255,255,255,0.1); padding:8px 12px; border-radius:6px; margin-bottom: 5px; cursor:pointer;" title="Click derecho para más opciones">
                            <span>${icon} ${file.name}</span>
                         </div>`;
            });
        } else {
            html = '<p style="text-align:center;">La carpeta está vacía.</p>';
        }

        // Add spreadsheet maestro en la parte superior
        let maestroBtn = `<div class="file-item flex-row space-between align-center" style="background:rgba(0,0,0,0.3); border:1px solid var(--accent); padding:8px 12px; border-radius:6px; margin-bottom: 15px;">
                            <span style="color:var(--accent)">📊 SPREADSHEET PRINCIPAL (BD)</span>
                            <button onclick="window.openWebViewGlobal('https://docs.google.com/spreadsheets/d/${TARGET_SPREADSHEET_ID}/edit?usp=sharing', 'Base de Datos')" class="btn btn-primary" style="padding: 4px 8px; font-size:12px;">Abrir Intero</button>
                          </div>`;

        listUI.innerHTML = maestroBtn + html;
    } catch (err) {
        listUI.innerHTML = `<p style="color:var(--danger); text-align:center;">Error: ${err.message}</p>`;
    }
}

// Context Menu Logic
let contextMenuTarget = null;
function handleDriveContextMenu(e, id, name, url) {
    e.preventDefault();
    contextMenuTarget = { id, name, url };
    let menu = document.getElementById('drive-context-menu');
    menu.style.left = e.offsetX + 'px';
    menu.style.top = e.offsetY + 'px';
    menu.classList.remove('hidden');
}

document.addEventListener('click', (e) => {
    let menu = document.getElementById('drive-context-menu');
    if (menu && !menu.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    let menu = document.getElementById('drive-context-menu');
    if (menu) {
        document.getElementById('ctx-open').onclick = () => {
            menu.classList.add('hidden');
            if (contextMenuTarget) {
                // If it's a drive file, try to open in preview format inside the webview instead of new tab
                let previewUrl = contextMenuTarget.url;
                if (previewUrl.includes('/view')) previewUrl = previewUrl.replace('/view', '/preview');
                if (previewUrl.includes('/edit')) previewUrl = previewUrl.replace('/edit', '/preview');
                window.openWebViewGlobal(previewUrl, "Visualizador: " + contextMenuTarget.name);
            }
        };
        document.getElementById('ctx-new-folder').onclick = async () => {
            menu.classList.add('hidden');
            let fn = prompt("Nombre de la nueva carpeta:");
            if (!fn) return;
            try {
                let res = await fetch(GAS_BACKEND_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'createFolder', folderName: fn })
                });
                let data = await res.json();
                if (data.success) loadDriveFiles();
                else alert("Error: " + data.error);
            } catch (e) { }
        };
        document.getElementById('ctx-rename').onclick = async () => {
            menu.classList.add('hidden');
            if (!contextMenuTarget) return;
            let nn = prompt("Nuevo nombre para " + contextMenuTarget.name + ":", contextMenuTarget.name);
            if (!nn || nn === contextMenuTarget.name) return;
            try {
                let res = await fetch(GAS_BACKEND_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'renameFile', fileId: contextMenuTarget.id, newName: nn })
                });
                let data = await res.json();
                if (data.success) loadDriveFiles();
                else alert("Error: " + data.error);
            } catch (e) { }
        };
        document.getElementById('ctx-delete').onclick = () => {
            menu.classList.add('hidden');
            if (!contextMenuTarget) return;
            if (confirm('¿Eliminar ' + contextMenuTarget.name + '?')) {
                deleteDriveFile(contextMenuTarget.id);
            }
        };
    }
});

async function uploadDriveFile() {
    let input = document.getElementById('input-upload-drive');
    if (!input.files || input.files.length === 0) return alert('Selecciona un archivo.');

    let btnUpload = document.getElementById('btn-upload-drive');
    btnUpload.textContent = 'Subiendo...';
    btnUpload.disabled = true;

    try {
        let file = input.files[0];
        let base64 = await new Promise((resolve) => {
            let reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });

        let res = await fetch(GAS_BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'uploadFile',
                fileName: file.name,
                mimeType: file.type,
                base64: base64
            })
        });

        let data = await res.json();
        if (!data.success) throw new Error(data.error);
        alert('Archivo subido con éxito.');
        input.value = '';
        loadDriveFiles();
    } catch (err) {
        alert('Error al subir: ' + err.message);
    } finally {
        btnUpload.textContent = 'Subir Archivo';
        btnUpload.disabled = false;
    }
}

async function deleteDriveFile(fileId) {
    if (!confirm("¿Estás seguro de eliminar este archivo? (Se moverá a la papelera del dueño)")) return;
    try {
        let res = await fetch(GAS_BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'deleteFile', fileId: fileId })
        });
        let data = await res.json();
        if (!data.success) throw new Error(data.error);
        loadDriveFiles();
    } catch (err) {
        alert('Error al eliminar: ' + err.message);
    }
}

// ---------------------------------------------------------------------
// TAREAS (Google Sheets via GAS)
// ---------------------------------------------------------------------
async function loadTasks() {
    let listUI = document.getElementById('tasks-list-container');
    listUI.innerHTML = '<p style="text-align:center;">Sincronizando tareas...</p>';

    try {
        let res = await fetch(`${GAS_BACKEND_URL}?action=getTasks`);
        let data = await res.json();
        if (!data.success) throw new Error(data.error);

        let tasks = data.tasks;
        if (!tasks || tasks.length == 0) {
            listUI.innerHTML = '<p style="text-align:center; color:#10b981;">No hay tareas pendientes. ¡Todo al día!</p>';
            return;
        }

        let html = '';
        tasks.forEach((t) => {
            html += `<div class="task-card flex-row space-between align-center" style="background:rgba(255,255,255,0.05); border-left:4px solid #eab308; padding:12px; border-radius:4px; margin-bottom:8px;">
                        <div class="flex-col">
                            <b style="font-size:18px;">${t.name}</b>
                            <span style="font-size:14px; color:var(--text-secondary);">Resp: ${t.responsible || 'N/A'} | Límite: ${new Date(t.deadline).toLocaleDateString() || 'N/A'}</span>
                        </div>
                        <div class="flex-row gap-sm">
                            <button onclick="markTaskDone(${t.rowIdx})" class="btn" style="background:#10b981; padding:6px 10px;">✓ Lista</button>
                            <button onclick="deleteTaskRow(${t.rowIdx})" class="btn" style="background:var(--danger); padding:6px 10px;">X Borrar</button>
                        </div>
                     </div>`;
        });
        listUI.innerHTML = html;
    } catch (err) {
        listUI.innerHTML = `<p style="color:var(--danger); text-align:center;">Error: ${err.message}</p>`;
    }
}

window.markTaskDone = async function (rowIdx) {
    try {
        let res = await fetch(GAS_BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'updateTask', rowIdx: rowIdx, status: 'Resuelta' })
        });
        loadTasks(); // recargar
    } catch (err) { alert(err.message); }
}

window.deleteTaskRow = async function (rowIdx) {
    if (!confirm('¿Eliminar esta tarea definitivamente del spreadsheet?')) return;
    try {
        let res = await fetch(GAS_BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'deleteTask', rowIdx: rowIdx })
        });
        loadTasks();
    } catch (err) { alert(err.message); }
}

// ---------------------------------------------------------------------
// CALENDARIO (Google Sheets via GAS)
// ---------------------------------------------------------------------
let currentCalMonth = new Date().getMonth();
let currentCalYear = new Date().getFullYear();
let cachedEvents = [];
let cachedTasks = [];

async function loadCalendar() {
    let container = document.getElementById('calendar-grid-container');
    container.innerHTML = '<p style="text-align:center; padding-top:20px;">Sincronizando eventos y tareas...</p>';
    if (GAS_BACKEND_URL === 'pega_aqui_la_url_de_tu_google_apps_script') return;

    try {
        let [resCal, resTasks] = await Promise.all([
            fetch(`${GAS_BACKEND_URL}?action=getCalendar`),
            fetch(`${GAS_BACKEND_URL}?action=getTasks`)
        ]);

        let dataCal = await resCal.json();
        let dataTasks = await resTasks.json();

        if (!dataCal.success) throw new Error(dataCal.error || 'API Calendar Error');
        if (!dataTasks.success) throw new Error(dataTasks.error || 'API Tasks Error');

        cachedEvents = dataCal.events || [];
        cachedTasks = dataTasks.tasks || [];

        renderCalendarGrid();
    } catch (err) {
        container.innerHTML = `<p style="color:var(--danger); text-align:center; padding-top:20px;">Error: ${err.message}</p>`;
    }
}

window.changeCalMonth = function (offset) {
    currentCalMonth += offset;
    if (currentCalMonth < 0) { currentCalMonth = 11; currentCalYear--; }
    else if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; }
    renderCalendarGrid();
}

function renderCalendarGrid() {
    let container = document.getElementById('calendar-grid-container');
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    let html = `
    <div class="calendar-wrapper">
        <div class="calendar-header">
            <button class="btn" onclick="changeCalMonth(-1)">⬅ Mes Anterior</button>
            <h3>${monthNames[currentCalMonth]} ${currentCalYear}</h3>
            <button class="btn" onclick="changeCalMonth(1)">Mes Siguiente ➡</button>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day-header">Dom</div>
            <div class="calendar-day-header">Lun</div>
            <div class="calendar-day-header">Mar</div>
            <div class="calendar-day-header">Mié</div>
            <div class="calendar-day-header">Jue</div>
            <div class="calendar-day-header">Vie</div>
            <div class="calendar-day-header">Sáb</div>
    `;

    let firstDay = new Date(currentCalYear, currentCalMonth, 1).getDay();
    let daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();

    // Empty cells at the start
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-cell empty"></div>`;
    }

    let today = new Date();

    for (let day = 1; day <= daysInMonth; day++) {
        let isToday = (day === today.getDate() && currentCalMonth === today.getMonth() && currentCalYear === today.getFullYear());
        html += `<div class="calendar-cell ${isToday ? 'today' : ''}">`;
        html += `<div class="cell-date">${day}</div>`;

        let cellDateStr = new Date(currentCalYear, currentCalMonth, day).toISOString().split('T')[0];

        // Filter events for this day
        cachedEvents.forEach(e => {
            let evDate = new Date(e.start);
            if (evDate.getFullYear() === currentCalYear && evDate.getMonth() === currentCalMonth && evDate.getDate() === day) {
                html += `<div class="cal-event-badge cal-booking-badge" title="${e.details || ''}">${e.title}</div>`;
            }
        });

        // Filter tasks deadlines for this day
        cachedTasks.forEach(t => {
            if (!t.deadline) return;
            let tDate = new Date(t.deadline);
            if (tDate.getFullYear() === currentCalYear && tDate.getMonth() === currentCalMonth && tDate.getDate() === day) {
                let statusClass = (t.status && t.status.toLowerCase() === 'resuelta') ? 'done' : '';
                html += `<div class="cal-event-badge cal-task-badge ${statusClass}" title="Resp: ${t.responsible || 'N/A'}">T: ${t.name}</div>`;
            }
        });

        html += `</div>`;
    }

    let totalCells = firstDay + daysInMonth;
    let remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
        html += `<div class="calendar-cell empty"></div>`;
    }

    html += `</div></div>`;
    container.innerHTML = html;
}

/* =====================================================================
   10. PRESENTATION MODE SYNC
====================================================================== */
let localIsPresenter = false;

window.startPresentation = function (url) {
    if (!url) return;
    localIsPresenter = true;
    document.getElementById('presentation-viewer').style.display = 'block';
    document.getElementById('presentation-content-area').innerHTML = `<iframe src="${url}" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>`;
    document.getElementById('presentation-controls').classList.remove('hidden');
    document.getElementById('presentation-viewer-hint').classList.add('hidden');

    if (typeof window.socket !== 'undefined' && window.socket) {
        window.socket.emit('zone_broadcast', { type: 'present_doc', url: url, presenterId: window.socket.id });
    }
}

window.stopPresentation = function () {
    localIsPresenter = false;
    document.getElementById('presentation-viewer').style.display = 'none';
    document.getElementById('presentation-content-area').innerHTML = '';

    if (typeof window.socket !== 'undefined' && window.socket) {
        window.socket.emit('zone_broadcast', { type: 'stop_present_doc' });
    }
}

// Intercept local sockets to handle presentation commands
document.addEventListener('DOMContentLoaded', () => {
    let btnClose = document.getElementById('btn-pres-close');
    if (btnClose) btnClose.onclick = stopPresentation;

    // Asignar los clics de los botones de PDF o Drive
    // para que llamen a startPresentation(url) en vez de abrir en pestaña nueva
    const oldOpen = window.open;
    window.open = function (url, name, features) {
        // En una app real podríamos interceptar clicks a docs 
        // y dar a elegir "Abrir" o "Presentar"
        return oldOpen(url, name, features);
    };
});

// Suponiendo que el NetworkController o similar usa socket.on
// Agregaremos de manera segura un escuchador cuando socket exista:
let checkSocketInterval = setInterval(() => {
    if (typeof window.socket !== 'undefined' && window.socket) {
        clearInterval(checkSocketInterval);
        window.socket.on('zone_broadcast', (data) => {
            if (data.type === 'present_doc' && data.presenterId !== window.socket.id) {
                localIsPresenter = false;
                document.getElementById('presentation-viewer').style.display = 'block';
                // El iframe para los espectadores usa pointer-events:none para bloquear manipulación
                document.getElementById('presentation-content-area').innerHTML = `<iframe src="${data.url}" style="width:100%; height:100%; border:none; pointer-events:none;"></iframe>`;
                document.getElementById('presentation-controls').classList.add('hidden');
                document.getElementById('presentation-viewer-hint').classList.remove('hidden');
            } else if (data.type === 'stop_present_doc' && !localIsPresenter) {
                document.getElementById('presentation-viewer').style.display = 'none';
                document.getElementById('presentation-content-area').innerHTML = '';
            }
        });
    }
}, 1000);
