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
            this.timer += dt * 10;
            this.frame = Math.floor(this.timer) % 4;
        } else {
            this.frame = 0; this.timer = 0;
        }
        this.sortY = this.y + this.h / 2;
    }

    render(ctx) {
        const cx = this.x; const cy = this.y;

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath(); ctx.ellipse(cx, cy + 16, 16, 8, 0, 0, Math.PI * 2); ctx.fill();

        if (this.frame === 4) {
            outlineRect(ctx, cx - 10, cy + 6, 20, 8, this.props.pants);
        } else {
            if (this.frame === 1) { outlineRect(ctx, cx - 8, cy + 6, 8, 12, this.props.pants); outlineRect(ctx, cx + 2, cy + 6, 6, 8, this.props.pants); }
            else if (this.frame === 3) { outlineRect(ctx, cx - 8, cy + 6, 6, 8, this.props.pants); outlineRect(ctx, cx + 2, cy + 6, 8, 12, this.props.pants); }
            else { outlineRect(ctx, cx - 8, cy + 6, 7, 10, this.props.pants); outlineRect(ctx, cx + 1, cy + 6, 7, 10, this.props.pants); }
        }

        outlineArc(ctx, cx, cy, 14, this.props.shirt);
        ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(cx - 4, cy - 12, 8, 4);

        outlineArc(ctx, cx, cy - 18, 13, this.props.skin);

        if (!this.props.hat) {
            outlineArc(ctx, cx, cy - 20, 13, this.props.hair, '#0f172a', 2, Math.PI, 0);
            ctx.fillStyle = this.props.hair; ctx.fillRect(cx - 11, cy - 20, 22, 6); // Frente
        } else {
            outlineArc(ctx, cx, cy - 20, 13, this.props.shirt, '#0f172a', 2, Math.PI, 0);
            outlineRect(ctx, cx - 15, cy - 20, 24, 6, this.props.shirt);
        }

        if (this.props.glasses) {
            outlineRect(ctx, cx - 10, cy - 22, 8, 6, '#1e293b', '#000', 1);
            outlineRect(ctx, cx + 2, cy - 22, 8, 6, '#1e293b', '#000', 1);
            ctx.fillStyle = '#0f172a'; ctx.fillRect(cx - 2, cy - 20, 4, 2);
        }

        this.drawLabel(ctx);
    }

    drawLabel(ctx) {
        ctx.font = "bold 13px Inter";
        let subfix = this.isWorking ? " (Trabajando)" : (this.isLocal ? " (Tú)" : "");
        let vipStar = (this.role === 'gerente') ? "⭐ " : "";
        const textW = ctx.measureText(vipStar + this.nickname + subfix).width;
        let boxW = textW + 36;

        const bx = this.x - boxW / 2; const by = this.y - 65;

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
                    document.getElementById('system-choice-modal').classList.remove('hidden');
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
        this.updateTime = performance.now();
    }
}

class NPC extends BasePlayer {
    constructor(id, x, y, name, role) {
        super(id, x, y, false);
        this.nickname = name;
        this.role = role;
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
        this.showMsg = (dist < 150);

        if (this.showMsg) {
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

        this.sortY = this.y + this.h / 2;
    }
    render(ctx) {
        super.render(ctx);
        if (this.showMsg) {
            let msg = this.msgs[this.msgIdx];
            ctx.font = "bold 13px Inter";
            let tw = ctx.measureText(msg).width;
            let bx = this.x - tw / 2; let by = this.y - 80;

            ctx.fillStyle = "#fff"; ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(bx - 10, by - 12, tw + 20, 24, 8);
            ctx.fill(); ctx.stroke();

            ctx.beginPath(); ctx.moveTo(this.x - 6, by + 12); ctx.lineTo(this.x, by + 20); ctx.lineTo(this.x + 6, by + 12); ctx.fill(); ctx.stroke();

            ctx.fillStyle = "#0f172a"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText(msg, bx, by);
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
                    document.getElementById('check-glasses').checked = data.props.glasses;
                    document.getElementById('check-hat').checked = data.props.hat;
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
        this.p.props.skin = document.querySelector('#picker-skin .active').dataset.color;
        this.p.props.hair = document.querySelector('#picker-hair .active').dataset.color;
        this.p.props.shirt = document.querySelector('#picker-shirt .active').dataset.color;
        this.p.props.pants = document.querySelector('#picker-pants .active').dataset.color;
        this.p.props.glasses = document.getElementById('check-glasses').checked;
        this.p.props.hat = document.getElementById('check-hat').checked;
        this.renderAvatarPreview();
    }

    renderAvatarPreview() {
        let canvas = document.getElementById('avatar-preview');
        if (!canvas) return;
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let tempX = this.p.x; let tempY = this.p.y;
        this.p.x = 50; this.p.y = 80;
        this.p.render(ctx);
        this.p.x = tempX; this.p.y = tempY;
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

        let inputs = ['input-nickname', 'select-role', 'check-glasses', 'check-hat'];
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
            _renderer.resize();
        });

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
        if (viewId === 'view-map' && _renderer) {
            _renderer.resize();
            window.focus();
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
            if (window._isPresentationRoom === data.roomName || window._isPresentationActive) {
                window.dispatchEvent(new Event("pres-stop"));
            }
        });

        // Interceptar SendChat de UI
        const oldSendChat = this.ui.sendChat.bind(this.ui);
        this.ui.sendChat = () => {
            let ipt = document.getElementById('chat-input');
            if (!ipt.value.trim()) return;
            this.socket.emit('chatMessage', { nick: this.p.nickname, text: ipt.value, roomName: this.map.getRoomAt(this.p.x, this.p.y)?.name || 'Global' });
            ipt.value = '';
        }
    }

    addRemotePlayer(data) {
        if (!this.remotePlayers[data.id]) {
            this.remotePlayers[data.id] = new RemotePlayer(
                data.id, data.x, data.y, data.nickname, data.role, data.props
            );
            this.remotePlayers[data.id].isWorking = data.isWorking;
            this.remotePlayers[data.id].frame = data.frame;
        }
    }

    // Llamado 10 veces por segundo idealmente
    sendLocalUpdate() {
        if (!this.socket.connected) return;

        // Solo enviar si hubo cambio real para optimizar
        if (this.lastX !== this.p.x || this.lastY !== this.p.y || this.lastFrame !== this.p.frame || this.lastWork !== this.p.isWorking) {
            this.socket.emit('playerMoved', {
                x: this.p.x,
                y: this.p.y,
                frame: this.p.frame,
                isWorking: this.p.isWorking
            });

            this.lastX = this.p.x; this.lastY = this.p.y;
            this.lastFrame = this.p.frame; this.lastWork = this.p.isWorking;
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

        for (let id in this.remotePlayers) {
            let rp = this.remotePlayers[id];
            const dist = Math.sqrt(Math.pow(this.p.x - rp.x, 2) + Math.pow(this.p.y - rp.y, 2));

            // Feedback visual en el canvas
            rp.connectedDist = dist < (PROXIMITY_RADIUS + HYSTERESIS);

            if (dist < PROXIMITY_RADIUS) {
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
            } else if (dist > PROXIMITY_RADIUS + HYSTERESIS) {
                if (this.activeCalls[id]) {
                    this.removeRemoteVideoStream(id);
                }
            }
        }
    }
}

/* =====================================================================
   8. MAIN ENGINE BOOTSTRAP
====================================================================== */
let _map, _input, _renderer, _ui, _network;
let _player, _sonora;
let _lastTime = 0, _frameCount = 0, _fpsTime = 0;
let _isRunning = false;
window.gameEngineInputEnabled = true;

window.addEventListener('init-engine', async () => {
    SpawnSystem.spawnPlayer(_player, _map);

    // Arrancar NetworkController
    _network = new NetworkController(_player, _map, _ui);

    // Instanciar NPC Sonora (Recepción X:12, Y:35)
    _sonora = new NPC("npc_sonora", 12 * TILE, 35 * TILE, "Sonora", "Recepcionista");

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

function mainLoop(timestamp) {
    if (!_isRunning) return;

    let dt = (timestamp - _lastTime) / 1000;
    _lastTime = timestamp;
    if (dt > 0.1) dt = 0.1;

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

        if (_sonora) _sonora.update(_player); // Pass player for distance check

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
        _renderer.renderScene(_map, [_player, _sonora, ...remotes]);
    }

    requestAnimationFrame(mainLoop);
}
