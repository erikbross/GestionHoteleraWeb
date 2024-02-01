const mongoose = require('mongoose');

let incidenciasSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        required: [true, 'La descripción de la incidencia es obligatoria']
    },
    fechaInicio: {
        type: Date,
        required: [true, 'La fecha de inicio de la incidencia es obligatoria'],
        default: Date.now
    },
    fechaFin: {
        type: Date
    },
    imagen: {
        type: String
    }
});

let habitacionSchema = new mongoose.Schema({
    numero: {
        type: Number,
        required: [true, 'El numero de la habitación es obligatorio'],
        min: [1, 'El numero de la habitación debe ser mayor que 0'],
        max: [100, 'El numero de la habitación debe ser menor que 100']
    },
    tipo: {
        type: String,
        enum: ['individual', 'doble', 'familiar', 'suite']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción de la habitación es obligatoria']
    },
    ultimaLimpieza: {
        type: Date,
        required: [true, 'La fecha de la última limpieza es obligatoria'],
        default: Date.now
    },
    precio: {
        type: Number,
        required: [true, 'El precio de la habitación es obligatorio'],
        min: [0, 'El precio de la habitación debe ser mayor que 0'],
        max: [250, 'El precio de la habitación debe ser menor que 250']
    },
    imagen: {
        type: String,
    },
    incidencias: [incidenciasSchema]
});

let Habitacion = mongoose.model('habitaciones', habitacionSchema);
module.exports = Habitacion;