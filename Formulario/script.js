/**
 * ============================================================================
 * LÓGICA DE VALIDACIÓN Y ALMACENAMIENTO DEL FORMULARIO (Formulario/script.js)
 * ============================================================================
 * Propósito: Validar campos obligatorios, cambiar dinámicamente el color del
 * botón según el género seleccionado (azul para hombre, rosado para mujer),
 * habilitar el campo "Otro cargo", almacenar cada registro en una lista de
 * objetos JSON y renderizar la colección en tiempo real.
 */

const nombre = document.querySelector("#nombre");
const apellido = document.querySelector("#apellido");
const aspiracion = document.querySelector("#aspiracion");
const correo = document.querySelector("#correo");
const hombre = document.querySelector("#hombre");
const mujer = document.querySelector("#mujer");
const cargo = document.querySelector("#cargo");

const alertDOMCorrect = document.querySelector("#alertCorrect");
const alertDOMIncorrect = document.querySelector("#alertIncorrect");

const btn_submit = document.querySelector("#submit");
const otro = document.querySelector("#otro");
const listaRegistros = document.querySelector("#listaRegistros");
const totalCandidatesBadge = document.querySelector("#totalCandidatesBadge");
const jsonOutput = document.querySelector("#jsonOutput");
const toggleJsonBtn = document.querySelector("#toggleJsonBtn");

// Lista donde se almacenan todos los aspirantes registrados (con 2 candidatos iniciales de ejemplo)
const listaAspirantes = [
    {
        nombre: "Camila",
        apellido: "Restrepo",
        aspiracion: 6200000,
        email: "camila.restrepo@tech.co",
        genero: "Femenino",
        cargo: "Gerente de Proyecto"
    },
    {
        nombre: "Andrés",
        apellido: "Villamizar",
        aspiracion: 5400000,
        email: "andres.dev@software.co",
        genero: "Masculino",
        cargo: "Desarrollador"
    }
];
let objeto = {};

function blue() {
    if (hombre.checked) {
        btn_submit.classList.remove("d-none", "btn-pink", "btn-danger");
        btn_submit.classList.add("btn-primary", "btn");
    }
}

function pink() {
    if (mujer.checked) {
        btn_submit.classList.remove("d-none", "btn-primary");
        btn_submit.classList.add("btn-pink", "btn");
    }
}

cargo.addEventListener("change", () => {
    if (cargo.value === "otros") {
        otro.classList.remove("d-none");
    } else {
        otro.classList.add("d-none");
        otro.value = "";
    }
});

function renderLista() {
    if (totalCandidatesBadge) {
        totalCandidatesBadge.textContent = `${listaAspirantes.length} Aspirantes`;
    }
    if (jsonOutput) {
        jsonOutput.textContent = JSON.stringify(listaAspirantes, null, 2);
    }
    if (!listaRegistros) return;

    listaRegistros.innerHTML = listaAspirantes
        .map(
            (item) => `
            <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                <div>
                    <div class="fw-bold text-dark">${item.nombre} ${item.apellido} <span class="badge bg-primary-subtle text-primary ms-1">${item.cargo}</span></div>
                    <div class="small text-muted">${item.email} • ${item.genero}</div>
                </div>
                <span class="fw-bold text-success">$${Number(item.aspiracion).toLocaleString("es-CO")}</span>
            </li>
        `
        )
        .join("");
}

if (toggleJsonBtn && jsonOutput) {
    toggleJsonBtn.addEventListener("click", () => {
        jsonOutput.classList.toggle("d-none");
    });
}

btn_submit.addEventListener("click", (e) => {
    e.preventDefault();

    const cargoSeleccionado = cargo.value === "otros" ? otro.value.trim() : cargo.value;

    if (
        nombre.value.trim() !== "" &&
        apellido.value.trim() !== "" &&
        aspiracion.value.trim() !== "" &&
        correo.value.trim() !== "" &&
        (hombre.checked || mujer.checked) &&
        cargoSeleccionado !== ""
    ) {
        objeto = {
            nombre: nombre.value.trim(),
            apellido: apellido.value.trim(),
            aspiracion: Number(aspiracion.value),
            email: correo.value.trim(),
            genero: hombre.checked ? "Masculino" : "Femenino",
            cargo: cargoSeleccionado
        };

        listaAspirantes.unshift(objeto);
        alertDOMCorrect.classList.remove("d-none");
        alertDOMIncorrect.classList.add("d-none");
        renderLista();

        document.querySelector("#registroForm").reset();
        otro.classList.add("d-none");
        btn_submit.classList.add("d-none");
    } else {
        alertDOMCorrect.classList.add("d-none");
        alertDOMIncorrect.classList.remove("d-none");
    }
});

renderLista();
