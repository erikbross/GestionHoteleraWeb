const express = require('express');

let Habitacion = require(__dirname + '/../models/habitacion.js');
let Limpieza = require(__dirname + '/../models/limpieza.js');
let autenticacion = require(__dirname + '/../utils/auth.js');

let router = express.Router();

router.get("/nueva/:id", autenticacion.autenticacion, (req, res) => {
    Habitacion.findById(req.params.id).then((resultado) => {
        let fechaActual = new Date();
        let dia = fechaActual.getDate().toString().padStart(2, '0');
        let mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
        let anyo = fechaActual.getFullYear().toString().padStart(4, '0');
        let fechaDatos = [anyo, mes, dia].join('-');
        if (resultado) {
            res.render('limpiezas_nueva', { habitacion: resultado, fechaActual: fechaDatos });
        }
        else {
            res.render('error', { error: "La habitación no existe" });
        }
    }).catch((error) => {
        if(error.errors.fecha){
            res.render('error', { error: error.errors.fecha.message });
        }
    })
});

// Obtener limpiezas de una habitación
router.get("/:id", (req, res) => {
    let numHabitacion;
    let idHabitacion = req.params.id;
    Habitacion.findById(req.params.id).then((resultado) => {
        if (resultado) {
            numHabitacion = resultado.numero;
        }
    })
    Limpieza.find({ idHabitacion: req.params.id }).sort({ fechaHora: -1 }).then((resultado) => {
        res.render('limpiezas_listado', { limpiezas: resultado, numHabitacion: numHabitacion, idHabitacion: idHabitacion });
    }).catch(() => {
        res.render('error', { error: "No hay limpiezas registradas para esta habitación" });
    });
});

router.post("/:id", (req, res) => {
    if (req.body.observaciones) {
        let nuevaLimpieza = new Limpieza({
            idHabitacion: req.params.id,
            fechaHora: req.body.fecha,
            observaciones: req.body.observaciones
        });

        nuevaLimpieza.save().then(() => {
            Limpieza.find({ idHabitacion: req.params.id }).sort({ fechaHora: -1 }).then((resultado) => {
                Habitacion.findByIdAndUpdate(req.params.id, {
                    $set: {
                        ultimaLimpieza: resultado[0].fechaHora
                    }
                }, { new: true }).then(() => {
                    res.redirect('/limpiezas/' + req.params.id);
                }).catch((error) => {
                    res.render('error', { error: "Error actualizando la fecha de la ultima limpieza" });
                })
            });
        }).catch((error) => {
            if(error.errors.fecha){
                res.render('error', { error: error.errors.fecha.message });
            }
        });
    } else {
        let nuevaLimpieza = new Limpieza({
            idHabitacion: req.params.id,
            fechaHora: req.body.fecha
        });

        nuevaLimpieza.save().then(() => {
            res.redirect('/limpiezas/' + req.params.id);
        }).catch((error) => {
            if(error.errors.fecha){
                res.render('error', { error: error.errors.fecha.message });
            }
        });
    }
});

module.exports = router;