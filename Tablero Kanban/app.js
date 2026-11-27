/**
 * ============================================================================
 * LÓGICA DE TABLERO KANBAN — DRAG & DROP API NATIVA Y PERSISTENCIA
 * Comentado línea a línea de forma educativa en español
 * ============================================================================
 */

// 1. ESTADO INICIAL Y PERSISTENCIA EN LOCALSTORAGE
// Recupera el tablero guardado en el navegador; si no existe, inicia con historias de usuario de ingeniería.
let estadoKanban = JSON.parse(localStorage.getItem('kanban_estado')) || {
  pendiente: [
    { id: '1', texto: 'Diseñar esquema relacional SQLite/MySQL y migraciones' },
    { id: '2', texto: 'Implementar pruebas unitarias en controladores TypeScript' }
  ],
  progreso: [
    { id: '3', texto: 'Integrar middleware de autenticación JWT y roles RBAC' }
  ],
  completado: [
    { id: '4', texto: 'Desplegar Portafolio Full-Stack en producción (Netlify)' }
  ]
};

// Guarda el objeto "estadoKanban" en localStorage y sincroniza con la Base de Datos Real SQL/Mongo (/api/kanban/tareas).
function guardarEstado() {
  localStorage.setItem('kanban_estado', JSON.stringify(estadoKanban)); // Persiste los datos entre recargas en el navegador
  if (location.protocol !== 'file:') { // Si se ejecuta sobre el servidor Full-Stack o Netlify Functions
    fetch('/api/kanban/tareas', {
      method: 'PUT', // Actualiza las 3 columnas en la tabla relacional `kanban_tareas`
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: estadoKanban }) // Envía el estado completo de tarjetas por columna
    }).catch(() => {});
  }
}

// Recupera las tarjetas Scrum almacenadas en la tabla `kanban_tareas` al iniciar el tablero.
async function cargarKanbanDesdeBD() {
  if (location.protocol === 'file:') return; // Si se abre como archivo local, mantiene el estado de localStorage
  try {
    const res = await fetch('/api/kanban/tareas'); // Consulta las tareas agrupadas por columna desde la BD
    const data = await res.json();
    if (res.ok && data.ok && data.estado) {
      estadoKanban = data.estado; // Reemplaza el estado en memoria con los registros reales de la BD
      localStorage.setItem('kanban_estado', JSON.stringify(estadoKanban)); // Actualiza la caché local
      renderizarTablero(); // Dibuja las tarjetas en las columnas Por Hacer, En Progreso y Completado
    }
  } catch {}
}

// 2. RENDERIZADO DEL TABLERO
// Recorre las 3 columnas del HTML y dibuja las tarjetas correspondientes según "estadoKanban".
function renderizarTablero() {
  document.querySelectorAll('.columna').forEach((columnaEl) => { // Itera sobre cada <div class="columna">
    const claveColumna = columnaEl.dataset.columna; // Lee el atributo data-columna ('pendiente', 'progreso' o 'completado')
    const contenedor = columnaEl.querySelector('.contenedor-tarjetas'); // Obtiene el área interna donde van las tarjetas
    contenedor.innerHTML = ''; // Limpia las tarjetas anteriores para evitar duplicados al redibujar

    estadoKanban[claveColumna].forEach((tarea) => { // Recorre cada tarea almacenada en esa columna
      const tarjeta = document.createElement('div'); // Crea un nuevo elemento <div> en memoria
      tarjeta.className = 'tarjeta'; // Asigna la clase CSS para darle estilo visual
      tarjeta.draggable = true; // Habilita la API nativa de arrastrar y soltar en este elemento
      tarjeta.dataset.id = tarea.id; // Guarda el id de la tarea en el atributo data-id

      const spanTexto = document.createElement('span');
      spanTexto.textContent = tarea.texto;

      const btnEliminar = document.createElement('button');
      btnEliminar.type = 'button';
      btnEliminar.className = 'btn-eliminar-tarjeta';
      btnEliminar.title = 'Eliminar tarea';
      btnEliminar.textContent = '×';
      btnEliminar.addEventListener('click', (e) => {
        e.stopPropagation();
        estadoKanban[claveColumna] = estadoKanban[claveColumna].filter((t) => t.id !== tarea.id);
        guardarEstado();
        renderizarTablero();
      });

      tarjeta.append(spanTexto, btnEliminar);

      // Evento que se dispara justo cuando el usuario comienza a arrastrar la tarjeta.
      tarjeta.addEventListener('dragstart', (evento) => {
        // dataTransfer permite adjuntar datos (como texto JSON) durante el arrastre para leerlos al soltar.
        evento.dataTransfer.setData('text/plain', JSON.stringify({
          id: tarea.id, // ID único de la tarea arrastrada
          origen: claveColumna // Nombre de la columna desde donde salió la tarjeta
        }));
      });

      contenedor.appendChild(tarjeta); // Inserta la tarjeta terminada dentro del contenedor de su columna
    });
  });
}

// 3. CONFIGURACIÓN DE ZONAS DE SUELTA (DROPZONES)
// Configura los eventos de arrastre y suelta en cada columna del tablero.
document.querySelectorAll('.columna').forEach((columnaEl) => {
  const contenedor = columnaEl.querySelector('.contenedor-tarjetas'); // Área receptora de tarjetas dentro de la columna

  // Se dispara continuamente mientras una tarjeta arrastrada pasa sobre esta columna.
  contenedor.addEventListener('dragover', (evento) => {
    evento.preventDefault(); // OBLIGATORIO: por defecto el navegador bloquea soltar elementos; esto lo habilita
    columnaEl.classList.add('drag-over'); // Añade la clase visual para resaltar la columna destino
  });

  // Se dispara cuando la tarjeta arrastrada sale del área de esta columna sin haberse soltado.
  contenedor.addEventListener('dragleave', () => {
    columnaEl.classList.remove('drag-over'); // Quita el resaltado visual de la columna
  });

  // Se dispara cuando el usuario suelta la tarjeta dentro de esta columna.
  contenedor.addEventListener('drop', (evento) => {
    evento.preventDefault(); // Evita comportamientos por defecto del navegador al soltar contenido
    columnaEl.classList.remove('drag-over'); // Quita el resaltado visual tras soltar

    // Recupera y convierte a objeto los datos enviados en el evento 'dragstart'.
    const datosArrastre = JSON.parse(evento.dataTransfer.getData('text/plain'));
    const columnaDestino = columnaEl.dataset.columna; // Obtiene el nombre de la columna donde se soltó

    if (datosArrastre.origen === columnaDestino) return; // Si se soltó en la misma columna, no hace nada

    // Busca la posición (índice) de la tarea dentro del arreglo de la columna de origen.
    const indice = estadoKanban[datosArrastre.origen].findIndex((tarea) => tarea.id === datosArrastre.id);
    // splice(indice, 1) extrae la tarea del arreglo origen y devuelve un arreglo con el elemento eliminado.
    const [tareaMovida] = estadoKanban[datosArrastre.origen].splice(indice, 1);
    estadoKanban[columnaDestino].push(tareaMovida); // Agrega la tarea extraída al arreglo de la columna destino

    guardarEstado(); // Guarda el nuevo orden en localStorage
    renderizarTablero(); // Redibuja todo el tablero para reflejar el movimiento
  });
});

// 4. CREACIÓN DE NUEVAS TAREAS
// Escucha el clic en el botón "Agregar Tarea" para añadir una tarjeta en la columna "Por Hacer".
document.getElementById('btn-agregar').addEventListener('click', () => {
  const inputTarea = document.getElementById('texto-tarea'); // Obtiene la referencia al campo de texto
  const textoLimpio = inputTarea.value.trim(); // Lee el texto y elimina espacios innecesarios al inicio y al final

  if (textoLimpio) { // Solo agrega la tarea si el campo no está vacío
    estadoKanban.pendiente.push({ // Añade la nueva tarea al arreglo 'pendiente'
      id: Date.now().toString(), // Genera un ID único usando la marca de tiempo actual en texto
      texto: textoLimpio // Guarda el texto escrito por el usuario
    });
    inputTarea.value = ''; // Limpia el campo de texto para facilitar el siguiente registro
    guardarEstado(); // Persiste la nueva tarea en localStorage
    renderizarTablero(); // Vuelve a dibujar el tablero con la nueva tarjeta visible
  }
});

// 5. SOPORTE DE TECLA ENTER E INICIALIZACIÓN DEL TABLERO
document.getElementById('texto-tarea').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('btn-agregar').click();
  }
});

renderizarTablero(); // Dibuja las columnas y tareas guardadas apenas carga la página
cargarKanbanDesdeBD(); // Sincroniza las tarjetas desde la Base de Datos Real SQL/Mongo
