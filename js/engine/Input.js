class Input {
    constructor() {
        this.keys = {};
        
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });

        // Basic mobile buttons integration
        this.bindMobileButton("btn-up", "ArrowUp");
        this.bindMobileButton("btn-down", "ArrowDown");
        this.bindMobileButton("btn-left", "ArrowLeft");
        this.bindMobileButton("btn-right", "ArrowRight");
        this.bindMobileButton("btn-interact", "KeyE");
    }

    bindMobileButton(btnId, keyCode) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        
        btn.addEventListener("touchstart", (e) => { 
            e.preventDefault(); 
            this.keys[keyCode] = true; 
        }, { passive: false });
        btn.addEventListener("touchend", (e) => { 
            e.preventDefault(); 
            this.keys[keyCode] = false; 
        }, { passive: false });
        btn.addEventListener("mousedown", () => { this.keys[keyCode] = true; });
        btn.addEventListener("mouseup", () => { this.keys[keyCode] = false; });
        btn.addEventListener("mouseleave", () => { this.keys[keyCode] = false; });
    }

    isDown(keyCode) {
        return this.keys[keyCode] === true;
    }

    // WASD or Arrows
    getAxisX() {
        let x = 0;
        if (this.isDown("ArrowLeft") || this.isDown("KeyA")) x -= 1;
        if (this.isDown("ArrowRight") || this.isDown("KeyD")) x += 1;
        return x;
    }

    getAxisY() {
        let y = 0;
        if (this.isDown("ArrowUp") || this.isDown("KeyW")) y -= 1;
        if (this.isDown("ArrowDown") || this.isDown("KeyS")) y += 1;
        return y;
    }

    isShift() {
        return this.isDown("ShiftLeft") || this.isDown("ShiftRight");
    }

    isInteract() {
        return this.isDown("KeyE");
    }
}

const input = new Input();
