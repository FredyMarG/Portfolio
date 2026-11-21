/**
 * ============================================================================
 * CONTROLADOR RICK AND MORTY API (rickandmorty_api/script.js)
 * ============================================================================
 * Consumo asíncrono (`async/await`) de la API oficial de Rick and Morty con
 * soporte de búsqueda por nombre, filtro por estado vital, paginación y
 * respaldo local automático en caso de desconexión.
 */

const container = document.getElementById("charactersContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const metaInfo = document.getElementById("metaInfo");
const statusPills = document.querySelectorAll(".status-pill");

let currentPage = 1;
let currentName = "";
let currentStatus = "";

const FALLBACK_CHARACTERS = [
    { name: "Rick Sanchez", status: "Alive", species: "Human", origin: { name: "Earth (C-137)" }, location: { name: "Citadel of Ricks" }, image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg" },
    { name: "Morty Smith", status: "Alive", species: "Human", origin: { name: "unknown" }, location: { name: "Citadel of Ricks" }, image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg" },
    { name: "Summer Smith", status: "Alive", species: "Human", origin: { name: "Earth (Replacement Dimension)" }, location: { name: "Earth (Replacement Dimension)" }, image: "https://rickandmortyapi.com/api/character/avatar/3.jpeg" },
    { name: "Beth Smith", status: "Alive", species: "Human", origin: { name: "Earth (Replacement Dimension)" }, location: { name: "Earth (Replacement Dimension)" }, image: "https://rickandmortyapi.com/api/character/avatar/4.jpeg" },
    { name: "Jerry Smith", status: "Alive", species: "Human", origin: { name: "Earth (Replacement Dimension)" }, location: { name: "Earth (Replacement Dimension)" }, image: "https://rickandmortyapi.com/api/character/avatar/5.jpeg" },
    { name: "Abadango Cluster Princess", status: "Alive", species: "Alien", origin: { name: "Abadango" }, location: { name: "Abadango" }, image: "https://rickandmortyapi.com/api/character/avatar/6.jpeg" }
];

async function loadCharacters() {
    try {
        container.innerHTML = `<div class="col-12 text-center text-secondary py-5 fs-5">Cargando personajes del multiverso...</div>`;
        const params = new URLSearchParams({ page: String(currentPage) });
        if (currentName) params.set("name", currentName);
        if (currentStatus) params.set("status", currentStatus);

        const response = await fetch(`https://rickandmortyapi.com/api/character/?${params.toString()}`);
        if (!response.ok) {
            throw new Error("No se encontraron personajes con ese criterio de búsqueda.");
        }

        const data = await response.json();
        metaInfo.textContent = `Mostrando página ${currentPage} de ${data.info.pages} (${data.info.count} personajes encontrados)`;
        prevBtn.disabled = !data.info.prev;
        nextBtn.disabled = !data.info.next;
        renderCharacters(data.results.slice(0, 12));
    } catch (error) {
        if (!navigator.onLine) {
            metaInfo.textContent = "Modo Offline activo — Mostrando personajes locales";
            renderCharacters(FALLBACK_CHARACTERS);
            return;
        }
        metaInfo.textContent = "0 resultados";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning bg-dark text-warning border-warning text-center my-4">
                    ${error.message}
                </div>
            </div>
        `;
    }
}

function renderCharacters(characters) {
    container.innerHTML = characters
        .map((char) => {
            const badgeClass =
                char.status === "Alive" ? "bg-success" : char.status === "Dead" ? "bg-danger" : "bg-secondary";
            return `
            <div class="col-sm-6 col-md-4 col-lg-3">
                <article class="rm-card h-100 d-flex flex-column">
                    <img src="${char.image}" class="w-100" style="height: 220px; object-fit: cover;" alt="${char.name}">
                    <div class="p-3 d-flex flex-column flex-grow-1">
                        <h5 class="fw-bold text-white mb-1">${char.name}</h5>
                        <div class="mb-2">
                            <span class="badge ${badgeClass}">${char.status}</span>
                            <span class="text-info small ms-1 fw-semibold">${char.species}</span>
                        </div>
                        <div class="text-secondary small mt-auto">
                            <div><strong class="text-light">Origen:</strong> ${char.origin.name}</div>
                            <div><strong class="text-light">Ubicación:</strong> ${char.location.name}</div>
                        </div>
                    </div>
                </article>
            </div>
            `;
        })
        .join("");
}

searchBtn.addEventListener("click", () => {
    currentName = searchInput.value.trim();
    currentPage = 1;
    loadCharacters();
});

searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        currentName = searchInput.value.trim();
        currentPage = 1;
        loadCharacters();
    }
});

statusPills.forEach((pill) => {
    pill.addEventListener("click", () => {
        statusPills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        currentStatus = pill.getAttribute("data-status");
        currentPage = 1;
        loadCharacters();
    });
});

prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadCharacters();
    }
});

nextBtn.addEventListener("click", () => {
    currentPage++;
    loadCharacters();
});

loadCharacters();
