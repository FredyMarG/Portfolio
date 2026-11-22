/**
 * ============================================================================
 * MODELO MONGOOSE: DESTINO TURÍSTICO (Proyecto_Bit/TurismoBack/models/Destino.js)
 * ============================================================================
 * Propósito: Definir el esquema de datos NoSQL en MongoDB para los destinos
 * turísticos gestionados por la API REST (`/api/destinos`).
 */

const mongoose = require('mongoose');

const DestinoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del destino es obligatorio'],
        trim: true
    },
    ciudad: {
        type: String,
        required: [true, 'La ciudad o región es obligatoria'],
        trim: true
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    imagenUrl: {
        type: String,
        default: ''
    },
    disponible: {
        type: Boolean,
        default: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Destino', DestinoSchema);
