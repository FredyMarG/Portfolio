// ============================================================================
// NUESTROS PLANES JUNTOS — LÓGICA PRINCIPAL COMENTADA LÍNEA POR LÍNEA
// ============================================================================

const DEFAULT_SUGGESTED_PLANS = [ // Arreglo con los 10 planes sugeridos por defecto
  { id: 1, titulo: 'Tarde de Bolos, Retos y Malteadas', categoria: 'Divertido', descripcion: 'Compitan en las pistas de bolos, hagan apuestas tiernas por cada chuza y cierren compartiendo malteadas.', icono: '🎳', duracion_estimada: '2.5 a 3 horas', presupuesto: '$$ Moderado', lugar_sugerido: 'Bolera favorita de la ciudad', tips_romanticos: 'El que gane cada ronda pide un deseo o un beso.' }, // Plan 1
  { id: 2, titulo: 'Carrera de Karts a Toda Velocidad', categoria: 'Aventura', descripcion: 'Adrenalina pura compitiendo juntos en la pista de Go-Karts y fotos en el podio.', icono: '🏎️', duracion_estimada: '2 horas', presupuesto: '$$ Moderado', lugar_sugerido: 'Pista de Karts', tips_romanticos: 'Tómense una foto con los cascos puestos antes de arrancar.' }, // Plan 2
  { id: 3, titulo: 'Parque de Diversiones y Rueda de la Fortuna', categoria: 'Aventura', descripcion: 'Montañas rusas, carros chocones, algodón de azúcar y atardecer en la rueda de la fortuna.', icono: '🎡', duracion_estimada: '4 a 5 horas', presupuesto: '$$$ Especial', lugar_sugerido: 'Parque de diversiones', tips_romanticos: 'Intenten ganar un peluche en los juegos de feria.' }, // Plan 3
  { id: 4, titulo: 'Cita de Cine, Palomitas y Cena Romántica', categoria: 'Romántico', descripcion: 'Elijan una película que ambos quieran ver, compartan palomitas y salgan a cenar.', icono: '🍿', duracion_estimada: '3.5 horas', presupuesto: '$$ Moderado', lugar_sugerido: 'Cine favorito', tips_romanticos: 'Guarden las entradas como recuerdo de la función.' }, // Plan 4
  { id: 5, titulo: 'Picnic Romántico al Atardecer', categoria: 'Romántico', descripcion: 'Escapada al aire libre con manta, fresas con chocolate, tabla de quesos y música.', icono: '🌅', duracion_estimada: '3 horas', presupuesto: '$$ Moderado', lugar_sugerido: 'Parque o jardín tranquilo', tips_romanticos: 'Lleven una carta escrita a mano para leerla al caer el sol.' }, // Plan 5
  { id: 6, titulo: 'Mirador Nocturno bajo las Estrellas', categoria: 'Romántico', descripcion: 'Subir al mirador para ver las luces de la ciudad abrazados con chocolate caliente.', icono: '🌌', duracion_estimada: '2.5 horas', presupuesto: '$ Económico', lugar_sugerido: 'Mirador panorámico', tips_romanticos: 'Lleven una cobija abrigadora para compartir.' }, // Plan 6
  { id: 7, titulo: 'Noche de Chef en Pareja: Pizzas y Vino', categoria: 'Gastronómico', descripcion: 'Preparen juntos sus propias pizzas artesanales desde la masa con música y vino.', icono: '🍕', duracion_estimada: '2.5 horas', presupuesto: '$$ Moderado', lugar_sugerido: 'En casa', tips_romanticos: 'Denle forma de corazón a las pizzas y saquen fotos cocinando.' }, // Plan 7
  { id: 8, titulo: 'Glamping o Fogata con Masmelos', categoria: 'Romántico', descripcion: 'Noche mágica rodeados de naturaleza, luces cálidas y fogata bajo las estrellas.', icono: '🏕️', duracion_estimada: 'Noche completa', presupuesto: '$$$ Especial', lugar_sugerido: 'Glamping o cabaña', tips_romanticos: 'Preparen una lista de canciones especiales para la fogata.' }, // Plan 8
  { id: 9, titulo: 'Ruta de Postres, Helados y Café', categoria: 'Gastronómico', descripcion: 'Paseo dulce probando café especial, waffles o crepes y cerrando con helado artesanal.', icono: '🍨', duracion_estimada: '2.5 horas', presupuesto: '$$ Moderado', lugar_sugerido: 'Zona gastronómica', tips_romanticos: 'Pidan sabores distintos en cada parada para probar ambos.' }, // Plan 9
  { id: 10, titulo: 'Tarde de Pintura, Cerámica o Arcade', categoria: 'Creativo', descripcion: 'Pintar dos cuadros, moldear tazas de cerámica o retarse en las máquinas de Arcade.', icono: '🎨', duracion_estimada: '2.5 horas', presupuesto: '$$ Moderado', lugar_sugerido: 'Café creativo o Arcade', tips_romanticos: 'Intercambien sus creaciones al final como recuerdo.' } // Plan 10
]; // Fin de la lista de planes sugeridos

const state = { // Objeto global que almacena el estado de la aplicación en memoria
  planes: [...DEFAULT_SUGGESTED_PLANS], // Lista de planes disponibles (inicia con los 10 sugeridos)
  citas: [], // Lista de citas programadas (inicia vacía sin datos de relleno)
  selectedCategory: 'Todos', // Categoría activa en el filtro del menú de planes
  selectedCitaStatus: 'Todas', // Filtro de estado activo en la pestaña del álbum ('Todas', 'Programada', 'Completada')
  activeMenuPlanId: 1, // ID del plan seleccionado actualmente en la vista previa del menú
  esModoPlanLibre: false, // Indica si el usuario eligió escribir un plan libre en vez de usar el menú
  newCitaSlots: {}, // Objeto que guarda temporalmente las fotos (casillas 1 a 10) antes de guardar una nueva cita
  activeNewCitaSlotTarget: 1, // Número de casilla (1..10) que el usuario pulsó para subir una foto individual
  uploadTarget: { citaId: null, slotNumero: null }, // Guarda a qué cita y casilla se subirá una foto desde el álbum
  lightbox: { citaId: null, photoIndex: 0 }, // Guarda qué cita y qué foto se están viendo en grande en el visor Lightbox
  backendType: null, // Guarda si el servidor detectado es 'php' (XAMPP/InfinityFree) o 'node'
  offlineMode: false // Indica si funciona sin servidor usando el almacenamiento del navegador (localStorage)
}; // Fin del objeto state

function showToast(message) { // Función para mostrar notificaciones emergentes en la esquina
  const container = document.getElementById('toastContainer'); // Busca el contenedor de notificaciones en el HTML
  const toast = document.createElement('div'); // Crea un nuevo elemento div para el mensaje
  toast.className = 'toast'; // Le asigna la clase CSS de diseño del mensaje
  toast.textContent = message; // Coloca el texto de la notificación dentro del div
  container.appendChild(toast); // Agrega el mensaje en pantalla dentro del contenedor
  setTimeout(() => { // Programa el desvanecimiento automático después de 3.5 segundos
    toast.style.opacity = '0'; // Reduce la opacidad a cero para animar su salida
    toast.style.transition = 'opacity 0.3s ease'; // Aplica una transición suave de 0.3 segundos
    setTimeout(() => toast.remove(), 300); // Elimina el elemento del DOM al terminar la animación
  }, 3500); // Tiempo visible: 3500 milisegundos
} // Fin de showToast

function formatFechaEs(fechaStr) { // Convierte una fecha 'YYYY-MM-DD' a texto en español (ej. 'sábado, 7 de noviembre de 2026')
  if (!fechaStr) return ''; // Si no hay fecha, devuelve cadena vacía
  const [y, m, d] = fechaStr.split('-').map(Number); // Separa año, mes y día convirtiéndolos a números
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { // Crea el objeto Date local y lo formatea en español
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' // Incluye día de la semana, día, mes y año
  }); // Fin de toLocaleDateString
} // Fin de formatFechaEs

function formatHoraEs(horaStr) { // Convierte una hora 'HH:MM' a formato de 24h y 12h AM/PM
  if (!horaStr) return ''; // Si no hay hora, devuelve cadena vacía
  const [hh, mm] = horaStr.split(':').map(Number); // Separa las horas y los minutos como números
  const suffix = hh >= 12 ? 'PM' : 'AM'; // Determina si es AM o PM según si pasa del mediodía
  const hour12 = ((hh + 11) % 12) + 1; // Convierte la hora militar (0..23) al formato de 1 a 12
  return `${horaStr} (${hour12}:${String(mm).padStart(2, '0')} ${suffix})`; // Devuelve '19:30 (7:30 PM)'
} // Fin de formatHoraEs

function escapeHtml(str) { // Protege textos escritos por el usuario para evitar inyección HTML
  return String(str ?? '') // Convierte el valor a texto seguro (o cadena vacía si es null/undefined)
    .replace(/&/g, '&amp;') // Reemplaza el símbolo & por su entidad HTML
    .replace(/</g, '&lt;') // Reemplaza el símbolo < por su entidad HTML
    .replace(/>/g, '&gt;') // Reemplaza el símbolo > por su entidad HTML
    .replace(/"/g, '&quot;'); // Reemplaza las comillas dobles por su entidad HTML
} // Fin de escapeHtml

function fileToOptimizedDataUrl(file, maxWidth = 1280, quality = 0.82) { // Comprime y convierte un archivo de imagen a Base64
  return new Promise((resolve, reject) => { // Devuelve una promesa asíncrona con la imagen optimizada
    const reader = new FileReader(); // Crea un lector de archivos del navegador
    reader.onload = (e) => { // Se ejecuta cuando el lector termina de leer el archivo seleccionado
      const img = new Image(); // Crea un objeto de imagen en memoria
      img.onload = () => { // Se ejecuta cuando la imagen carga sus dimensiones originales
        let { width, height } = img; // Obtiene el ancho y alto originales de la foto
        if (width > maxWidth) { // Si el ancho supera el máximo permitido (1280px)
          height = Math.round((height * maxWidth) / width); // Ajusta el alto proporcionalmente
          width = maxWidth; // Limita el ancho al máximo definido
        } // Fin del ajuste de tamaño
        const canvas = document.createElement('canvas'); // Crea un lienzo HTML5 para redimensionar la foto
        canvas.width = width; // Asigna el nuevo ancho al lienzo
        canvas.height = height; // Asigna el nuevo alto al lienzo
        canvas.getContext('2d').drawImage(img, 0, 0, width, height); // Dibuja la imagen redimensionada en el lienzo
        const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'; // Conserva PNG o comprime como JPEG
        resolve(canvas.toDataURL(outType, quality)); // Devuelve la cadena Base64 comprimida
      }; // Fin de img.onload
      img.onerror = reject; // Si el archivo de imagen es inválido, rechaza la promesa
      img.src = e.target.result; // Asigna los datos leídos a la imagen para disparar img.onload
    }; // Fin de reader.onload
    reader.onerror = reject; // Si falla la lectura del archivo, rechaza la promesa
    reader.readAsDataURL(file); // Inicia la lectura del archivo como Data URL (Base64)
  }); // Fin de la promesa
} // Fin de fileToOptimizedDataUrl

window.switchTab = function (tabId) { // Cambia entre las 4 pestañas principales de la interfaz
  document.querySelectorAll('.tab-btn').forEach((btn) => { // Recorre todos los botones del menú superior
    btn.classList.toggle('active', btn.dataset.tab === tabId); // Activa solo el botón que coincide con la pestaña elegida
  }); // Fin del recorrido de botones
  document.querySelectorAll('.tab-panel').forEach((panel) => { // Recorre todas las secciones de contenido
    panel.classList.toggle('active', panel.id === tabId); // Muestra únicamente el panel cuyo ID coincide
  }); // Fin del recorrido de paneles
}; // Fin de switchTab

function loadLocalFallbackState() { // Carga los planes y citas desde localStorage si no hay servidor activo (ej. Netlify estático)
  try { // Intenta leer los datos guardados en el navegador
    const savedPlanes = localStorage.getItem('npj_planes_v3'); // Busca los planes guardados en localStorage
    const savedCitas = localStorage.getItem('npj_citas_v3'); // Busca las citas guardadas en localStorage
    state.planes = savedPlanes ? JSON.parse(savedPlanes) : [...DEFAULT_SUGGESTED_PLANS]; // Usa los guardados o los 10 por defecto
    state.citas = savedCitas ? JSON.parse(savedCitas) : []; // Usa las citas guardadas o una lista vacía (sin citas de relleno)
  } catch (_) { // Si ocurre algún error leyendo localStorage
    state.planes = [...DEFAULT_SUGGESTED_PLANS]; // Restaura los 10 planes sugeridos
    state.citas = []; // Deja las citas vacías
  } // Fin del bloque try-catch
} // Fin de loadLocalFallbackState

function saveLocalFallbackState() { // Guarda el estado actual en localStorage cuando se usa sin servidor
  try { // Intenta escribir en el almacenamiento local del navegador
    localStorage.setItem('npj_planes_v3', JSON.stringify(state.planes)); // Guarda el arreglo de planes en formato JSON
    localStorage.setItem('npj_citas_v3', JSON.stringify(state.citas)); // Guarda el arreglo de citas en formato JSON
  } catch (_) {} // Ignora errores si se llena la cuota de localStorage
} // Fin de saveLocalFallbackState

async function apiRequest(endpoint, options = {}) { // Envía peticiones HTTP detectando automáticamente api.php (XAMPP/InfinityFree) o Node.js
  const method = (options.method || 'GET').toUpperCase(); // Obtiene el método HTTP en mayúsculas (GET, POST, PUT, DELETE)
  const phpMethod = method === 'GET' ? 'GET' : 'POST'; // Convierte PUT/DELETE en POST para máxima compatibilidad con PHP
  const methodParam = method !== 'GET' && method !== 'POST' ? `&_method=${method}` : ''; // Añade ?_method=PUT o DELETE en la URL para api.php
  const phpUrl = `api.php?endpoint=${encodeURIComponent(endpoint)}${methodParam}`; // Construye la URL hacia api.php

  if (state.backendType === 'php') { // Si ya se detectó que estamos corriendo sobre XAMPP o InfinityFree (PHP)
    const res = await fetch(phpUrl, { ...options, method: phpMethod }); // Llama directamente a api.php
    return res.json(); // Devuelve la respuesta JSON del servidor PHP
  } // Fin del caso PHP

  if (state.backendType === 'node') { // Si ya se detectó que estamos corriendo sobre el servidor Node.js
    const res = await fetch(endpoint, options); // Llama directamente a la ruta /api/...
    return res.json(); // Devuelve la respuesta JSON de Node.js
  } // Fin del caso Node.js

  try { // En la primera llamada, intenta primero conectarse con api.php (XAMPP / InfinityFree)
    const phpRes = await fetch(phpUrl, { ...options, method: phpMethod }); // Hace la petición de prueba a api.php
    const phpData = await phpRes.json(); // Intenta leer el JSON devuelto por api.php
    if (phpData && typeof phpData.ok === 'boolean') { // Si respondió con un JSON válido de nuestra API
      state.backendType = 'php'; // Recuerda que el backend activo es PHP + MySQL
      return phpData; // Devuelve los datos obtenidos
    } // Fin de verificación de respuesta PHP
  } catch (_) {} // Si api.php no está activo, pasa a probar Node.js

  const nodeRes = await fetch(endpoint, options); // Intenta conectarse con el servidor Node.js (/api/...)
  const nodeData = await nodeRes.json(); // Intenta leer el JSON devuelto por Node.js
  if (nodeData && typeof nodeData.ok === 'boolean') { // Si respondió con un JSON válido
    state.backendType = 'node'; // Recuerda que el backend activo es Node.js
    return nodeData; // Devuelve los datos obtenidos
  } // Fin de verificación de respuesta Node

  throw new Error('Servidor no disponible'); // Si ninguno respondió, lanza error para activar el modo local (localStorage)
} // Fin de apiRequest

async function loadAllData() { // Carga todos los planes y citas al iniciar o actualizar la página
  try { // Intenta obtener los datos desde el servidor (MySQL o SQLite)
    if (window.location.protocol === 'file:') throw new Error('Archivo local'); // Si se abrió con doble clic sin servidor, usa modo local
    const planesRes = await apiRequest('/api/planes'); // Solicita la lista de planes al backend
    const citasRes = await apiRequest('/api/citas'); // Solicita la lista de citas y fotos al backend
    if (planesRes.ok && Array.isArray(planesRes.planes) && planesRes.planes.length > 0) { // Si llegaron planes válidos
      state.planes = planesRes.planes; // Actualiza la lista de planes en memoria
    } // Fin de asignación de planes
    if (citasRes.ok && Array.isArray(citasRes.citas)) { // Si llegaron las citas desde la base de datos
      state.citas = citasRes.citas; // Actualiza la lista de citas en memoria
    } // Fin de asignación de citas
    state.offlineMode = false; // Indica que estamos conectados a la base de datos real
  } catch (_) { // Si no hay servidor disponible (ej. subido solo el frontend a Netlify)
    state.offlineMode = true; // Activa el modo local en el navegador
    loadLocalFallbackState(); // Carga los planes y citas desde localStorage
  } // Fin del bloque try-catch

  updateHeaderStats(); // Actualiza el contador de citas en la pestaña del menú superior
  renderPlanes(); // Dibuja el menú interactivo de planes y la tarjeta de vista previa
  populatePlanSelect(); // Llena el selector desplegable de planes en la pestaña de agendar
  renderManualFiveSlotsNewCita(); // Dibuja las 10 casillas de subida de fotos en el formulario de nueva cita
  renderCitas(); // Dibuja todas las tarjetas de planes agendados y sus álbumes de 10 fotos
} // Fin de loadAllData

function updateHeaderStats() { // Actualiza la burbuja con el total de planes agendados en el encabezado
  const totalCitasEl = document.getElementById('statTotalCitas'); // Busca el contador en la barra de navegación
  if (totalCitasEl) totalCitasEl.textContent = state.citas.length; // Muestra la cantidad total de citas registradas
} // Fin de updateHeaderStats

// ============================================================================
// 1. MENÚ INTERACTIVO DE PLANES Y TARJETA DE DETALLE
// ============================================================================
function renderPlanes() { // Renderiza la lista de planes a la izquierda y el detalle del plan activo a la derecha
  const menuList = document.getElementById('planesMenuList'); // Contenedor de los botones de la lista de planes
  const detailCard = document.getElementById('planActiveDetailCard'); // Contenedor de la tarjeta grande del plan seleccionado
  const triggerText = document.getElementById('currentMenuSelectionText'); // Texto del botón desplegable en móviles
  if (!menuList || !detailCard) return; // Si no existen los elementos en el DOM, termina

  const filtered = state.selectedCategory === 'Todos' // Verifica si está seleccionado el filtro 'Todos'
    ? state.planes // Muestra todos los planes
    : state.planes.filter((p) => p.categoria === state.selectedCategory); // Filtra solo los de la categoría elegida

  if (filtered.length === 0) { // Si no hay planes en la categoría seleccionada
    menuList.innerHTML = `<div style="padding:18px; text-align:center; color:var(--text-muted);">No hay planes en esta categoría aún.</div>`; // Mensaje vacío en la lista
    detailCard.innerHTML = `<div style="padding:30px; text-align:center;">Elige otra categoría o escribe un plan propio.</div>`; // Mensaje vacío en la tarjeta
    return; // Sale de la función
  } // Fin de validación de lista vacía

  let activePlan = filtered.find((p) => p.id === state.activeMenuPlanId); // Busca si el plan activo está dentro del filtro actual
  if (!activePlan) { // Si el plan activo no pertenece a la categoría filtrada
    activePlan = filtered[0]; // Selecciona automáticamente el primer plan de la lista filtrada
    state.activeMenuPlanId = activePlan.id; // Actualiza el ID del plan activo en el estado
  } // Fin de ajuste del plan activo

  if (triggerText) { // Si existe el texto del selector desplegable
    triggerText.textContent = `${activePlan.icono || '💖'} ${activePlan.titulo}`; // Muestra el ícono y nombre del plan actual
  } // Fin de actualización del texto desplegable

  menuList.innerHTML = filtered.map((plan) => { // Genera el HTML de cada opción en la lista del menú
    const isSelected = plan.id === activePlan.id; // Comprueba si este plan es el que está activo
    return `
      <button type="button" class="menu-plan-item ${isSelected ? 'active' : ''}" onclick="selectMenuPlan(${plan.id})">
        <div class="menu-plan-left">
          <div class="menu-plan-emoji">${plan.icono || '💖'}</div>
          <div class="menu-plan-info">
            <div class="menu-plan-title">${escapeHtml(plan.titulo)}</div>
            <div class="menu-plan-sub">${escapeHtml(plan.categoria)} • ${escapeHtml(plan.duracion_estimada)}</div>
          </div>
        </div>
        <span class="menu-plan-check">${isSelected ? '✓' : '❯'}</span>
      </button>
    `; // Devuelve el botón HTML del plan
  }).join(''); // Une todos los botones en un solo bloque HTML

  const esPersonalizado = activePlan.id > 10; // Determina si el plan fue creado por el usuario (ID mayor a 10)
  detailCard.innerHTML = `
    <div style="width:100%;">
      <div class="showcase-icon-halo">${activePlan.icono || '💖'}</div>
      <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
        ${esPersonalizado ? '<span class="badge-plan-num">✨ Creado por Nosotros</span>' : ''}
        <span class="badge-cat">${escapeHtml(activePlan.categoria)}</span>
      </div>
      <h3 class="showcase-title">${escapeHtml(activePlan.titulo)}</h3>
      <p class="showcase-desc">${escapeHtml(activePlan.descripcion)}</p>
    </div>

    <div class="showcase-details-grid">
      <div class="showcase-detail-pill">
        <span>⏱️ Duración</span>
        <strong>${escapeHtml(activePlan.duracion_estimada)}</strong>
      </div>
      <div class="showcase-detail-pill">
        <span>✨ Estilo</span>
        <strong>${escapeHtml(activePlan.presupuesto)}</strong>
      </div>
      <div class="showcase-detail-pill">
        <span>📍 Lugar Ideal</span>
        <strong>${escapeHtml(activePlan.lugar_sugerido)}</strong>
      </div>
    </div>

    <div class="showcase-tip-box">
      💡 <strong>Detalle romántico sugerido:</strong> ${escapeHtml(activePlan.tips_romanticos)}
    </div>

    <div class="showcase-actions-bar">
      <button type="button" class="btn btn-glass btn-sm" onclick="stepMenuPlan(-1)">❮ Anterior</button>
      <button type="button" class="btn btn-primary btn-lg" onclick="selectPlanAndSchedule(${activePlan.id})">
        📅 Escoger Fecha, Hora y Subir 10 Fotos
      </button>
      <button type="button" class="btn btn-glass btn-sm" onclick="stepMenuPlan(1)">Siguiente ❯</button>
      ${esPersonalizado && !activePlan.veces_agendado ? `
        <button type="button" class="btn btn-danger btn-sm" onclick="deleteCustomPlan(${activePlan.id})">🗑️ Quitar Plan</button>
      ` : ''}
    </div>
  `; // Dibuja la tarjeta completa del plan seleccionado
} // Fin de renderPlanes

window.selectMenuPlan = function (planId) { // Cambia el plan activo cuando el usuario hace clic en la lista
  state.activeMenuPlanId = Number(planId); // Guarda el nuevo ID de plan seleccionado
  renderPlanes(); // Vuelve a dibujar el menú y la tarjeta de vista previa
}; // Fin de selectMenuPlan

window.stepMenuPlan = function (direction) { // Avanza o retrocede entre los planes con los botones Anterior / Siguiente
  const filtered = state.selectedCategory === 'Todos' // Obtiene la lista de planes según la categoría actual
    ? state.planes // Todos los planes
    : state.planes.filter((p) => p.categoria === state.selectedCategory); // Planes filtrados por categoría
  if (!filtered.length) return; // Si no hay planes, no hace nada
  const idx = filtered.findIndex((p) => p.id === state.activeMenuPlanId); // Busca la posición del plan actual
  const nextIdx = (idx + direction + filtered.length) % filtered.length; // Calcula el índice siguiente o anterior de forma circular
  state.activeMenuPlanId = filtered[nextIdx].id; // Actualiza el ID del plan activo
  renderPlanes(); // Redibuja la vista previa
}; // Fin de stepMenuPlan

window.selectPlanAndSchedule = function (planId) { // Lleva al usuario a la pestaña de agendar con el plan ya elegido
  setPlanMode(false); // Activa el modo de elegir plan del menú
  const select = document.getElementById('selectPlanId'); // Busca el selector desplegable de planes
  select.value = String(planId); // Selecciona el ID del plan elegido
  onPlanSelectChange(); // Actualiza los campos de título, lugar y resumen del plan
  switchTab('tab-agendar'); // Cambia a la pestaña de Fecha, Hora y Fotos
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplaza suavemente la ventana hacia arriba
  showToast('✨ Plan elegido. Escoge la fecha, la hora y sube tus fotos.'); // Muestra confirmación en pantalla
}; // Fin de selectPlanAndSchedule

window.deleteCustomPlan = async function (planId) { // Elimina un plan personalizado creado por el usuario
  if (!state.offlineMode) { // Si está conectado al servidor (PHP o Node.js)
    const res = await apiRequest(`/api/planes/${planId}`, { method: 'DELETE' }); // Solicita borrar el plan en la base de datos
    if (!res.ok) { // Si el servidor devuelve un error (ej. el plan ya tiene citas)
      showToast(`⚠️ ${res.error}`); // Muestra el motivo del error
      return; // Detiene la función
    } // Fin de validación de error
    await loadAllData(); // Recarga los planes actualizados desde el servidor
  } else { // Si está en modo local (localStorage)
    state.planes = state.planes.filter((p) => p.id !== planId); // Quita el plan del arreglo en memoria
    saveLocalFallbackState(); // Guarda los cambios en localStorage
    renderPlanes(); // Redibuja el menú de planes
    populatePlanSelect(); // Actualiza el selector desplegable
  } // Fin de borrado según modo
  showToast('🗑️ Plan personalizado eliminado.'); // Confirma la eliminación al usuario
}; // Fin de deleteCustomPlan

function populatePlanSelect() { // Llena el elemento <select> con todos los planes disponibles
  const select = document.getElementById('selectPlanId'); // Obtiene el elemento <select> del formulario
  const currentVal = select.value; // Guarda el valor seleccionado actualmente para no perderlo
  select.innerHTML = state.planes.map((p) => // Genera una etiqueta <option> por cada plan
    `<option value="${p.id}">${p.icono} ${escapeHtml(p.titulo)} (${escapeHtml(p.categoria)})</option>` // Texto de la opción
  ).join(''); // Une todas las opciones dentro del select
  if (currentVal && state.planes.some((p) => String(p.id) === String(currentVal))) { // Si el valor previo sigue existiendo
    select.value = currentVal; // Lo vuelve a dejar seleccionado
  } // Fin de restauración del valor seleccionado
  onPlanSelectChange(); // Actualiza la vista previa del plan debajo del select
} // Fin de populatePlanSelect

function onPlanSelectChange() { // Actualiza el resumen, título y lugar sugerido al cambiar de plan en el <select>
  if (state.esModoPlanLibre) return; // Si está en modo de escribir plan libre, no sobrescribe los campos
  const planId = Number(document.getElementById('selectPlanId').value); // Obtiene el ID numérico del plan seleccionado
  const plan = state.planes.find((p) => p.id === planId); // Busca el objeto del plan en el estado
  if (!plan) return; // Si no lo encuentra, termina
  document.getElementById('selectedPlanPreview').innerHTML = `
    <strong>${plan.icono} ${escapeHtml(plan.titulo)} (${escapeHtml(plan.categoria)}):</strong>
    ${escapeHtml(plan.descripcion)}
    <div style="margin-top:6px; color:#be123c;">💡 <em>${escapeHtml(plan.tips_romanticos)}</em></div>
  `; // Muestra la descripción y el consejo romántico del plan elegido
  document.getElementById('inputTituloCita').value = plan.titulo; // Autocompleta el nombre de la cita con el título del plan
  document.getElementById('inputLugarCita').value = plan.lugar_sugerido; // Autocompleta el lugar con el lugar sugerido
} // Fin de onPlanSelectChange

// ============================================================================
// 2. CREAR UN PLAN PROPIO DIFERENTE A LOS SUGERIDOS
// ============================================================================
document.querySelectorAll('#customEmojiPicker .emoji-choice').forEach((btn) => { // Recorre los botones de emojis
  btn.addEventListener('click', () => { // Escucha el clic en cada emoji
    document.querySelectorAll('#customEmojiPicker .emoji-choice').forEach((b) => b.classList.remove('active')); // Quita la selección previa
    btn.classList.add('active'); // Marca como activo el emoji pulsado
    document.getElementById('customPlanIcono').value = btn.dataset.emoji; // Guarda el emoji elegido en el input oculto
  }); // Fin del evento click del emoji
}); // Fin de configuración del selector de emojis

document.getElementById('chkAgendarCustomAhora').addEventListener('change', (e) => { // Escucha el checkbox de agendar fecha/hora de una vez
  document.getElementById('customPlanDateTimeFields').classList.toggle('hidden', !e.target.checked); // Muestra u oculta los campos de fecha y hora
}); // Fin del evento change del checkbox

document.getElementById('formPlanPropio').addEventListener('submit', async (e) => { // Procesa el envío del formulario de plan propio
  e.preventDefault(); // Evita que la página se recargue al enviar el formulario
  const titulo = document.getElementById('customPlanTitulo').value.trim(); // Lee el nombre del plan propio
  const categoria = document.getElementById('customPlanCategoria').value; // Lee la categoría elegida
  const icono = document.getElementById('customPlanIcono').value || '💑'; // Lee el ícono elegido
  const descripcion = document.getElementById('customPlanDescripcion').value.trim(); // Lee la descripción del plan
  const lugar_sugerido = document.getElementById('customPlanLugar').value.trim() || 'Nuestro lugar especial'; // Lee el lugar o usa valor por defecto
  const duracion_estimada = document.getElementById('customPlanDuracion').value.trim() || 'A nuestro ritmo'; // Lee la duración estimada
  const tips_romanticos = document.getElementById('customPlanTips').value.trim() || 'Disfrutar juntos y tomar nuestras fotos.'; // Lee el detalle especial
  const agendar_ahora = document.getElementById('chkAgendarCustomAhora').checked; // Verifica si quiere agendarlo de inmediato
  const fecha = document.getElementById('customPlanFecha').value; // Lee la fecha seleccionada
  const hora = document.getElementById('customPlanHora').value; // Lee la hora seleccionada

  if (!titulo || !descripcion) { // Verifica que haya escrito título y descripción
    showToast('⚠️ Escribe el nombre y la descripción de tu plan.'); // Muestra aviso si faltan
    return; // Detiene el guardado
  } // Fin de validación

  if (!state.offlineMode) { // Si está conectado al servidor (MySQL o Node)
    const res = await apiRequest('/api/planes', { // Envía los datos del nuevo plan a la API
      method: 'POST', // Método POST para crear registro
      headers: { 'Content-Type': 'application/json' }, // Indica que el cuerpo se envía en formato JSON
      body: JSON.stringify({ titulo, categoria, icono, descripcion, lugar_sugerido, duracion_estimada, tips_romanticos, agendar_ahora, fecha, hora }) // Datos del plan
    }); // Fin de llamada a la API
    if (!res.ok) { // Si ocurrió un error en el servidor
      showToast(`⚠️ ${res.error}`); // Muestra el mensaje de error
      return; // Sale de la función
    } // Fin de chequeo de error
    await loadAllData(); // Recarga todos los planes y citas desde la base de datos
  } else { // Si está en modo local sin servidor
    const newPlanId = state.planes.reduce((max, p) => Math.max(max, p.id), 10) + 1; // Calcula el siguiente ID disponible mayor a 10
    state.planes.push({ id: newPlanId, titulo, categoria, icono, descripcion, lugar_sugerido, duracion_estimada, presupuesto: '$$ Especial', tips_romanticos }); // Agrega el plan en memoria
    if (agendar_ahora && fecha && hora) { // Si además pidió agendarlo con fecha y hora
      const newCitaId = state.citas.reduce((max, c) => Math.max(max, c.id), 0) + 1; // Calcula el nuevo ID de cita
      state.citas.unshift({ id: newCitaId, plan_id: newPlanId, titulo_cita: titulo, fecha, hora, lugar: lugar_sugerido, notas_previas: tips_romanticos, estado: 'Programada', calificacion: 5, bitacora_recuerdo: '', plan_titulo: titulo, plan_categoria: categoria, plan_icono: icono, fotos: [] }); // Inserta la cita al inicio
    } // Fin de creación de cita local
    saveLocalFallbackState(); // Guarda en localStorage
    updateHeaderStats(); // Actualiza el contador superior
    renderPlanes(); // Redibuja el menú de planes
    populatePlanSelect(); // Actualiza el desplegable de planes
    renderCitas(); // Redibuja el álbum de citas
  } // Fin de guardado según modo

  e.target.reset(); // Limpia todos los campos del formulario de plan propio
  setDefaultDateAndTime(); // Restaura la fecha de hoy y la hora por defecto en los selectores
  switchTab(agendar_ahora && fecha && hora ? 'tab-citas' : 'tab-planes'); // Lleva al álbum si se agendó, o al menú de planes
  showToast('💖 ¡Tu plan propio fue guardado correctamente!'); // Muestra confirmación
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube al inicio de la página
}); // Fin del submit de formPlanPropio

// ============================================================================
// 3. MODO PLAN DEL MENÚ VS PLAN LIBRE EN LA PESTAÑA DE AGENDAR
// ============================================================================
function setPlanMode(esLibre) { // Alterna entre seleccionar un plan existente o escribir uno libre al agendar
  state.esModoPlanLibre = esLibre; // Actualiza la bandera en el estado global
  document.getElementById('btnModeSugerido').classList.toggle('active', !esLibre); // Resalta el botón 'Elegir del Menú' si no es libre
  document.getElementById('btnModeLibre').classList.toggle('active', esLibre); // Resalta el botón 'Escribir un Plan' si es libre
  document.getElementById('bloquePlanSugerido').classList.toggle('hidden', esLibre); // Oculta el selector del menú si es libre
  document.getElementById('bloquePlanLibre').classList.toggle('hidden', !esLibre); // Muestra los campos de plan libre si está activo

  if (esLibre) { // Si cambió a modo libre
    document.getElementById('inputTituloCita').value = document.getElementById('inlineLibreTitulo').value.trim(); // Sincroniza el título con lo escrito
    document.getElementById('inputLugarCita').value = ''; // Limpia el lugar para que el usuario escriba el suyo
  } else { // Si volvió al modo de menú sugerido
    onPlanSelectChange(); // Restaura el título y lugar del plan seleccionado en el menú
  } // Fin del condicional
} // Fin de setPlanMode

document.getElementById('btnModeSugerido').addEventListener('click', () => setPlanMode(false)); // Botón para activar modo menú
document.getElementById('btnModeLibre').addEventListener('click', () => setPlanMode(true)); // Botón para activar modo libre
document.getElementById('inlineLibreTitulo').addEventListener('input', (e) => { // Cuando escribe el título del plan libre
  if (state.esModoPlanLibre) document.getElementById('inputTituloCita').value = e.target.value; // Copia automáticamente el nombre al título de la cita
}); // Fin de sincronización de título libre

// ============================================================================
// 4. LAS 10 CASILLAS MANUALES DE FOTOS EN EL FORMULARIO DE NUEVA CITA
// ============================================================================
function renderManualFiveSlotsNewCita() { // Dibuja las 10 casillas Polaroid en la pestaña de agendar nueva cita
  const container = document.getElementById('manualFiveSlotsNewCita'); // Busca la cuadrícula de las 10 casillas
  const counter = document.getElementById('newCitaPhotoCounter'); // Busca la etiqueta que cuenta cuántas fotos se han cargado
  if (!container) return; // Si no existe el contenedor, termina

  const count = Object.values(state.newCitaSlots).filter(Boolean).length; // Cuenta cuántas de las 10 casillas tienen foto cargada
  counter.textContent = `${count} / 10 fotos subidas ${count === 10 ? '✅' : ''}`; // Muestra el conteo actual (ej. '3 / 10 fotos subidas')

  let html = ''; // Inicializa el HTML de las 10 casillas
  for (let slot = 1; slot <= 10; slot++) { // Recorre del espacio #1 al espacio #10
    const item = state.newCitaSlots[slot]; // Obtiene la foto cargada en esta casilla (si existe)
    if (item) { // Si la casilla ya tiene una foto seleccionada
      html += `
        <div class="polaroid-card">
          <div class="polaroid-thumb-wrap" onclick="pickSingleSlotNewCita(${slot})" title="Haz clic para cambiar esta foto">
            <img src="${item.dataUrl}" alt="Foto #${slot}" />
            <span class="polaroid-slot-tag">Foto #${slot}/10</span>
            <button type="button" class="polaroid-delete-btn" onclick="event.stopPropagation(); clearSingleSlotNewCita(${slot})">✕</button>
          </div>
          <div style="margin-top:8px; display:flex; flex-direction:column; gap:6px;">
            <input type="text" value="${escapeHtml(item.pie_foto)}" placeholder="Nota para Foto #${slot}..." oninput="updateSlotCaptionNewCita(${slot}, this.value)" style="width:100%; padding:6px 8px; border-radius:6px; border:1px solid #fbcfe8; font-size:12px;" />
            <button type="button" class="btn btn-glass btn-sm" style="width:100%;" onclick="pickSingleSlotNewCita(${slot})">🔄 Cambiar Foto #${slot}</button>
          </div>
        </div>
      `; // Agrega la tarjeta Polaroid con miniatura, campo de nota y botón de cambiar
    } else { // Si la casilla está vacía
      html += `
        <div class="polaroid-empty-slot" onclick="pickSingleSlotNewCita(${slot})">
          <div class="empty-slot-icon">📷</div>
          <div class="empty-slot-title">Subir Foto #${slot}</div>
          <div class="empty-slot-hint">Haz clic para elegir de tu dispositivo</div>
        </div>
      `; // Agrega el recuadro vacío invitando a subir la foto de esa casilla
    } // Fin del condicional de casilla ocupada o vacía
  } // Fin del ciclo de 1 a 10
  container.innerHTML = html; // Inserta las 10 casillas en la página
} // Fin de renderManualFiveSlotsNewCita

window.pickSingleSlotNewCita = function (slotNumero) { // Abre el selector de archivos para una casilla específica (1..10)
  state.activeNewCitaSlotTarget = slotNumero; // Guarda qué número de casilla pulsó el usuario
  const input = document.getElementById('hiddenNewCitaSingleSlotInput'); // Busca el input file oculto
  input.value = ''; // Limpia el valor previo para permitir elegir el mismo archivo si desea
  input.click(); // Abre la ventana de selección de fotos del celular o PC
}; // Fin de pickSingleSlotNewCita

document.getElementById('hiddenNewCitaSingleSlotInput').addEventListener('change', async (e) => { // Procesa la foto individual elegida
  const file = e.target.files && e.target.files[0]; // Obtiene el archivo seleccionado
  if (!file) return; // Si canceló la ventana, no hace nada
  const slot = state.activeNewCitaSlotTarget || 1; // Identifica la casilla destino
  try { // Intenta optimizar y convertir la imagen a Base64
    const dataUrl = await fileToOptimizedDataUrl(file); // Comprime la foto para que cargue rápido
    state.newCitaSlots[slot] = { slot_numero: slot, nombre_archivo: file.name, dataUrl, pie_foto: `Recuerdo #${slot}` }; // Guarda la foto en la casilla
    renderManualFiveSlotsNewCita(); // Redibuja las 10 casillas mostrando la nueva foto
    showToast(`📷 Foto #${slot} de 10 cargada.`); // Muestra confirmación
  } catch (_) { // Si el archivo no era una imagen válida
    showToast('⚠️ No se pudo leer la imagen seleccionada.'); // Muestra mensaje de error
  } // Fin del bloque try-catch
}); // Fin del evento change para una casilla individual

window.clearSingleSlotNewCita = function (slotNumero) { // Quita la foto de una casilla antes de guardar la cita
  delete state.newCitaSlots[slotNumero]; // Elimina la foto de esa casilla en el estado temporal
  renderManualFiveSlotsNewCita(); // Redibuja las casillas
}; // Fin de clearSingleSlotNewCita

window.updateSlotCaptionNewCita = function (slotNumero, text) { // Actualiza el texto de nota de una foto mientras escribe
  if (state.newCitaSlots[slotNumero]) state.newCitaSlots[slotNumero].pie_foto = text; // Guarda el nuevo texto en la casilla
}; // Fin de updateSlotCaptionNewCita

document.getElementById('inputFotosMultiplesNueva').addEventListener('change', async (e) => { // Permite cargar varias fotos juntas en las casillas libres
  const files = Array.from(e.target.files || []); // Convierte la lista de archivos seleccionados en un arreglo
  if (!files.length) return; // Si no seleccionó archivos, termina
  let added = 0; // Contador de cuántas fotos se lograron ubicar en casillas libres
  for (const file of files) { // Recorre cada archivo seleccionado
    let targetSlot = null; // Variable para buscar la primera casilla vacía
    for (let s = 1; s <= 10; s++) { // Busca desde la casilla 1 hasta la 10
      if (!state.newCitaSlots[s]) { targetSlot = s; break; } // Si la casilla está vacía, la elige y detiene la búsqueda
    } // Fin de búsqueda de casilla vacía
    if (!targetSlot) break; // Si ya están ocupadas las 10 casillas, detiene el ciclo
    const dataUrl = await fileToOptimizedDataUrl(file); // Comprime y convierte la foto a Base64
    state.newCitaSlots[targetSlot] = { slot_numero: targetSlot, nombre_archivo: file.name, dataUrl, pie_foto: `Recuerdo #${targetSlot}` }; // Asigna la foto
    added++; // Incrementa el contador de fotos añadidas
  } // Fin del recorrido de archivos
  renderManualFiveSlotsNewCita(); // Redibuja la cuadrícula de 10 fotos
  showToast(added > 0 ? `📸 Se cargaron ${added} foto(s).` : 'ℹ️ Las 10 casillas ya están ocupadas.'); // Informa al usuario
}); // Fin de carga múltiple en nueva cita

// ============================================================================
// 5. RENDERIZAR CITAS AGENDADAS Y SU ÁLBUM DE 10 FOTOS
// ============================================================================
function renderCitas() { // Dibuja todas las citas agendadas en la pestaña 'Nuestro Álbum'
  const container = document.getElementById('citasList'); // Busca el contenedor donde van las tarjetas de citas
  const filtered = state.selectedCitaStatus === 'Todas' // Verifica si el filtro está en 'Todas'
    ? state.citas // Muestra todas las citas
    : state.citas.filter((c) => c.estado === state.selectedCitaStatus); // Filtra por 'Programada' o 'Completada'

  if (filtered.length === 0) { // Si aún no hay citas agendadas en este filtro
    container.innerHTML = `
      <div class="scheduler-card" style="text-align:center; padding: 48px 24px;">
        <div style="font-size:48px; margin-bottom:10px;">💌</div>
        <h3>Aún no hay planes agendados aquí</h3>
        <p style="color:var(--text-muted); margin: 8px 0 20px;">Escoge un plan, selecciona la fecha y la hora, y sube tus 10 fotos de recuerdo.</p>
        <button class="btn btn-primary" onclick="switchTab('tab-agendar')">📅 Escoger Fecha, Hora y Subir Fotos</button>
      </div>
    `; // Muestra tarjeta invitando a agendar el primer plan
    return; // Sale de la función
  } // Fin del caso sin citas

  container.innerHTML = filtered.map((cita) => { // Recorre cada cita para construir su tarjeta HTML y sus 10 espacios de fotos
    const fotosBySlot = {}; // Objeto para indexar las fotos de la cita según su número de casilla (1..10)
    (cita.fotos || []).forEach((f) => { fotosBySlot[f.slot_numero] = f; }); // Ubica cada foto en su casilla correspondiente
    const countFotos = (cita.fotos || []).length; // Cantidad de fotos subidas en esta cita
    const isComplete = countFotos >= 10; // Verifica si ya tiene las 10 fotos completas
    const hearts = '❤️'.repeat(cita.calificacion || 5); // Genera los corazones según la calificación

    let slotsHtml = ''; // Cadena para acumular las 10 casillas de fotos de esta cita
    for (let slot = 1; slot <= 10; slot++) { // Recorre las casillas del 1 al 10
      const foto = fotosBySlot[slot]; // Busca si hay foto en la casilla actual
      if (foto) { // Si existe foto en esta casilla
        slotsHtml += `
          <div class="polaroid-card">
            <div class="polaroid-thumb-wrap" onclick="openLightbox(${cita.id}, ${slot})">
              <img src="${foto.ruta_url}" alt="${escapeHtml(foto.pie_foto)}" loading="lazy" />
              <span class="polaroid-slot-tag">Foto #${slot}/10</span>
              <button type="button" class="polaroid-delete-btn" onclick="event.stopPropagation(); deleteSinglePhoto(${foto.id}, ${cita.id}, ${slot})">✕</button>
            </div>
            <div class="polaroid-caption" onclick="openLightbox(${cita.id}, ${slot})">
              ${escapeHtml(foto.pie_foto || `Recuerdo #${slot}`)}
            </div>
            <button type="button" class="btn btn-glass btn-sm" style="margin-top:6px; width:100%;" onclick="triggerUploadForCita(${cita.id}, ${slot})">
              🔄 Cambiar Foto #${slot}
            </button>
          </div>
        `; // Dibuja la foto estilo Polaroid con opción de ver en grande, cambiar o eliminar
      } else { // Si la casilla está vacía
        slotsHtml += `
          <div class="polaroid-empty-slot" onclick="triggerUploadForCita(${cita.id}, ${slot})">
            <div class="empty-slot-icon">📷</div>
            <div class="empty-slot-title">Subir Foto #${slot}</div>
            <div class="empty-slot-hint">Clic para elegir foto de tu dispositivo</div>
          </div>
        `; // Dibuja la casilla vacía para subir foto en ese espacio
      } // Fin del condicional de casilla
    } // Fin del ciclo de 10 casillas

    return `
      <article class="cita-card">
        <div class="cita-header">
          <div class="cita-title-group">
            <div class="cita-emoji">${cita.plan_icono || '💖'}</div>
            <div>
              <div class="cita-status-row">
                <span class="status-badge status-${cita.estado}">${cita.estado === 'Completada' ? '💖 Plan Vivido' : '⏳ Próximo Plan'}</span>
                <span class="badge-cat">${escapeHtml(cita.plan_categoria || 'Especial')}</span>
                <span>${hearts}</span>
              </div>
              <h3>${escapeHtml(cita.titulo_cita)}</h3>
              <div class="cita-datetime-pills">
                <span class="dt-pill">📅 <strong>Fecha:</strong> ${escapeHtml(formatFechaEs(cita.fecha))}</span>
                <span class="dt-pill">⏰ <strong>Hora:</strong> ${escapeHtml(formatHoraEs(cita.hora))}</span>
                <span class="dt-pill">📍 <strong>Lugar:</strong> ${escapeHtml(cita.lugar)}</span>
              </div>
            </div>
          </div>

          <div class="cita-actions">
            <button type="button" class="btn btn-glass btn-sm" onclick="openEditCitaModal(${cita.id})">✏️ Cambiar Fecha / Hora</button>
            <button type="button" class="btn btn-glass btn-sm" onclick="toggleEstadoCita(${cita.id}, '${cita.estado === 'Completada' ? 'Programada' : 'Completada'}')">
              ${cita.estado === 'Completada' ? '⏳ Marcar como Próximo' : '💖 Marcar como Vivido'}
            </button>
            <button type="button" class="btn btn-danger btn-sm" onclick="deleteCita(${cita.id})">🗑️ Quitar</button>
          </div>
        </div>

        <div class="cita-notes-row">
          <div class="note-box">
            <strong>📋 Notas y Detalles del Plan</strong>
            <p>${escapeHtml(cita.notas_previas || cita.plan_tips || 'Listos para disfrutar nuestro momento juntos.')}</p>
          </div>
          <div class="note-box">
            <strong>💌 Historia de Nuestro Recuerdo</strong>
            <p>${escapeHtml(cita.bitacora_recuerdo || 'Haz clic en "Cambiar Fecha / Hora" para escribir lo que más les gustó de este día.')}</p>
          </div>
        </div>

        <div class="album-section">
          <div class="album-header">
            <div class="album-title-wrap">
              <h4>
                📸 Tus 10 Fotos de Recordatorio del Plan
                <span class="album-progress-badge ${isComplete ? 'complete' : 'pending'}">
                  ${isComplete ? '✅ ¡Álbum Completo! (10/10 fotos)' : `📷 ${countFotos}/10 fotos subidas`}
                </span>
              </h4>
              <p>Haz clic en cualquier casilla (<strong>#1</strong> a <strong>#10</strong>) o sube varias fotos juntas.</p>
            </div>
            <div class="cita-actions">
              <button type="button" class="btn btn-primary btn-sm" onclick="triggerUploadForCita(${cita.id}, null)">
                📤 Seleccionar Fotos de mi Dispositivo (Hasta 10)
              </button>
            </div>
          </div>
          <div class="polaroid-slots-grid">${slotsHtml}</div>
        </div>
      </article>
    `; // Devuelve el HTML completo de la cita
  }).join(''); // Une todas las tarjetas de citas y las muestra en pantalla
} // Fin de renderCitas

// ============================================================================
// 6. SUBIR Y BORRAR FOTOS EN CITAS YA AGENDADAS
// ============================================================================
window.triggerUploadForCita = function (citaId, slotNumero = null) { // Abre el selector de archivos para subir fotos a una cita existente
  state.uploadTarget = { citaId, slotNumero }; // Guarda el ID de la cita y el número de casilla (o null si son varias)
  const input = document.getElementById('hiddenCitaPhotoInput'); // Busca el input file oculto para citas
  input.multiple = slotNumero === null; // Permite seleccionar múltiples fotos si no se pulsó una sola casilla fija
  input.value = ''; // Limpia la selección previa del input
  input.click(); // Abre el explorador de archivos del dispositivo
}; // Fin de triggerUploadForCita

document.getElementById('hiddenCitaPhotoInput').addEventListener('change', async (e) => { // Procesa las fotos elegidas para una cita
  const files = Array.from(e.target.files || []); // Obtiene el arreglo de archivos elegidos
  if (!files.length || !state.uploadTarget.citaId) return; // Si no hay archivos o cita destino, termina

  const { citaId, slotNumero } = state.uploadTarget; // Extrae el ID de la cita y el número de casilla
  const selectedFiles = files.slice(0, slotNumero ? 1 : 10); // Limita a 1 archivo si es casilla fija o hasta 10 si es subida múltiple
  showToast(`⏳ Subiendo ${selectedFiles.length} foto(s)...`); // Informa que se están procesando las imágenes

  try { // Inicia la compresión y subida de cada imagen
    const fotosPayload = []; // Arreglo con las fotos convertidas a Base64 listas para guardar
    for (const f of selectedFiles) { // Recorre cada archivo elegido
      const dataUrl = await fileToOptimizedDataUrl(f); // Comprime la foto y obtiene su cadena Base64
      fotosPayload.push({ // Agrega la foto al paquete de envío
        slot_numero: slotNumero || undefined, // Casilla fija o automática
        nombre_archivo: f.name, // Nombre original del archivo
        dataUrl, // Imagen en Base64
        pie_foto: f.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ') // Usa el nombre del archivo limpio como nota inicial
      }); // Fin de push
    } // Fin del ciclo de compresión

    if (!state.offlineMode) { // Si está conectado al servidor (MySQL o Node.js)
      const res = await apiRequest(`/api/citas/${citaId}/fotos`, { // Envía las fotos a la API
        method: 'POST', // Método POST
        headers: { 'Content-Type': 'application/json' }, // Cabecera JSON
        body: JSON.stringify({ fotos: fotosPayload }) // Cuerpo con el arreglo de fotos
      }); // Fin de petición
      if (!res.ok) { // Si hubo error (ej. ya están llenas las 10 casillas)
        showToast(`⚠️ ${res.error}`); // Muestra el aviso al usuario
        return; // Termina
      } // Fin de validación
      await loadAllData(); // Recarga las citas con las nuevas fotos desde la base de datos
      showToast('💖 Foto(s) guardada(s) en la base de datos.'); // Confirma el guardado exitoso
    } else { // Si está en modo local (localStorage)
      const cita = state.citas.find((c) => c.id === citaId); // Busca la cita en memoria
      if (!cita) return; // Si no existe, termina
      if (!cita.fotos) cita.fotos = []; // Asegura que exista el arreglo de fotos
      const usedSlots = new Set(cita.fotos.map((f) => f.slot_numero)); // Conjunto de casillas actualmente ocupadas
      for (const item of fotosPayload) { // Recorre cada foto nueva
        let targetSlot = item.slot_numero; // Verifica si tiene casilla fija
        if (!targetSlot) { // Si no tiene casilla fija, busca la primera libre del 1 al 10
          for (let s = 1; s <= 10; s++) { // Ciclo del 1 al 10
            if (!usedSlots.has(s)) { targetSlot = s; break; } // Asigna la primera libre encontrada
          } // Fin del ciclo for
        } // Fin de búsqueda
        if (!targetSlot) break; // Si no hay casillas libres, detiene la carga
        cita.fotos = cita.fotos.filter((f) => f.slot_numero !== targetSlot); // Si había una foto previa en esa casilla, la reemplaza
        cita.fotos.push({ id: Date.now() + targetSlot, cita_id: citaId, slot_numero: targetSlot, ruta_url: item.dataUrl, pie_foto: item.pie_foto }); // Guarda la nueva foto
        usedSlots.add(targetSlot); // Marca la casilla como ocupada
      } // Fin del recorrido de fotos
      cita.fotos.sort((a, b) => a.slot_numero - b.slot_numero); // Ordena las fotos de la casilla 1 a la 10
      saveLocalFallbackState(); // Guarda en localStorage
      renderCitas(); // Redibuja el álbum
      showToast('💖 Foto(s) subida(s) correctamente.'); // Muestra confirmación
    } // Fin de subida según modo
  } catch (_) { // Si ocurre un error al procesar la imagen
    showToast('⚠️ No se pudieron procesar las fotos seleccionadas.'); // Muestra mensaje de error
  } // Fin de try-catch
}); // Fin de subida de fotos en cita existente

window.deleteSinglePhoto = async function (fotoId, citaId, slotNumero) { // Elimina una foto individual de una cita
  if (!state.offlineMode) { // Si está conectado al servidor
    const res = await apiRequest(`/api/fotos/${fotoId}`, { method: 'DELETE' }); // Envía petición DELETE con el ID de la foto
    if (res.ok) { // Si se borró en la base de datos
      await loadAllData(); // Recarga los datos actualizados
      showToast(`🗑️ Foto #${slotNumero} eliminada.`); // Informa al usuario
    } // Fin de validación
  } else { // Si está en modo local
    const cita = state.citas.find((c) => c.id === citaId); // Busca la cita en memoria
    if (cita && cita.fotos) { // Si existe la cita y tiene fotos
      cita.fotos = cita.fotos.filter((f) => f.slot_numero !== slotNumero); // Quita la foto de esa casilla
      saveLocalFallbackState(); // Guarda los cambios en localStorage
      renderCitas(); // Redibuja la tarjeta de la cita
      showToast(`🗑️ Foto #${slotNumero} eliminada.`); // Informa al usuario
    } // Fin de borrado local
  } // Fin de borrado según modo
}; // Fin de deleteSinglePhoto

// ============================================================================
// 7. VISOR LIGHTBOX POLAROID Y EDICIÓN DE DEDICATORIA DE FOTO
// ============================================================================
window.openLightbox = function (citaId, slotNumero) { // Abre el visor en pantalla grande al pulsar una foto
  const cita = state.citas.find((c) => c.id === citaId); // Busca la cita a la que pertenece la foto
  if (!cita || !cita.fotos || !cita.fotos.length) return; // Si no tiene fotos, termina
  const idx = cita.fotos.findIndex((f) => f.slot_numero === slotNumero); // Busca el índice de la foto pulsada
  state.lightbox = { citaId, photoIndex: idx >= 0 ? idx : 0 }; // Guarda qué cita y qué índice de foto mostrar
  renderLightboxContent(); // Carga la imagen y sus textos en el modal Lightbox
  document.getElementById('modalLightbox').classList.remove('hidden'); // Muestra el modal Lightbox
}; // Fin de openLightbox

function renderLightboxContent() { // Actualiza la imagen y la dedicatoria dentro del modal Lightbox
  const cita = state.citas.find((c) => c.id === state.lightbox.citaId); // Busca la cita activa en el Lightbox
  if (!cita || !cita.fotos || !cita.fotos.length) return; // Si no hay fotos, sale
  const foto = cita.fotos[state.lightbox.photoIndex]; // Obtiene el objeto de la foto actual
  document.getElementById('lightboxImg').src = foto.ruta_url; // Muestra la fotografía en grande
  document.getElementById('lightboxSlotBadge').textContent = `Recuerdo #${foto.slot_numero} de 10`; // Muestra el número de recuerdo
  document.getElementById('lightboxCitaTitle').textContent = `${cita.titulo_cita} • ${cita.fecha} ${cita.hora}`; // Muestra el título y fecha de la cita
  document.getElementById('lightboxCaptionInput').value = foto.pie_foto || ''; // Coloca la dedicatoria actual en el campo de texto
} // Fin de renderLightboxContent

document.getElementById('btnPrevPhoto').addEventListener('click', () => { // Botón para ir a la foto anterior en el Lightbox
  const cita = state.citas.find((c) => c.id === state.lightbox.citaId); // Busca la cita actual
  if (!cita || !cita.fotos.length) return; // Si no hay fotos, termina
  state.lightbox.photoIndex = (state.lightbox.photoIndex - 1 + cita.fotos.length) % cita.fotos.length; // Retrocede circularmente
  renderLightboxContent(); // Actualiza la foto mostrada
}); // Fin de botón foto anterior

document.getElementById('btnNextPhoto').addEventListener('click', () => { // Botón para ir a la foto siguiente en el Lightbox
  const cita = state.citas.find((c) => c.id === state.lightbox.citaId); // Busca la cita actual
  if (!cita || !cita.fotos.length) return; // Si no hay fotos, termina
  state.lightbox.photoIndex = (state.lightbox.photoIndex + 1) % cita.fotos.length; // Avanza circularmente
  renderLightboxContent(); // Actualiza la foto mostrada
}); // Fin de botón foto siguiente

document.getElementById('btnSaveCaption').addEventListener('click', async () => { // Guarda la dedicatoria escrita en el Lightbox
  const cita = state.citas.find((c) => c.id === state.lightbox.citaId); // Busca la cita actual
  if (!cita) return; // Si no existe, termina
  const foto = cita.fotos[state.lightbox.photoIndex]; // Obtiene la foto que se está visualizando
  const nuevoPie = document.getElementById('lightboxCaptionInput').value.trim(); // Lee el nuevo texto de dedicatoria
  if (!state.offlineMode) { // Si está conectado al servidor
    const res = await apiRequest(`/api/fotos/${foto.id}`, { // Envía la actualización a la API
      method: 'PUT', // Método PUT para editar
      headers: { 'Content-Type': 'application/json' }, // Cabecera JSON
      body: JSON.stringify({ pie_foto: nuevoPie }) // Envía el nuevo pie de foto
    }); // Fin de petición
    if (res.ok) await loadAllData(); // Recarga los datos desde el servidor
  } else { // Si está en modo local
    foto.pie_foto = nuevoPie; // Actualiza el pie de foto en memoria
    saveLocalFallbackState(); // Guarda en localStorage
    renderCitas(); // Redibuja las tarjetas de citas
  } // Fin de guardado según modo
  showToast('💖 Dedicatoria guardada en la foto.'); // Muestra confirmación
}); // Fin de guardar dedicatoria

// ============================================================================
// 8. GUARDAR NUEVA CITA CON FECHA, HORA Y SUS FOTOS
// ============================================================================
function setDefaultDateAndTime() { // Inicializa los campos de fecha con el día de hoy y la hora en 19:30
  const now = new Date(); // Obtiene la fecha actual del sistema
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; // Formato YYYY-MM-DD
  document.getElementById('inputFechaCita').value = todayStr; // Asigna la fecha de hoy al formulario de agendar
  document.getElementById('inputHoraCita').value = '19:30'; // Asigna las 19:30 por defecto al formulario de agendar
  document.getElementById('customPlanFecha').value = todayStr; // Asigna la fecha de hoy al formulario de plan propio
  document.getElementById('customPlanHora').value = '19:30'; // Asigna las 19:30 al formulario de plan propio
} // Fin de setDefaultDateAndTime

document.querySelectorAll('[data-date-preset]').forEach((btn) => { // Configura los botones rápidos de fecha (Hoy, Mañana, Viernes, Sábado)
  btn.addEventListener('click', () => { // Al hacer clic en un botón rápido de fecha
    const preset = btn.dataset.datePreset; // Lee qué opción rápida eligió
    const d = new Date(); // Parte de la fecha de hoy
    if (preset === 'tomorrow') d.setDate(d.getDate() + 1); // Suma 1 día si eligió 'Mañana'
    else if (preset === 'friday') d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); // Calcula el próximo viernes
    else if (preset === 'saturday') d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); // Calcula el próximo sábado
    document.getElementById('inputFechaCita').value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; // Pone la fecha calculada en el input
  }); // Fin del evento click
}); // Fin de botones rápidos de fecha

document.querySelectorAll('[data-time-preset]').forEach((btn) => { // Configura los botones rápidos de hora (11:00, 16:00, 17:30, 19:30, 21:00)
  btn.addEventListener('click', () => { // Al pulsar un horario sugerido
    document.getElementById('inputHoraCita').value = btn.dataset.timePreset; // Coloca esa hora en el selector de tiempo
  }); // Fin del evento click
}); // Fin de botones rápidos de hora

document.getElementById('formNuevaCita').addEventListener('submit', async (e) => { // Procesa el guardado de una nueva cita agendada
  e.preventDefault(); // Evita que el navegador recargue la página
  const titulo_cita = document.getElementById('inputTituloCita').value.trim(); // Lee el nombre de la cita
  const lugar = document.getElementById('inputLugarCita').value.trim(); // Lee el lugar de encuentro
  const fecha = document.getElementById('inputFechaCita').value; // Lee la fecha elegida
  const hora = document.getElementById('inputHoraCita').value; // Lee la hora elegida
  const estado = document.getElementById('selectEstadoCita').value; // Lee el estado ('Programada' o 'Completada')
  const calificacion = Number(document.getElementById('selectCalificacionCita').value); // Lee la calificación de 1 a 5
  const notas_previas = document.getElementById('inputNotasCita').value.trim(); // Lee las notas o dedicatoria previa

  let plan_libre_datos = null; // Inicializa los datos de plan libre como nulos
  if (state.esModoPlanLibre) { // Si el usuario escribió un plan libre nuevo
    const libreTitulo = document.getElementById('inlineLibreTitulo').value.trim() || titulo_cita; // Obtiene el título del plan libre
    if (!libreTitulo) { // Si no escribió nombre para el plan libre
      showToast('⚠️ Escribe el nombre de tu plan personalizado.'); // Muestra advertencia
      return; // Detiene el envío
    } // Fin de validación
    plan_libre_datos = { // Construye el objeto con los datos del nuevo plan libre
      titulo: libreTitulo, // Nombre del plan
      categoria: document.getElementById('inlineLibreCategoria').value, // Categoría seleccionada
      descripcion: document.getElementById('inlineLibreDescripcion').value.trim() || notas_previas || 'Plan especial creado por nosotros.' // Descripción
    }; // Fin de plan_libre_datos
  } // Fin de modo plan libre

  const fotos = Object.values(state.newCitaSlots).filter(Boolean); // Obtiene todas las fotos que el usuario haya cargado en las casillas 1..10
  const payload = { // Construye el paquete de datos para enviar al servidor
    plan_id: state.esModoPlanLibre ? null : Number(document.getElementById('selectPlanId').value), // ID del plan del menú (o null si es libre)
    es_plan_libre: state.esModoPlanLibre, // Indica si debe crearse un plan libre
    plan_libre_datos, // Datos del plan libre
    titulo_cita, // Título de la cita
    lugar, // Lugar de la cita
    fecha, // Fecha YYYY-MM-DD
    hora, // Hora HH:MM
    estado, // Estado inicial
    calificacion, // Calificación en corazones
    notas_previas, // Notas del plan
    fotos // Arreglo de fotos en Base64
  }; // Fin del objeto payload

  if (!state.offlineMode) { // Si está conectado al servidor (MySQL o Node.js)
    const res = await apiRequest('/api/citas', { // Envía la nueva cita a la API
      method: 'POST', // Método POST
      headers: { 'Content-Type': 'application/json' }, // Cabecera JSON
      body: JSON.stringify(payload) // Cuerpo en formato JSON
    }); // Fin de petición
    if (!res.ok) { // Si el servidor reportó un error
      showToast(`⚠️ ${res.error}`); // Muestra el error en pantalla
      return; // Detiene el proceso
    } // Fin de validación
    await loadAllData(); // Recarga los planes y citas desde la base de datos
  } else { // Si está funcionando en modo local (localStorage)
    let targetPlan = state.planes.find((p) => p.id === payload.plan_id); // Busca el plan seleccionado en memoria
    if (state.esModoPlanLibre && plan_libre_datos) { // Si es un plan libre nuevo en modo local
      const newPlanId = state.planes.reduce((max, p) => Math.max(max, p.id), 10) + 1; // Genera un nuevo ID de plan
      targetPlan = { id: newPlanId, titulo: plan_libre_datos.titulo, categoria: plan_libre_datos.categoria, descripcion: plan_libre_datos.descripcion, icono: '💑', duracion_estimada: 'Libre', presupuesto: '$$ Especial', lugar_sugerido: lugar, tips_romanticos: notas_previas || 'Guardar nuestras fotos.' }; // Crea el plan
      state.planes.push(targetPlan); // Lo agrega a la lista de planes
    } // Fin de creación de plan libre local
    const newCitaId = state.citas.reduce((max, c) => Math.max(max, c.id), 0) + 1; // Genera un nuevo ID para la cita
    state.citas.unshift({ // Agrega la nueva cita al principio de la lista
      id: newCitaId, // ID único de la cita
      plan_id: targetPlan ? targetPlan.id : 1, // ID del plan vinculado
      titulo_cita: titulo_cita || (targetPlan ? targetPlan.titulo : 'Nuestro Plan'), // Título de la cita
      fecha, hora, lugar, notas_previas, estado, calificacion, bitacora_recuerdo: '', // Datos de fecha, hora y lugar
      plan_titulo: targetPlan ? targetPlan.titulo : titulo_cita, // Nombre del plan
      plan_categoria: targetPlan ? targetPlan.categoria : 'Romántico', // Categoría del plan
      plan_icono: targetPlan ? targetPlan.icono : '💖', // Emoji del plan
      fotos: fotos.map((f) => ({ id: Date.now() + f.slot_numero, cita_id: newCitaId, slot_numero: f.slot_numero, ruta_url: f.dataUrl, pie_foto: f.pie_foto })) // Fotos adjuntas
    }); // Fin de inserción de cita local
    saveLocalFallbackState(); // Guarda en localStorage
    updateHeaderStats(); // Actualiza el contador superior
    renderPlanes(); // Redibuja los planes
    populatePlanSelect(); // Actualiza el selector desplegable
    renderCitas(); // Redibuja el álbum de citas
  } // Fin de guardado según modo

  state.newCitaSlots = {}; // Vacía las 10 casillas temporales de fotos del formulario
  renderManualFiveSlotsNewCita(); // Redibuja las 10 casillas limpias
  document.getElementById('inputNotasCita').value = ''; // Limpia el campo de notas
  document.getElementById('inlineLibreTitulo').value = ''; // Limpia el título libre
  document.getElementById('inlineLibreDescripcion').value = ''; // Limpia la descripción libre
  switchTab('tab-citas'); // Cambia automáticamente a la pestaña 'Nuestro Álbum'
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube al inicio de la página
  showToast('💖 ¡Plan agendado con éxito!'); // Muestra notificación de éxito
}); // Fin del submit de formNuevaCita

// ============================================================================
// 9. EDITAR Y ELIMINAR CITAS EXISTENTES
// ============================================================================
window.openEditCitaModal = function (citaId) { // Abre la ventana modal para editar fecha, hora, lugar o historia de una cita
  const cita = state.citas.find((c) => c.id === citaId); // Busca la cita por su ID en el estado
  if (!cita) return; // Si no existe, termina
  document.getElementById('editCitaId').value = cita.id; // Coloca el ID de la cita en el input oculto
  document.getElementById('editTituloCita').value = cita.titulo_cita; // Coloca el título actual
  document.getElementById('editFechaCita').value = cita.fecha; // Coloca la fecha actual
  document.getElementById('editHoraCita').value = cita.hora; // Coloca la hora actual
  document.getElementById('editLugarCita').value = cita.lugar; // Coloca el lugar actual
  document.getElementById('editEstadoCita').value = cita.estado; // Selecciona el estado actual
  document.getElementById('editNotasCita').value = cita.notas_previas || ''; // Coloca las notas previas
  document.getElementById('editBitacoraCita').value = cita.bitacora_recuerdo || ''; // Coloca la historia del recuerdo
  document.getElementById('modalEditarCita').classList.remove('hidden'); // Muestra la ventana modal en pantalla
}; // Fin de openEditCitaModal

document.getElementById('formEditarCita').addEventListener('submit', async (e) => { // Guarda los cambios hechos en el modal de editar cita
  e.preventDefault(); // Evita recargar la página
  const citaId = Number(document.getElementById('editCitaId').value); // Obtiene el ID de la cita que se está editando
  const payload = { // Recolecta los campos modificados
    titulo_cita: document.getElementById('editTituloCita').value.trim(), // Nuevo título
    fecha: document.getElementById('editFechaCita').value, // Nueva fecha
    hora: document.getElementById('editHoraCita').value, // Nueva hora
    lugar: document.getElementById('editLugarCita').value.trim(), // Nuevo lugar
    estado: document.getElementById('editEstadoCita').value, // Nuevo estado
    notas_previas: document.getElementById('editNotasCita').value.trim(), // Nuevas notas
    bitacora_recuerdo: document.getElementById('editBitacoraCita').value.trim() // Nueva historia del recuerdo
  }; // Fin del objeto payload

  if (!state.offlineMode) { // Si está conectado al servidor
    const res = await apiRequest(`/api/citas/${citaId}`, { // Envía la actualización por PUT a la API
      method: 'PUT', // Método PUT
      headers: { 'Content-Type': 'application/json' }, // Cabecera JSON
      body: JSON.stringify(payload) // Datos modificados en JSON
    }); // Fin de petición
    if (res.ok) await loadAllData(); // Recarga las citas actualizadas desde la base de datos
  } else { // Si está en modo local
    const cita = state.citas.find((c) => c.id === citaId); // Busca la cita en memoria
    if (cita) Object.assign(cita, payload); // Sobrescribe las propiedades actualizadas
    saveLocalFallbackState(); // Guarda en localStorage
    renderCitas(); // Redibuja las tarjetas de citas
  } // Fin de actualización según modo

  document.getElementById('modalEditarCita').classList.add('hidden'); // Cierra el modal de edición
  showToast('💖 Fecha, hora y recuerdos actualizados.'); // Muestra confirmación
}); // Fin del submit de formEditarCita

window.toggleEstadoCita = async function (citaId, nuevoEstado) { // Cambia rápidamente una cita entre 'Programada' y 'Completada'
  if (!state.offlineMode) { // Si está conectado al servidor
    const res = await apiRequest(`/api/citas/${citaId}`, { // Envía el nuevo estado a la API
      method: 'PUT', // Método PUT
      headers: { 'Content-Type': 'application/json' }, // Cabecera JSON
      body: JSON.stringify({ estado: nuevoEstado }) // Envía únicamente el campo estado
    }); // Fin de petición
    if (res.ok) await loadAllData(); // Recarga los datos desde el servidor
  } else { // Si está en modo local
    const cita = state.citas.find((c) => c.id === citaId); // Busca la cita en memoria
    if (cita) cita.estado = nuevoEstado; // Cambia su estado
    saveLocalFallbackState(); // Guarda en localStorage
    renderCitas(); // Redibuja la lista de citas
  } // Fin de cambio según modo
  showToast(nuevoEstado === 'Completada' ? '💖 ¡Marcado como Plan Vivido!' : '⏳ Marcado como Próximo Plan.'); // Muestra aviso
}; // Fin de toggleEstadoCita

window.deleteCita = async function (citaId) { // Elimina por completo una cita agendada y sus fotos
  if (!state.offlineMode) { // Si está conectado al servidor
    const res = await apiRequest(`/api/citas/${citaId}`, { method: 'DELETE' }); // Solicita eliminar la cita en la BD
    if (res.ok) await loadAllData(); // Recarga la lista de citas desde la base de datos
  } else { // Si está en modo local
    state.citas = state.citas.filter((c) => c.id !== citaId); // Filtra y quita la cita del arreglo en memoria
    saveLocalFallbackState(); // Guarda en localStorage
    updateHeaderStats(); // Actualiza el contador superior
    renderCitas(); // Redibuja la lista de citas
  } // Fin de eliminación según modo
  showToast('🗑️ Plan retirado de la agenda.'); // Informa al usuario
}; // Fin de deleteCita

// ============================================================================
// 10. INICIALIZACIÓN Y EVENTOS GENERALES AL CARGAR LA PÁGINA
// ============================================================================
document.addEventListener('DOMContentLoaded', () => { // Se ejecuta cuando el documento HTML ha terminado de cargar
  setDefaultDateAndTime(); // Pone la fecha actual y hora por defecto en los formularios
  loadAllData(); // Conecta con api.php / servidor o carga localStorage y dibuja toda la interfaz

  document.querySelectorAll('.tab-btn').forEach((btn) => { // Recorre los 4 botones de navegación principal
    btn.addEventListener('click', () => switchTab(btn.dataset.tab)); // Cambia de pestaña al hacer clic
  }); // Fin de eventos de pestañas

  document.getElementById('btnOpenCustomPlan').addEventListener('click', () => switchTab('tab-crear-plan')); // Botón para ir a escribir un plan propio

  document.getElementById('btnToggleMenuDropdown').addEventListener('click', () => { // Botón para abrir/cerrar la lista de planes en pantallas móviles
    document.querySelector('.plans-menu-box').classList.toggle('collapsed'); // Alterna la clase CSS 'collapsed'
  }); // Fin del evento del desplegable móvil

  document.getElementById('btnRandomPlan').addEventListener('click', () => { // Botón '¡Sorpréndeme al Azar!'
    if (!state.planes.length) return; // Si no hay planes, termina
    state.selectedCategory = 'Todos'; // Restablece el filtro de categoría a 'Todos'
    document.querySelectorAll('#categoryFilters .chip').forEach((c) => c.classList.toggle('active', c.dataset.cat === 'Todos')); // Activa el chip 'Todos'
    const randomPlan = state.planes[Math.floor(Math.random() * state.planes.length)]; // Elige un plan aleatorio de la lista
    state.activeMenuPlanId = randomPlan.id; // Lo marca como plan activo
    renderPlanes(); // Muestra el plan elegido en la tarjeta principal
    showToast(`🎲 ¡Plan al Azar!: "${randomPlan.icono} ${randomPlan.titulo}"`); // Muestra qué plan salió sorteado
  }); // Fin del botón de plan al azar

  document.getElementById('selectPlanId').addEventListener('change', onPlanSelectChange); // Actualiza vista previa cuando cambia el select de planes

  document.querySelectorAll('#categoryFilters .chip').forEach((chip) => { // Recorre los botones de filtro por categoría de planes
    chip.addEventListener('click', () => { // Al hacer clic en una categoría
      document.querySelectorAll('#categoryFilters .chip').forEach((c) => c.classList.remove('active')); // Desmarca las demás categorías
      chip.classList.add('active'); // Marca como activa la categoría pulsada
      state.selectedCategory = chip.dataset.cat; // Guarda la categoría seleccionada en el estado
      renderPlanes(); // Redibuja el menú mostrando solo esa categoría
    }); // Fin del click en categoría
  }); // Fin de filtros de categoría

  document.querySelectorAll('#citaStatusFilters .chip').forEach((chip) => { // Recorre los botones de filtro del álbum (Todos, Próximos, Vividos)
    chip.addEventListener('click', () => { // Al hacer clic en un filtro de estado
      document.querySelectorAll('#citaStatusFilters .chip').forEach((c) => c.classList.remove('active')); // Quita la clase activa de los otros chips
      chip.classList.add('active'); // Activa el chip pulsado
      state.selectedCitaStatus = chip.dataset.status; // Actualiza el estado filtrado
      renderCitas(); // Redibuja las citas según el filtro elegido
    }); // Fin del click en filtro de citas
  }); // Fin de filtros del álbum

  document.querySelectorAll('[data-close]').forEach((btn) => { // Recorre todos los botones de cerrar ventana modal (✕ y Cancelar)
    btn.addEventListener('click', () => { // Al hacer clic en cerrar
      document.getElementById(btn.dataset.close).classList.add('hidden'); // Oculta el modal correspondiente
    }); // Fin del evento cerrar modal
  }); // Fin de configuración de cierre de modales
}); // Fin de DOMContentLoaded
