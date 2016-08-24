'use strict'


module.exports = {
	getSession: function(sesionId, callback) {
		// recibe string con el número de sesión
		// llama a callback con parámetros err y {Sesionesid,Userid,Dependid,Lugarid}

		if (! sesionId.match(/^ *([a-zA-Z\d]+) *$/)) {
			return callback(new Error("Sesión no válida. Reinicie su conexión con el portal de servicios"),undefined);
		}

		var soap = require('soap');
		soap.createClient('api/services/aws_dame_datos_de_sesion.wsdl', function(err, client) {
			if (err) {
				return callback(err,undefined);
			}
			client.Execute({Sesionesid:sesionId}, function(err, result) {

				if (!result.Userid) {
					return callback(new Error("Sesión no válida. Reinicie su conexión con el portal de servicios"),undefined);
				}
				Portal.leoPermiso({Sesionesid:sesionId,Programa:'presentismo',Modo:'DSP'}, function(err, permiso) {
					if (err) {
						return callback(err, undefined);
					}
					if (permiso.Autorizado !== "S") {
						return callback(new Error("No tiene los privilegios requeridos para acceder a esta página"), undefined);
					}
					return callback(undefined,result);
				});
			});
		});
	
	},

	leoPermiso: function(args, callback) {
		// recibe objeto con: Sesionesid, Programa, Modo
		// llama callback con parámetros err y {Autorizado,Path}

		var soap = require('soap');
		soap.createClient('api/services/aws_autorizar_usuario_objeto.wsdl', function(err, client) {
			if (err) {
				return callback(err,undefined);
			}
			client.Execute(args, function(err, result) {
				if (err) {
					return callback(err,undefined);
				}
				return callback(undefined, result);
			});
		});
	},
};
