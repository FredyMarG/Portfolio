// NotesDB — Aplicación standalone con IndexedDB (CRUD, búsqueda en vivo y exportación JSON)
'use strict';

(function () {
    const DB_NAME = 'NotesDB_Portfolio'; // Nombre de la base de datos
    const STORE_NAME = 'notas'; // Almacén de objetos
    let db = null; // Instancia activa de IDBDatabase

    const noteTitle = document.getElementById('noteTitle'); // Campo de texto
    const noteCategory = document.getElementById('noteCategory'); // Selector de categoría
    const searchInput = document.getElementById('searchInput'); // Buscador en vivo
    const notesList = document.getElementById('notesList'); // Contenedor de tarjetas
    const countLabel = document.getElementById('countLabel'); // Contador de registros

    // Abre o actualiza el esquema de IndexedDB
    const req = indexedDB.open(DB_NAME, 1);
    req.addEventListener('upgradeneeded', () => {
        const database = req.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME, { autoIncrement: true });
        }
    });
    req.addEventListener('success', () => {
        db = req.result;
        seedInitialNotesIfNeeded();
    });

    // Precarga 3 notas técnicas en el primer uso para demostración inmediata en el portafolio
    function seedInitialNotesIfNeeded() {
        if (localStorage.getItem('notesdb_portfolio_seeded')) {
            renderNotes();
            return;
        }
        const countReq = getStore('readonly').count();
        countReq.addEventListener('success', () => {
            if (countReq.result === 0) {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const now = new Date().toLocaleString();
                store.add({ title: 'Arquitectura RESTful con Node.js, Express y autenticación JWT', category: 'Trabajo', createdAt: now });
                store.add({ title: 'Persistencia Offline-First en navegador con transacciones IndexedDB', category: 'Estudio', createdAt: now });
                store.add({ title: 'Diseño de componentes reactivos y calendario en Angular 15 SPA', category: 'Idea', createdAt: now });
                tx.addEventListener('complete', () => {
                    localStorage.setItem('notesdb_portfolio_seeded', '1');
                    renderNotes();
                });
            } else {
                localStorage.setItem('notesdb_portfolio_seeded', '1');
                renderNotes();
            }
        });
    }

    // Helper para abrir transacciones
    function getStore(mode) {
        return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
    }

    // Agrega un registro nuevo
    function addNote() {
        const title = noteTitle.value.trim();
        if (!title || !db) return;
        const item = { title, category: noteCategory.value, createdAt: new Date().toLocaleString() };
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).add(item);
        tx.addEventListener('complete', () => {
            noteTitle.value = '';
            noteTitle.focus();
            renderNotes();
        });
    }

    // Actualiza un registro existente por clave
    function updateNote(key, data) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(data, key);
        tx.addEventListener('complete', renderNotes);
    }

    // Elimina un registro por clave
    function deleteNote(key) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(key);
        tx.addEventListener('complete', renderNotes);
    }

    // Lee con cursor todos los registros y aplica filtro de búsqueda
    function renderNotes() {
        if (!db) return;
        const query = searchInput.value.trim().toLowerCase();
        const store = getStore('readonly');
        const cursorReq = store.openCursor();
        const items = [];

        cursorReq.addEventListener('success', () => {
            const cursor = cursorReq.result;
            if (cursor) {
                const val = cursor.value;
                if (!query || val.title.toLowerCase().includes(query) || val.category.toLowerCase().includes(query)) {
                    items.push({ key: cursor.key, ...val });
                }
                cursor.continue();
            } else {
                notesList.innerHTML = '';
                countLabel.textContent = `${items.length} registro(s)`;
                items.reverse().forEach((item) => {
                    const card = document.createElement('article');
                    card.className = 'note-item';

                    const main = document.createElement('div');
                    main.className = 'note-main';

                    const titleEl = document.createElement('div');
                    titleEl.className = 'note-title';
                    titleEl.textContent = item.title;
                    titleEl.contentEditable = 'true';

                    const metaEl = document.createElement('div');
                    metaEl.className = 'note-meta';
                    metaEl.textContent = `${item.category} · ${item.createdAt}`;

                    main.append(titleEl, metaEl);

                    const actions = document.createElement('div');
                    actions.className = 'note-actions';

                    const saveBtn = document.createElement('button');
                    saveBtn.type = 'button';
                    saveBtn.className = 'btn';
                    saveBtn.textContent = '💾 Guardar';
                    saveBtn.disabled = true;

                    titleEl.addEventListener('input', () => {
                        saveBtn.disabled = false;
                        saveBtn.classList.add('primary');
                    });
                    saveBtn.addEventListener('click', () => {
                        const updated = titleEl.textContent.trim();
                        if (updated) {
                            updateNote(item.key, { ...item, title: updated });
                        }
                    });

                    const delBtn = document.createElement('button');
                    delBtn.type = 'button';
                    delBtn.className = 'btn danger';
                    delBtn.textContent = '🗑️ Eliminar';
                    delBtn.addEventListener('click', () => deleteNote(item.key));

                    actions.append(saveBtn, delBtn);
                    card.append(main, actions);
                    notesList.appendChild(card);
                });
            }
        });
    }

    // Exporta todos los registros a un archivo .json descargable
    document.getElementById('btnExportJson').addEventListener('click', () => {
        if (!db) return;
        const allReq = getStore('readonly').getAll();
        allReq.addEventListener('success', () => {
            const blob = new Blob([JSON.stringify(allReq.result, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `notesdb-backup-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    document.getElementById('btnAddNote').addEventListener('click', addNote);
    noteTitle.addEventListener('keydown', (e) => { if (e.key === 'Enter') addNote(); });
    searchInput.addEventListener('input', renderNotes);
})();
