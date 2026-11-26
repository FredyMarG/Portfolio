# 🚀 Portafolio Profesional Full-Stack MEAN & SQL — Fredy Martinez

Repositorio oficial de proyectos de ingeniería de software de **Fredy Martinez** (*Full-Stack Software Developer & Certified Scrum Master*).

- 🌐 **Portafolio Desplegado en Vivo (Netlify):** [https://portafoliofredy.netlify.app/](https://portafoliofredy.netlify.app/)
- 💻 **GitHub:** [https://github.com/FredyMarG](https://github.com/FredyMarG)
- 📧 **Correo:** [fredymartinezquinto@hotmail.com](mailto:fredymartinezquinto@hotmail.com)
- 📱 **Teléfono / WhatsApp:** [+57 315 238 8315](https://wa.me/573152388315)
- 🧪 **Pruebas Automatizadas:** Ejecuta `npm test` en la raíz para validar la integridad del portafolio y las suites de pruebas backend (`node:test`).

---

## 🌟 Selección Curada de Proyectos Profesionales (17 Proyectos)

El repositorio reúne los **17 proyectos más completos y relevantes a nivel empresarial**, cubriendo Full-Stack MEAN, SQL (SQLite/MySQL), seguridad JWT + `scrypt` + RBAC, TypeScript estricto, Angular 16, HTML5 Web APIs, pruebas automatizadas y CI/CD con GitHub Actions.

### 1. 🌟 Aplicaciones Full-Stack & Productos Integradores

| Proyecto | Stack Principal | Arquitectura y Funcionalidades Clave |
| :--- | :--- | :--- |
| **[`Turismo_MEAN/`](./Turismo_MEAN/TurismoBack/index.js)**<br>*Plataforma de Turismo Full-Stack MEAN* | MongoDB, Mongoose 7, Express.js, Angular 16, `node:test` | • `TurismoBack/`: API RESTful CRUD + filtros + `/stats/resumen`, respaldo JSON local y 4 tests automatizados.<br>• `TurismoFront/`: Cliente SPA en Angular 16 con modo offline. |
| **[`App de citas/`](./App%20de%20citas/public/index.html)**<br>*Amour & Planes — App de Citas y Álbum SQL* | Node.js, SQLite3, PHP/MySQL, REST API, Vanilla JS SPA | • Servidor HTTP REST en [`server.js`](./App%20de%20citas/server.js) con SQLite3 ([`database/schema.sql`](./App%20de%20citas/database/schema.sql)) y soporte alternativo PHP/MySQL.<br>• Catálogo de planes, agendamiento, bitácora y álbum de hasta 10 fotos por cita con respaldo `localStorage`. |
| **[`Gestor-Tareas-Node/`](./Gestor-Tareas-Node/public/index.html)**<br>*Gestor de Tareas Full-Stack en Node.js Nativo* | Node.js (`node:http`), JSON/NDJSON, `EventEmitter`, `node:test` | • Servidor HTTP nativo sin dependencias externas, bitácora NDJSON, protección contra Path Traversal, pruebas unitarias y SPA con respaldo local. |
| **[`proyectoBit/`](./proyectoBit/index.html)**<br>*Procrastination Nightmare — Suite SaaS (7 Módulos)* | HTML5, CSS3, Bootstrap 5, JavaScript POO | • Pomodoro Focus, To-Do List, Calendario Mensual, Tracker de Hábitos, Notas, Roadmap POO, Backup JSON y Landing Page SaaS. |
| **[`Finanzas APP/`](./Finanzas%20APP/index.html)**<br>*Dashboard de Control Financiero & Gráfico Canvas 2D* | HTML5 Canvas 2D, JavaScript ES6+, LocalStorage, COP | • Control de ingresos, gastos y balance en tiempo real (`es-CO`), gráfico de dona en Canvas 2D y filtros dinámicos. |
| **[`Tablero Kanban/`](./Tablero%20Kanban/index.html)**<br>*Tablero Kanban Scrum con Drag & Drop Nativo* | HTML5 Drag & Drop API, LocalStorage, CSS Grid | • Tablero ágil de 3 columnas (*Por Hacer*, *En Progreso*, *Completado*) con `dataTransfer` y persistencia local. |
| **[`Buscador de Peliculas/`](./Buscador%20de%20Peliculas/index.html)**<br>*CineSearch Explorer — OMDb REST API & Debounce* | OMDb REST API, Debounce (500ms), HTML5 `<dialog>` | • Buscador en tiempo real con Debounce de 500ms y ficha técnica en modal nativo `<dialog>`. |
| **[`Tienda_Online/`](./Tienda_Online/index.html)**<br>*BIT Shop — E-Commerce Tecnológico* | JavaScript ES6+, Bootstrap 5 Offcanvas, Material Symbols | • Tienda virtual con Mega-Menú, buscador en tiempo real y carrito Offcanvas en pesos colombianos (COP). |

---

### 2. ⚙️ Backend REST APIs (Node.js, TypeScript, MongoDB, JWT) & Angular 16

| Proyecto | Stack Principal | Arquitectura y Funcionalidades Clave |
| :--- | :--- | :--- |
| **[`BitShop_API/`](./BitShop_API/src/app.js)**<br>*BitShop REST API con JWT, `scrypt` & RBAC* | Node.js, Express, JWT, `scrypt`, RBAC, `node:test` | • API E-Commerce con hashing criptográfico `scrypt`, JWT, roles `admin`/`client`, panel Login-first en `/`, `/docs` interactivo y 3 tests automatizados. |
| **[`ts_api/`](./ts_api/app.ts)**<br>*Enterprise Modular REST API en TypeScript* | TypeScript 5, Express.js, Login-First UI, `node:test` | • Servidor Express en TypeScript estricto con panel Login-first en `/`, controladores modulares y 4 pruebas automatizadas. |
| **[`Mongo/`](./Mongo/run-mongo-demo.js)**<br>*MongoDB CRUD & Query Operators Engine* | MongoDB, `mongosh`, Node.js, Playground Web, `node:test` | • Implementación de operadores `$eq`, `$ne`, `$gte`, `$lt`, `$in`, `$or`, `$set`, `$inc`, `$unset`, `$push`, Playground Web y 3 tests unitarios. |
| **[`procrastination-nightmare/`](./procrastination-nightmare/package.json)**<br>*Procrastination Nightmare SPA en Angular 16* | Angular 16, TypeScript 5, FullCalendar v6, PrimeNG 16 | • Single Page Application en Angular 16 con `@fullcalendar/angular`, `primeng`, `rxjs` y `jwt-decode`. |

---

### 3. ⚡ JavaScript Avanzado, HTML5 Web APIs & CSS Motion

| Proyecto | Stack Principal | Arquitectura y Funcionalidades Clave |
| :--- | :--- | :--- |
| **[`SketchPad-Canvas-2D/`](./SketchPad-Canvas-2D/index.html)**<br>*SketchPad 2D Pro — Estudio de Dibujo Vectorial* | HTML5 Canvas 2D API, ImageData Stack, Vanilla JS | • Pizarra 2D con pincel, figuras geométricas, rejilla técnica, historial Deshacer (`Ctrl+Z`) y exportación a PNG. |
| **[`Gestor-Offline-IndexedDB/`](./Gestor-Offline-IndexedDB/index.html)**<br>*NotesDB — Gestor Transaccional Offline-First* | IndexedDB API, IDBTransaction, IDBCursor, Blob JSON | • Base de datos transaccional en el navegador con operaciones CRUD, edición en línea y exportación a JSON. |
| **[`Visor-Archivos-DragDrop/`](./Visor-Archivos-DragDrop/index.html)**<br>*FileDrop Inspector — Analizador Multimedia* | Drag & Drop API, FileReader, ObjectURL, Clipboard API | • Inspector universal de archivos con barra de progreso, metadatos MIME, previsualización multimedia y copia al portapapeles. |
| **[`rickandmorty_api/`](./rickandmorty_api/index.html)**<br>*Multiverse Character Explorer (REST API)* | Fetch API, Async/Await, URLSearchParams, Bootstrap 5 | • Explorador conectado a la API de Rick & Morty con búsqueda, filtros por estado vital, paginación y modo offline. |
| **[`Web-Page-Animations/`](./Web-Page-Animations/index.html)**<br>*Portfolio UI & Motion — Animaciones CSS3 a 60 FPS* | CSS3 `@keyframes`, 3D GPU Transforms, Scroll-Driven | • Interfaz futurista con animaciones ligadas al scroll, tarjetas 3D, soporte `prefers-reduced-motion` y menú sin JS. |
