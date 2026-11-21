// FileDrop Inspector — Aplicación standalone con Drag & Drop API y FileReader
'use strict';

(function () {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const progressWrap = document.getElementById('progressWrap');
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');
    const metaBar = document.getElementById('metaBar');
    const metaName = document.getElementById('metaName');
    const metaType = document.getElementById('metaType');
    const metaSize = document.getElementById('metaSize');
    const btnCopyText = document.getElementById('btnCopyText');
    const previewBox = document.getElementById('previewBox');

    let lastTextContent = '';

    // Formatea bytes a una unidad legible (B, KB, MB)
    function formatBytes(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    // Procesa el archivo seleccionado o soltado
    function processFile(file) {
        if (!file) return;
        previewBox.innerHTML = '';
        btnCopyText.hidden = true;
        lastTextContent = '';

        metaBar.hidden = false;
        metaName.textContent = `📄 ${file.name}`;
        metaType.textContent = `🏷️ ${file.type || 'desconocido'}`;
        metaSize.textContent = `📦 ${formatBytes(file.size)}`;

        progressWrap.hidden = false;
        progressFill.style.width = '0%';
        progressLabel.textContent = '0%';

        const reader = new FileReader();
        reader.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                progressFill.style.width = `${pct}%`;
                progressLabel.textContent = `${pct}%`;
            }
        });

        reader.addEventListener('load', () => {
            progressFill.style.width = '100%';
            progressLabel.textContent = '100%';

            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = reader.result;
                img.alt = file.name;
                previewBox.appendChild(img);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.controls = true;
                video.src = URL.createObjectURL(file);
                previewBox.appendChild(video);
            } else if (file.type.startsWith('audio/')) {
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.src = URL.createObjectURL(file);
                previewBox.appendChild(audio);
            } else {
                const pre = document.createElement('pre');
                lastTextContent = String(reader.result || '');
                pre.textContent = lastTextContent;
                previewBox.appendChild(pre);
                btnCopyText.hidden = false;
            }
        });

        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    }

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
    fileInput.addEventListener('change', () => processFile(fileInput.files[0]));

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        processFile(e.dataTransfer.files[0]);
    });

    btnCopyText.addEventListener('click', async () => {
        if (!lastTextContent) return;
        await navigator.clipboard.writeText(lastTextContent);
        btnCopyText.textContent = '✅ ¡Copiado!';
        setTimeout(() => { btnCopyText.textContent = '📋 Copiar contenido'; }, 1500);
    });

    // Botón para cargar un archivo de demostración (Blob/File en memoria)
    const btnDemoFile = document.getElementById('btnDemoFile');
    if (btnDemoFile) {
        btnDemoFile.addEventListener('click', () => {
            const sampleJson = JSON.stringify({
                developer: "Fredy Martinez",
                role: "Full-Stack MEAN & SQL Software Developer",
                apis_demonstrated: ["HTML5 Drag & Drop API", "FileReader Async Streams", "Blob & ObjectURL", "Clipboard API"],
                status: "Ready for Production"
            }, null, 2);
            const demoFile = new File([sampleJson], "arquitectura-fullstack-fredy.json", { type: "application/json" });
            processFile(demoFile);
        });
    }
})();
