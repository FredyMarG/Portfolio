/**
 * ============================================================================
 * LÓGICA DE CINESEARCH — BUSCADOR DE PELÍCULAS CON OMDb API, DEBOUNCE Y RESPALDO
 * ============================================================================
 */

const API_KEY = '2ed0427b';
const buscadorInput = document.getElementById('buscador');
const gridPeliculas = document.getElementById('grid-peliculas');
const modal = document.getElementById('modal-detalle');
const modalContenido = document.getElementById('modal-contenido');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');

let debounceTimer;

// Generador de póster SVG personalizado con título y color temático
function crearPosterSvg(titulo, anio, color1, color2, icono) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}"/>
          <stop offset="100%" stop-color="${color2}"/>
        </linearGradient>
      </defs>
      <rect width="300" height="450" fill="url(#g)"/>
      <rect x="14" y="14" width="272" height="422" rx="14" fill="rgba(7,10,19,0.55)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <text x="150" y="165" text-anchor="middle" font-size="68">${icono}</text>
      <text x="150" y="245" text-anchor="middle" fill="#f8fafc" font-family="Segoe UI, sans-serif" font-size="20" font-weight="800">${titulo}</text>
      <text x="150" y="280" text-anchor="middle" fill="#38bdf8" font-family="Segoe UI, sans-serif" font-size="15" font-weight="700">ESTRENO • ${anio}</text>
      <text x="150" y="395" text-anchor="middle" fill="#94a3b8" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600">CINESEARCH HD COLLECTION</text>
    </svg>`
  );
}

const POSTER_FALLBACK = crearPosterSvg('CineSearch', 'HD', '#0f172a', '#1e293b', '🎬');

// Catálogo local de respaldo (garantiza funcionamiento inmediato incluso si OMDb limita la API key o no hay red)
const CATALOGO_LOCAL = [
  {
    imdbID: 'tt0468569',
    Title: 'The Dark Knight (Batman)',
    Year: '2008',
    Genre: 'Acción, Crimen, Drama',
    Director: 'Christopher Nolan',
    imdbRating: '9.0',
    Plot: 'Cuando la amenaza conocida como el Joker emerge de su misterioso pasado, causa estragos y caos en la gente de Gotham, obligando a Batman a enfrentar una de las mayores pruebas psicológicas y físicas de su capacidad para luchar contra la injusticia.',
    Poster: crearPosterSvg('The Dark Knight', '2008', '#0f172a', '#1d4ed8', '🦇')
  },
  {
    imdbID: 'tt1877830',
    Title: 'The Batman',
    Year: '2022',
    Genre: 'Acción, Crimen, Misterio',
    Director: 'Matt Reeves',
    imdbRating: '7.8',
    Plot: 'Cuando un asesino en serie sádico comienza a asesinar a figuras políticas clave en Gotham, Batman se ve obligado a investigar la corrupción oculta de la ciudad y cuestionar la participación de su propia familia.',
    Poster: crearPosterSvg('The Batman', '2022', '#111827', '#991b1b', '🦇')
  },
  {
    imdbID: 'tt0372784',
    Title: 'Batman Begins',
    Year: '2005',
    Genre: 'Acción, Aventura',
    Director: 'Christopher Nolan',
    imdbRating: '8.2',
    Plot: 'Después de entrenar con su mentor en la Liga de las Sombras, Bruce Wayne regresa a Gotham City para comenzar su cruzada contra el crimen y liberar a la ciudad del miedo.',
    Poster: crearPosterSvg('Batman Begins', '2005', '#1e1b4b', '#312e81', '🦇')
  },
  {
    imdbID: 'tt4154796',
    Title: 'Avengers: Endgame',
    Year: '2019',
    Genre: 'Acción, Aventura, Sci-Fi',
    Director: 'Anthony & Joe Russo',
    imdbRating: '8.4',
    Plot: 'Después de los devastadores eventos de Infinity War, el universo está en ruinas. Con la ayuda de los aliados restantes, los Vengadores se reúnen una vez más para revertir las acciones de Thanos y restaurar el equilibrio.',
    Poster: crearPosterSvg('Avengers: Endgame', '2019', '#1e1b4b', '#7e22ce', '🦸')
  },
  {
    imdbID: 'tt4154756',
    Title: 'Avengers: Infinity War',
    Year: '2018',
    Genre: 'Acción, Aventura, Sci-Fi',
    Director: 'Anthony & Joe Russo',
    imdbRating: '8.4',
    Plot: 'Los Vengadores y sus aliados deben estar dispuestos a sacrificarlo todo en un intento por derrotar al poderoso Thanos antes de que su ataque de devastación ponga fin a la mitad del universo.',
    Poster: crearPosterSvg('Infinity War', '2018', '#31102f', '#9d174d', '💎')
  },
  {
    imdbID: 'tt0133093',
    Title: 'The Matrix',
    Year: '1999',
    Genre: 'Acción, Sci-Fi',
    Director: 'Lana & Lilly Wachowski',
    imdbRating: '8.7',
    Plot: 'Cuando una misteriosa desconocida lleva al hacker informático Neo a un inframundo prohibido, descubre la impactante verdad: la vida que conoce es el elaborado engaño de una ciberinteligencia.',
    Poster: crearPosterSvg('The Matrix', '1999', '#052e16', '#15803d', '🕶️')
  },
  {
    imdbID: 'tt0816692',
    Title: 'Interstellar',
    Year: '2014',
    Genre: 'Aventura, Drama, Sci-Fi',
    Director: 'Christopher Nolan',
    imdbRating: '8.7',
    Plot: 'Cuando la Tierra se vuelve inhabitable en el futuro, un granjero y ex piloto de la NASA, Joseph Cooper, es encargado de pilotar una nave espacial junto a un equipo de investigadores para encontrar un nuevo planeta para la humanidad.',
    Poster: crearPosterSvg('Interstellar', '2014', '#0c4a6e', '#0369a1', '🌌')
  },
  {
    imdbID: 'tt0076759',
    Title: 'Star Wars: A New Hope',
    Year: '1977',
    Genre: 'Acción, Aventura, Fantasía',
    Director: 'George Lucas',
    imdbRating: '8.6',
    Plot: 'Luke Skywalker une fuerzas con un caballero Jedi, un piloto engreído, un Wookiee y dos droides para salvar a la galaxia de la estación de batalla destructora de mundos del Imperio.',
    Poster: crearPosterSvg('Star Wars IV', '1977', '#0f172a', '#b45309', '⚔️')
  }
];

// Búsqueda en vivo con técnica Debounce (500ms)
buscadorInput.addEventListener('input', (evento) => {
  clearTimeout(debounceTimer);
  const busqueda = evento.target.value.trim();

  if (busqueda.length === 0) {
    renderizarPeliculas(CATALOGO_LOCAL);
    return;
  }
  if (busqueda.length < 2) return;

  debounceTimer = setTimeout(() => {
    buscarPeliculas(busqueda);
  }, 500);
});

async function buscarPeliculas(consulta) {
  gridPeliculas.innerHTML = '<p class="mensaje">Buscando películas...</p>';
  const qLower = consulta.toLowerCase();
  const coincidenciasLocales = CATALOGO_LOCAL.filter(
    (p) => p.Title.toLowerCase().includes(qLower) || p.Genre.toLowerCase().includes(qLower)
  );

  try {
    const respuesta = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(consulta)}&apikey=${API_KEY}`);
    const datos = await respuesta.json();

    if (datos && datos.Response === 'True' && Array.isArray(datos.Search)) {
      renderizarPeliculas(datos.Search);
      return;
    }
  } catch (_) {
    // Si falla la conexión o la API, usamos el catálogo local
  }

  if (coincidenciasLocales.length > 0) {
    renderizarPeliculas(coincidenciasLocales);
  } else {
    renderizarPeliculas(CATALOGO_LOCAL);
  }
}

function renderizarPeliculas(peliculas) {
  gridPeliculas.innerHTML = '';

  peliculas.forEach((pelicula) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'card-pelicula';

    const urlPoster = pelicula.Poster && pelicula.Poster !== 'N/A' ? pelicula.Poster : POSTER_FALLBACK;

    tarjeta.innerHTML = `
      <img src="${urlPoster}" alt="${pelicula.Title}" onerror="this.onerror=null;this.src='${POSTER_FALLBACK}';">
      <div class="info">
        <h3>${pelicula.Title}</h3>
        <p>${pelicula.Year}</p>
        <button type="button" onclick="verDetalles('${pelicula.imdbID}')">Ver Detalle</button>
      </div>
    `;
    gridPeliculas.appendChild(tarjeta);
  });
}

async function verDetalles(imdbID) {
  let pelicula = CATALOGO_LOCAL.find((p) => p.imdbID === imdbID) || null;

  try {
    const respuesta = await fetch(`https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${API_KEY}`);
    const datos = await respuesta.json();
    if (datos && datos.Response === 'True') {
      pelicula = datos;
    }
  } catch (_) {
    // Usar datos locales de respaldo si falla la red
  }

  if (!pelicula) return;

  modalContenido.innerHTML = `
    <h2>${pelicula.Title} (${pelicula.Year})</h2>
    <p><strong>Género:</strong> ${pelicula.Genre || 'Cine / Entretenimiento'}</p>
    <p><strong>Director:</strong> ${pelicula.Director || 'N/A'}</p>
    <p><strong>Sinopsis:</strong> ${pelicula.Plot || 'Ficha cinematográfica disponible en CineSearch.'}</p>
    <p><strong>Calificación IMDb:</strong> ⭐ ${pelicula.imdbRating || '8.5'}</p>
  `;
  modal.showModal();
}

btnCerrarModal.addEventListener('click', () => modal.close());

document.querySelectorAll('.tag-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const q = btn.dataset.query;
    buscadorInput.value = q;
    buscarPeliculas(q);
  });
});

// Mostrar el catálogo inicial inmediatamente al abrir la aplicación
renderizarPeliculas(CATALOGO_LOCAL);
