var express = require('express');

// var SEED  =require('../config/config').SEED;

var autentificar = require ('../middlewares/autentificacion');

var app = express();
var Hospital = require('../models/hospital');


// ===================================================
// Obtener todos los usuarios
// ===================================================
app.get('/',  (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
        .exec( 
            (err, hospitales) => {

            if ( err ) {
                return  res.status( 500 ).json({
                        ok: false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                }); 
            }

            Hospital.count({},(err, conteo)=>{
                res.status( 200 ).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });

     
 
        });

});


// ===================================================
// Actualizar hospital
// ===================================================
app.put('/:id',autentificar.verificaToken,  (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, ( err, hospital ) =>{

        if ( err ) {
            return  res.status( 500 ).json({
                    ok: false,
                    mensaje: 'Error al buscar hospitales',
                    errors: err
            }); 
        }

        if( !hospital ) {

            if ( err ) {
                return  res.status( 400 ).json({
                        ok: false,
                        mensaje: 'El hospital con el id' + id + 'no existe',
                        errors: { message: 'No existe un hospital con ese id' }
                }); 
            }
        }


        hospital.nombre = body.nombre;
        hospital.email = req.usuario._id;
    

        hospital.save((err, hospitalGuardado) =>{

            if ( err ) {
                return  res.status( 400 ).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                }); 
            }


            res.status( 200 ).json({
                ok: true,
                hospital: hospitalGuardado,
                
            });

        });
 
    });

});


// ===================================================
// Crea un nuevo hospital
// ===================================================
app.post('/', autentificar.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
       usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) => {

        if ( err ) {
            return  res.status( 400 ).json({
                    ok: false,
                    mensaje: 'Error al crear hospital',
                    errors: err
            }); 
        }

        res.status( 201 ).json({
            ok: true,
            hospital: hospitalGuardado        
        });

    });

});


// ===================================================
// Borrar hospital por ID
// ===================================================
app.delete('/:id',autentificar.verificaToken,  (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) =>{

        if ( err ) {
            return  res.status( 500 ).json({
                    ok: false,
                    mensaje: 'Error al borrar hospital',
                    errors: err
            }); 
        }

        if ( !hospitalBorrado ) {
            return  res.status( 400 ).json({
                    ok: false,
                    mensaje: 'El hospital con ese id no existe',
                    errors: { message: 'El hospital con ese id ya no existe' }
            }); 
        }

        res.status( 200 ).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});


module.exports = app;