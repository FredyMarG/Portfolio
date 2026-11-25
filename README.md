# 🚀 Portafolio Profesional Full-Stack MEAN & SQL — Fredy Martinez

Repositorio oficial de proyectos de ingeniería de software de **Fredy Martinez** (*Full-Stack Software Developer & Certified Scrum Master*).

- 🌐 **Portafolio Desplegado en Vivo (Netlify):** [https://portafoliofredy.netlify.app/](https://portafoliofredy.netlify.app/)
- 📧 **Correo:** [fredymartinezquinto@hotmail.com](mailto:fredymartinezquinto@hotmail.com)
- 📱 **Teléfono / WhatsApp:** [+57 315 238 8315](https://wa.me/573152388315)
- 🖥️ **Ejecución Local:** Abre [`index.html`](./index.html) en tu navegador para explorar y ejecutar los proyectos en vivo.

---

## 🌟 Selección Curada de Proyectos Profesionales (16 Proyectos)

El repositorio está estructurado exclusivamente con los **16 proyectos más completos y relevantes a nivel profesional**, descartando ejercicios básicos de aula y clones estáticos de relleno para ofrecer una presentación ejecutiva enfocada en arquitectura real, Backend Node.js/TypeScript, Web APIs avanzadas, calidad visual y código limpio.

### 1. 🌟 Aplicaciones Full-Stack & Productos Integradores

| Proyecto | Stack Principal | Arquitectura y Funcionalidades Clave |
| :--- | :--- | :--- |
| **[`App de citas/`](./App%20de%20citas/public/index.html)**<br>*Amour & Planes — App de Citas y Álbum SQL* | Node.js, SQLite3, PHP/MySQL, REST API, Vanilla JS SPA | • Servidor HTTP REST en [`server.js`](./App%20de%20citas/server.js) con base de datos relacional SQLite3 ([`database/schema.sql`](./App%20de%20citas/database/schema.sql)) y soporte alternativo en PHP/MySQL ([`public/api.php`](./App%20de%20citas/public/api.php)).<br>• Catálogo de planes, creador de planes propios, agendamiento con fecha/hora, bitácora y álbum de hasta 10 fotografías por cita con respaldo automático en `localStorage`. |
| **[`Gestor-Tareas-Node/`](./Gestor-Tareas-Node/public/index.html)**<br>*Gestor de Tareas Full-Stack en Node.js Nativo* | Node.js (`node:http`), JSON/NDJSON, `EventEmitter`, `node:test`, SPA | • Servidor HTTP nativo sin dependencias externas ([`src/server.js`](./Gestor-Tareas-Node/src/server.js)), persistencia JSON + bitácora NDJSON ([`src/storage.js`](./Gestor-Tareas-Node/src/storage.js)), bus de eventos ([`src/bus.js`](./Gestor-Tareas-Node/src/bus.js)), pruebas unitarias en [`tests/tareas.test.js`](./Gestor-Tareas-Node/tests/tareas.test.js) y frontend SPA con respaldo en `localStorage`. |
| **[`proyectoBit/`](./proyectoBit/index.html)**<br>*Procrastination Nightmare — Suite SaaS (6 Módulos)* | HTML5, CSS3, Bootstrap 5, JavaScript POO | • **Pomodoro Focus** ([`index.html`](./proyectoBit/index.html), [`pomodoro.html`](./proyectoBit/pomodoro.html)), **Gestor To-Do** ([`to-do-list.html`](./proyectoBit/to-do-list.html)), **Calendario Mensual** ([`calendario.html`](./proyectoBit/calendario.html)), **Tracker de Hábitos** ([`habitos.html`](./proyectoBit/habitos.html)), **Roadmap de Tareas POO** ([`roadMapTareas.html`](./proyectoBit/roadMapTareas.html)) y **Landing Page Corporativa** ([`landing-full-bootstrap/index.html`](./proyectoBit/landing-full-bootstrap/index.html)). |
| **[`Finanzas APP/`](./Finanzas%20APP/index.html)**<br>*Dashboard de Control Financiero & Gráfico Canvas 2D* | HTML5 Canvas 2D, JavaScript ES6+, LocalStorage, COP | • Control de ingresos, gastos y balance en tiempo real con separador automático de miles (`es-CO`), gráfico de dona proporcional dibujado nativamente en Canvas 2D y filtros dinámicos. |
| **[`Tablero Kanban/`](./Tablero%20Kanban/index.html)**<br>*Tablero Kanban Scrum con Drag & Drop Nativo* | HTML5 Drag & Drop API, LocalStorage, CSS Grid | • Tablero ágil de 3 columnas (*Por Hacer*, *En Progreso*, *Completado*) con transferencia de tarjetas arrastrables mediante `dataTransfer` y persistencia en `localStorage`. |
| **[`Tienda_Online/`](./Tienda_Online/index.html)**<br>*BIT Shop — E-Commerce Tecnológico* | JavaScript ES6+, Bootstrap 5 Offcanvas, Material Symbols | • Tienda virtual interactiva con Mega-Menú de categorías, buscador en tiempo real y carrito de compras lateral (*Offcanvas*) con liquidación dinámica en pesos colombianos (COP). |
| **[`Proyecto_Bit/`](./Proyecto_Bit/TurismoBack/index.js)**<br>*Plataforma de Turismo Full-Stack MEAN* | MongoDB, Express.js, Angular 15, Node.js, Mongoose | • `TurismoBack/`: API RESTful en Express ([`index.js`](./Proyecto_Bit/TurismoBack/index.js)), conexión Mongoose ([`config/db.js`](./Proyecto_Bit/TurismoBack/config/db.js)) y CRUD de destinos ([`routes/routes.js`](./Proyecto_Bit/TurismoBack/routes/routes.js)).<br>• `TurismoFront/`: Cliente SPA en Angular 15. |

---

### 2. ⚙️ Backend REST APIs (Node.js, TypeScript, JWT) & Angular 15 SPA

| Proyecto | Stack Principal | Arquitectura y Funcionalidades Clave |
| :--- | :--- | :--- |
| **[`is-Error-main/`](./is-Error-main/src/app.js)**<br>*Bit-Shop REST API con JWT & RBAC* | Node.js, Express, MongoDB Atlas, Mongoose, JWT | • Backend de comercio electrónico bajo arquitectura MVC con modelos Mongoose (`Product`, `User`), firma y verificación de JSON Web Tokens ([`src/middlewares/auth.js`](./is-Error-main/src/middlewares/auth.js)) y control de permisos por rol. |
| **[`ts_api/`](./ts_api/app.ts)**<br>*Enterprise Modular REST API en TypeScript* | TypeScript, Express.js, Barrel Exports | • Servidor Express fuertemente tipado ([`app.ts`](./ts_api/app.ts), [`tsconfig.json`](./ts_api/tsconfig.json)) con controladores y rutas modulares exportadas mediante barriles (`index.ts`). |
| **[`procastination-nightmare/`](./procastination-nightmare/package.json)**<br>*Procrastination Nightmare SPA en Angular 15* | Angular 15, TypeScript, FullCalendar v6, SweetAlert2 | • Single Page Application en Angular 15 con integración de `@fullcalendar/angular` (`daygrid`, `timegrid`, `interaction`) y `@ng-bootstrap/ng-bootstrap`. |

---

### 3. ⚡ JavaScript Avanzado, HTML5 Web APIs & CSS Motion

| Proyecto | Stack Principal | Arquitectura y Funcionalidades Clave |
| :--- | :--- | :--- |
| **[`Buscador de Peliculas/`](./Buscador%20de%20Peliculas/index.html)**<br>*CineSearch Explorer — OMDb REST API & Debounce* | OMDb REST API, Debounce (500ms), HTML5 `<dialog>` | • Buscador cinematográfico en tiempo real con técnica **Debounce** de 500ms, etiquetas rápidas por franquicia y ficha técnica detallada (sinopsis, director, IMDb rating) en modal nativo `<dialog>`. |
| **[`SketchPad-Canvas-2D/`](./SketchPad-Canvas-2D/index.html)**<br>*SketchPad 2D Pro — Estudio de Dibujo Vectorial* | HTML5 Canvas 2D API, ImageData Stack, Vanilla JS | • Pizarra 2D con pincel, borrador, figuras geométricas en tiempo real (rectángulo, círculo, línea), rejilla técnica, pila de historial **Deshacer (`Ctrl+Z`)** con `getImageData`/`putImageData` y **Exportación a PNG**. |
| **[`Gestor-Offline-IndexedDB/`](./Gestor-Offline-IndexedDB/index.html)**<br>*NotesDB — Gestor Transaccional Offline-First* | IndexedDB API, IDBTransaction, IDBCursor, Blob JSON | • Base de datos transaccional en el navegador con **IndexedDB** (operaciones CRUD asíncronas, edición en línea `contentEditable`, búsqueda en tiempo real mediante cursores y **Exportación de backup a JSON**). |
| **[`Visor-Archivos-DragDrop/`](./Visor-Archivos-DragDrop/index.html)**<br>*FileDrop Inspector — Analizador Multimedia* | Drag & Drop API, FileReader, ObjectURL, Clipboard API | • Inspector de archivos con soporte **Drag & Drop**, barra de progreso de lectura binaria, metadatos (MIME y tamaño), previsualización de imagen/audio/video/código, botón de archivo demo y copia al portapapeles. |
| **[`rickandmorty_api/`](./rickandmorty_api/index.html)**<br>*Multiverse Character Explorer (REST API)* | Fetch API, Async/Await, URLSearchParams, Bootstrap 5 | • Explorador asíncrono conectado a la API oficial de Rick & Morty con búsqueda por nombre, filtros por estado vital (*Alive*, *Dead*, *Unknown*), paginación dinámica y modo offline de respaldo. |
| **[`Web-Page-Animations/`](./Web-Page-Animations/index.html)**<br>*Portfolio UI & Motion — Animaciones CSS3 a 60 FPS* | CSS3 `@keyframes`, 3D GPU Transforms, Scroll-Driven | • Interfaz futurista con barra de progreso ligada al scroll, órbitas rotatorias, gradiente cinético, marquee infinito, tarjetas 3D, soporte `prefers-reduced-motion` y menú responsive sin JavaScript. |
