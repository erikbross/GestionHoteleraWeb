const express = require('express');
const Usuario = require('../models/usuario');
let router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/habitaciones');
});

router.post('/login', (req, res) => {
    Usuario.findOne({ login: req.body.login, password: req.body.password }).then((usuario) => {
        if (usuario) {
            req.session.usuario = usuario.login;
            res.redirect('/habitaciones');
        }
        else {
            res.render('login', { error: "Usuario o contraseña incorrectos" });
        }
    }).catch(() => {
        res.render('login', { error: "Error en el servidor" });
    })
});

module.exports = router;