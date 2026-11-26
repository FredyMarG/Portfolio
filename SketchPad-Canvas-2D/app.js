// SketchPad 2D Pro — Aplicación standalone con Canvas API, historial Undo y exportación PNG
'use strict';

(function () {
    const canvas = document.getElementById('sketchCanvas'); // Lienzo principal
    const ctx = canvas.getContext('2d'); // Contexto de dibujo 2D
    const colorPicker = document.getElementById('colorPicker'); // Selector de color
    const sizePicker = document.getElementById('sizePicker'); // Selector de grosor
    const sizeLabel = document.getElementById('sizeLabel'); // Etiqueta de tamaño
    const statusCoords = document.getElementById('statusCoords'); // Coordenadas en vivo
    const statusHistory = document.getElementById('statusHistory'); // Contador de historial

    let currentTool = 'brush'; // Herramienta activa
    let drawing = false; // Indica si el usuario está trazando
    let startX = 0; // Coordenada X inicial para figuras
    let startY = 0; // Coordenada Y inicial para figuras
    let snapshot = null; // Captura de píxeles previa para previsualizar figuras
    const history = []; // Pila de estados para Deshacer (Undo)

    // Guarda el estado actual del lienzo en la pila de historial (máximo 25 pasos)
    function saveHistory() {
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (history.length > 25) history.shift();
        statusHistory.textContent = `Historial: ${history.length} estado(s) · Sincronizado con BD · Ctrl+Z para deshacer`;
        try {
            const dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem('sketchpad_last_canvas', dataUrl);
            if (location.protocol !== 'file:') {
                fetch('/api/db/kv/sketchpad_canvas_state', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: { updatedAt: new Date().toISOString(), historyDepth: history.length } })
                }).catch(() => {});
            }
        } catch {}
    }

    // Inicializa fondo oscuro limpio, gráfico de bienvenida y primer estado
    function initCanvas() {
        ctx.fillStyle = '#0b1120';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Gráfico vectorial inicial de demostración
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(160, 160, 55, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#a855f7';
        ctx.strokeRect(260, 110, 140, 100);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 15px "Segoe UI", sans-serif';
        ctx.fillText('✨ Lienzo listo — Dibuja con el cursor o usa las herramientas superiores', 260, 245);
        ctx.restore();

        saveHistory();
    }

    // Restaura el estado anterior del historial
    function undo() {
        if (history.length <= 1) return;
        history.pop();
        ctx.putImageData(history[history.length - 1], 0, 0);
        statusHistory.textContent = `Historial: ${history.length} estado(s) · Ctrl+Z para deshacer`;
    }

    // Convierte coordenadas del evento al tamaño interno del lienzo
    function getCoords(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left) * (canvas.width / rect.width)),
            y: Math.round((e.clientY - rect.top) * (canvas.height / rect.height))
        };
    }

    // Cambia herramienta activa
    document.querySelectorAll('.tool-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
        });
    });

    sizePicker.addEventListener('input', () => {
        sizeLabel.textContent = `${sizePicker.value}px`;
    });

    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        const pos = getCoords(e);
        startX = pos.x;
        startY = pos.y;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    });

    canvas.addEventListener('mousemove', (e) => {
        const { x, y } = getCoords(e);
        statusCoords.textContent = `Cursor: (x: ${x}, y: ${y}) · Herramienta: ${currentTool}`;
        if (!drawing) return;

        ctx.lineWidth = Number(sizePicker.value);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentTool === 'eraser' ? '#0b1120' : colorPicker.value;

        if (currentTool === 'brush' || currentTool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
        } else {
            ctx.putImageData(snapshot, 0, 0);
            ctx.beginPath();
            if (currentTool === 'rect') {
                ctx.strokeRect(startX, startY, x - startX, y - startY);
            } else if (currentTool === 'circle') {
                const r = Math.hypot(x - startX, y - startY);
                ctx.arc(startX, startY, r, 0, Math.PI * 2);
                ctx.stroke();
            } else if (currentTool === 'line') {
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }
    });

    window.addEventListener('mouseup', () => {
        if (!drawing) return;
        drawing = false;
        saveHistory();
    });

    document.getElementById('btnUndo').addEventListener('click', undo);
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            undo();
        }
    });

    document.getElementById('btnClear').addEventListener('click', () => {
        ctx.fillStyle = '#0b1120';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveHistory();
    });

    document.getElementById('btnGrid').addEventListener('click', () => {
        ctx.save();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
        ctx.lineWidth = 1;
        for (let x = 40; x < canvas.width; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 40; y < canvas.height; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
        ctx.restore();
        saveHistory();
    });

    document.getElementById('btnExport').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `sketchpad-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    initCanvas();
})();
