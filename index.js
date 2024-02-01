const mongoose = require('mongoose');
const express = require('express');
const nunjucks = require('nunjucks');
const methodOverride = require('method-override');
const session = require('express-session');

const habitacion = require(__dirname + "/routes/habitacion");
const limpieza = require(__dirname + "/routes/limpieza");
const auth = require(__dirname + "/routes/auth");

mongoose.connect('mongodb://127.0.0.1:27017/hotel');

const app = express();

app.use(session({
    secret: '1234',
    resave: true,
    saveUninitialized: false,
    expires: new Date(Date.now() + 3600000)
}));
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.set('view engine', 'njk');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    } 
}));
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/habitaciones', habitacion);
app.use('/limpiezas', limpieza);
app.use('/auth', auth);

app.get('/', (req, res) => {
    res.redirect('/habitaciones');
})

app.listen(8080);