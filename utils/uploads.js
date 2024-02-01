const multer = require('multer');

let storageHabitacion = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/habitaciones')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
});

let uploadHabitacion = multer({storage: storageHabitacion});

let storageIncidencia = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/incidencias')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

let uploadIncidencia = multer({storage: storageIncidencia});

module.exports = {
    uploadHabitacion: uploadHabitacion,
    uploadIncidencia: uploadIncidencia
};