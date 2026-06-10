// Yeshwanth S — Portfolio Script

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Custom Cursor
    // ----------------------------------------------------
    const cursorDot = document.getElementById('cursorDot');
    const cursorGlow = document.getElementById('cursorGlow');
    
    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    // Expand cursor on clicking elements
    const clickables = document.querySelectorAll('a, button, .sim-btn, input, textarea');
    clickables.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursorDot.style.width = '10px';
            cursorDot.style.height = '10px';
            cursorGlow.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        item.addEventListener('mouseleave', () => {
            cursorDot.style.width = '6px';
            cursorDot.style.height = '6px';
            cursorGlow.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });

    // ----------------------------------------------------
    // 2. Navigation Active Scroll State
    // ----------------------------------------------------
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 250)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // ----------------------------------------------------
    // 3. Particles Background Animation
    // ----------------------------------------------------
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    const particleCount = 60;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.color = Math.random() > 0.5 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(236, 72, 153, 0.3)';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ----------------------------------------------------
    // 4. Interactive 2D Graphics Simulator (minifinal.c logic)
    // ----------------------------------------------------
    const ROWS = 25;
    const COLS = 80;
    let grid = Array(ROWS).fill().map(() => Array(COLS).fill('_'));

    const simDisplay = document.getElementById('sim-display');
    const paramLabel = document.getElementById('param-label');
    const paramInputs = document.getElementById('param-inputs-container');

    // Update screen display from array matrix
    function renderGrid() {
        let displayStr = '';
        for (let r = 0; r < ROWS; r++) {
            displayStr += grid[r].join('') + '\n';
        }
        simDisplay.textContent = displayStr;
    }

    // Grid Helpers
    function initializePicture() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                grid[r][c] = '_';
            }
        }
    }

    function drawPoint(x, y) {
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
            grid[y][x] = '*';
        }
    }

    // Line drawing using DDA Algorithm (matches minifinal.c)
    function drawLine(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let steps;

        if (Math.abs(dx) > Math.abs(dy)) {
            steps = Math.abs(dx);
        } else {
            steps = Math.abs(dy);
        }

        if (steps === 0) {
            drawPoint(x1, y1);
            return;
        }

        let xIncrement = dx / steps;
        let yIncrement = dy / steps;

        let x = x1;
        let y = y1;

        for (let i = 0; i <= steps; i++) {
            drawPoint(Math.round(x), Math.round(y));
            x += xIncrement;
            y += yIncrement;
        }
    }

    // Rectangle Drawing
    function drawRectangle(x, y, w, h) {
        drawLine(x, y, x + w, y);
        drawLine(x, y, x, y + h);
        drawLine(x + w, y, x + w, y + h);
        drawLine(x, y + h, x + w, y + h);
    }

    // Triangle Drawing
    function drawTriangle(x, y, size) {
        drawLine(x, y, x - size, y + size);
        drawLine(x, y, x + size, y + size);
        drawLine(x - size, y + size, x + size, y + size);
    }

    // Midpoint Circle Drawing Algorithm (matches minifinal.c)
    function drawCircle(xc, yc, r) {
        let x = 0;
        let y = r;
        let p = 1 - r;

        while (x <= y) {
            drawPoint(xc + x, yc + y);
            drawPoint(xc - x, yc + y);
            drawPoint(xc + x, yc - y);
            drawPoint(xc - x, yc - y);
            drawPoint(xc + y, yc + x);
            drawPoint(xc - y, yc + x);
            drawPoint(xc + y, yc - x);
            drawPoint(xc - y, yc - x);

            x++;
            if (p < 0) {
                p = p + 2 * x + 1;
            } else {
                y--;
                p = p + 2 * (x - y) + 1;
            }
        }
    }

    // Delete Object (sets area back to '_')
    function deleteObject(x, y, w, h) {
        for (let i = y; i < y + h; i++) {
            for (let j = x; j < x + w; j++) {
                if (i >= 0 && i < ROWS && j >= 0 && j < COLS) {
                    grid[i][j] = '_';
                }
            }
        }
    }

    // Event Handler registration
    const operations = {
        'sim-line': {
            label: 'Draw Line: Enter x1, y1, x2, y2 (Grid: 80x25)',
            inputs: ['x1', 'y1', 'x2', 'y2'],
            defaults: [10, 5, 70, 20],
            draw: (vals) => drawLine(vals[0], vals[1], vals[2], vals[3])
        },
        'sim-rect': {
            label: 'Draw Rectangle: Enter x, y, width, height',
            inputs: ['x', 'y', 'width', 'height'],
            defaults: [20, 4, 40, 15],
            draw: (vals) => drawRectangle(vals[0], vals[1], vals[2], vals[3])
        },
        'sim-tri': {
            label: 'Draw Triangle: Enter top x, y, size',
            inputs: ['x', 'y', 'size'],
            defaults: [40, 3, 10],
            draw: (vals) => drawTriangle(vals[0], vals[1], vals[2])
        },
        'sim-circle': {
            label: 'Draw Circle: Enter center x, y, radius',
            inputs: ['xc', 'yc', 'radius'],
            defaults: [40, 12, 9],
            draw: (vals) => drawCircle(vals[0], vals[1], vals[2])
        },
        'sim-delete': {
            label: 'Delete Area: Enter x, y, width, height to clear',
            inputs: ['x', 'y', 'width', 'height'],
            defaults: [20, 4, 40, 15],
            draw: (vals) => deleteObject(vals[0], vals[1], vals[2], vals[3])
        },
        // New operations for Modify and Display
        'sim-modify': {
            label: 'Modify Object: Re-initialize canvas and draw a new shape',
            inputs: [],
            defaults: [],
            draw: () => {
                initializePicture();
                renderGrid();
                paramLabel.textContent = 'Canvas cleared. Choose a shape to draw (Line, Rect, Tri, Circle)';
            }
        },
        'sim-display': {
            label: 'Display Grid: Render current canvas',
            inputs: [],
            defaults: [],
            draw: () => {
                renderGrid();
                paramLabel.textContent = 'Current canvas displayed.';
            }
        }
    };

    // Render active parameters input fields
    function setOperation(opId) {
        document.querySelectorAll('.sim-btn').forEach(b => b.classList.remove('active'));
        if (opId === 'sim-clear') {
            initializePicture();
            renderGrid();
            paramLabel.textContent = 'Grid Cleared (initialized picture with _).';
            paramInputs.innerHTML = '';
            return;
        }
        if (opId === 'sim-modify') {
            // Modify operation: clear canvas and allow drawing a new shape
            initializePicture();
            renderGrid();
            paramLabel.textContent = 'Canvas cleared. Select a shape button to draw.';
            paramInputs.innerHTML = '';
            document.getElementById(opId).classList.add('active');
            return;
        }
        if (opId === 'sim-display') {
            renderGrid();
            paramLabel.textContent = 'Current canvas displayed.';
            paramInputs.innerHTML = '';
            document.getElementById(opId).classList.add('active');
            return;
        }

        const op = operations[opId];
        if (!op) return;

        document.getElementById(opId).classList.add('active');
        paramLabel.textContent = op.label;
        
        let inputsHtml = '';
        op.inputs.forEach((name, idx) => {
            inputsHtml += `<input type="number" id="input-${name}" value="${op.defaults[idx]}" placeholder="${name}">`;
        });
        inputsHtml += `<button id="btn-draw-sim">Render</button>`;
        paramInputs.innerHTML = inputsHtml;

        // Draw action
        document.getElementById('btn-draw-sim').addEventListener('click', () => {
            const vals = op.inputs.map(name => parseInt(document.getElementById(`input-${name}`).value) || 0);
            op.draw(vals);
            renderGrid();
        });
    }

    // Bind clicks to menu buttons
    document.querySelectorAll('.sim-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setOperation(e.target.id);
        });
    });

    // Run Initial Setups
    initializePicture();
    // Pre-draw a cool design (circle and box) to start with a wowed view
    drawCircle(40, 12, 10);
    drawRectangle(5, 2, 70, 20);
    renderGrid();
});
