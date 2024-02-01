const express = require('express');

const upload = require(__dirname + '/../utils/uploads.js');
let Habitacion = require(__dirname + '/../models/habitacion.js');
let Limpieza = require(__dirname + '/../models/limpieza.js');
let autenticacion = require(__dirname + '/../utils/auth.js');

let router = express.Router();


// Obtener un listado de todas las habitaciones - Funciona
router.get('/', (req, res) => {
    Habitacion.find().then((resultado) => {
        res.render('habitaciones_listado', { habitaciones: resultado });
    }).catch(() => {
        res.render('error', { error: "No hay habitaciones registradas en la aplicación" });
    });
});

// Formulario de añadir habitación - Funciona
router.get('/nueva', autenticacion.autenticacion, (req, res) => {
    res.render('habitaciones_nueva');
});

router.get('/editarVista/:id', autenticacion.autenticacion, (req, res) => {
    Habitacion.findById(req.params.id).then((resultado) => {
        if (resultado) {
            res.render('habitaciones_edicion', { habitacion: resultado });
        }
        else {
            res.render('error', { error: "No hay habitaciones registradas en la aplicación" });
        }
    }).catch(() => {
        res.render('error', { error: "Error en el servidor" });
    })
});

// Actualizar los datos de una habitación - Funciona
router.post('/editar/:id', autenticacion.autenticacion,upload.uploadHabitacion.single('imagen'), (req, res) => {
    if(req.file){
        req.body.imagen = req.file.filename;
    }
    Habitacion.findByIdAndUpdate(req.params.id, {
        $set: {
            numero: req.body.numero,
            tipo: req.body.tipo,
            descripcion: req.body.descripcion,
            ultimaLimpieza: req.body.ultimaLimpieza,
            precio: req.body.precio,
            imagen: req.body.imagen
        }
    }, { new: true }).then((resultado) => {
        if (resultado) {
            res.redirect('/habitaciones/' + req.params.id);
        }
        else {
            res.render('error', { error: "No hay habitaciones registradas en la aplicación" });
        }
    }).catch(() => {
        let errores = {
            general: 'Error insertando la habitación'
        }
        if(error.errors.numero){
            errores.numero = error.errors.numero.message;
        }
        if(error.errors.tipo){
            errores.tipo = error.errors.tipo.message;
        }
        if(error.errors.precio){
            errores.precio = error.errors.precio.message;
        }
        if(error.errors.descripcion){
            errores.descripcion = error.errors.descripcion.message;
        }

        res.render('habitaciones_edicion',{ errores: errores, datos: req.body });
    });
});

// Obtener detalles de una habitación específica - Funciona
router.get('/:id', (req, res) => {
    Habitacion.findById(req.params.id).then((resultado) => {
        if (resultado) {
            res.render('habitaciones_ficha', { habitacion: resultado });
        }
        else {
            res.render('error', { error: "No hay habitaciones registradas en la aplicación" });
        }
    }).catch(() => {
        res.render('error', { error: "Error en el servidor" });
    });
});

// Insertar una habitación - Funciona
router.post('/', upload.uploadHabitacion.single('imagen'), (req, res) => {
    let nuevaHabitacion = new Habitacion({
        numero: req.body.numero,
        tipo: req.body.tipo,
        descripcion: req.body.descripcion,
        ultimaLimpieza: req.body.ultimaLimpieza,
        precio: req.body.precio,
    });

    if (req.file) {
        nuevaHabitacion.imagen = req.file.filename;
    }

    nuevaHabitacion.save().then((resultado) => {
        res.redirect('/habitaciones');
    }).catch((error) => {
        let errores = {
            general: 'Error insertando la habitación'
        }
        if(error.errors.numero){
            errores.numero = error.errors.numero.message;
        }
        if(error.errors.tipo){
            errores.tipo = error.errors.tipo.message;
        }
        if(error.errors.precio){
            errores.precio = error.errors.precio.message;
        }
        if(error.errors.descripcion){
            errores.descripcion = error.errors.descripcion.message;
        }

        res.render('habitaciones_nueva',{ errores: errores, datos: req.body });
    });
});

// Actualizar TODAS las últimas limpiezas
router.put('/ultimaLimpieza', async (req, res) => {
    try {
        const limpiezas = await Limpieza.find().sort({ fechaHora: -1 });

        const idsSinDuplicados = [...new Set(limpiezas.map(r => r.idHabitacion.toString()))];

        for (const idHabitacion of idsSinDuplicados) {
            const ultimaLimpieza = await Limpieza.findOne({ idHabitacion }).sort({ fechaHora: -1 }).limit(1);

            await Habitacion.findByIdAndUpdate(idHabitacion, {
                $set: {
                    ultimaLimpieza: ultimaLimpieza.fechaHora
                }
            }, { new: true });
        }
        const resultado = await Habitacion.find();
        res.status(200).send({ resultado: resultado });
    } catch (e) {
        res.status(400).send({ error: "Error actualizando limpieza" });
    }
});

// Eliminar una habitación - Funciona
router.delete("/:id", autenticacion.autenticacion, (req, res) => {
    Habitacion.findByIdAndRemove(req.params.id).then((resultado) => {
        if(resultado){
            Limpieza.deleteMany({ idHabitacion: req.params.id }).then(() => {
                res.redirect('/habitaciones');
            })
        }
        else{
            res.render('error', { error: "Error eliminando la habitación" });
        }
    }).catch(() => {
        res.render('error', { error: "Error eliminando la habitación" });
    });
});

// Añadir una incidencia en una habtiación - Funciona
router.post("/:id/incidencias", autenticacion.autenticacion, upload.uploadIncidencia.single('imagen'), (req, res) => {
    let nuevaIncidencia = {
        descripcion: req.body.descripcion
    }

    if(req.file){
        nuevaIncidencia.imagen = req.file.filename;
    }

    Habitacion.findById(req.params.id).then((resultado) => {
        if (resultado) {
            resultado.incidencias.push(nuevaIncidencia);

            resultado.save().then((resultado) => {
                res.redirect('/habitaciones/' + req.params.id);
            }).catch(() => {
                res.render('error', { error: "Error anadiendo la incidencia" });
            });
        }
        else {
            res.render('error', { error: "Error anadiendo la incidencia" });
        }
    }).catch(() => {
        res.render('error', { error: "No existe el número de habitación" });
    });
});

// Actualizar el estado de una incidencia de una habitación - Funciona
router.put("/:idH/incidencias/:idI", autenticacion.autenticacion, (req, res) => {
    Habitacion.findById(req.params.idH).then((resultado) => {
        if (resultado) {
            resultado.incidencias.forEach(result => {
                if (result.id == req.params.idI) {
                    result.fechaFin = new Date();
                    resultado.save().then(() => {
                        res.redirect('/habitaciones/' + req.params.idH);
                    }).catch(() => {
                        res.render('error', { error: "Error actualizando la incidencia" });
                    });
                }
            });
        }
        else {
            res.render('error', { error: "Error actualizando la incidencia" });
        }
    }).catch(() => {
        res.render('error', { error: "No existe el número de habitación" });
    });
});

module.exports = router;