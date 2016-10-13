/**
 * PresentismoController
 *
 * @description :: Server-side logic for managing presentismoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var meses = ['','enero','febrero','marzo','abril','mayo','junio',
						 'julio','agosto','setiembre','octubre','noviembre','diciembre'];

module.exports = {

	index: function (req, res) {

		var sessionid;
		if (sails.config.environment === "development") {
			sessionid = '9728448076454730240';
		} else {
			sessionid = req.cookies.SESION;
		}
		wsPortal.getSession(sessionid, function(err,session) {
			if (sails.config.environment === "development") {
				err = undefined;
				session = {Sesionesid:1,Userid:'u19724241',Dependid:1068,Lugarid:1068};
			}
			if (err) {
				return res.forbidden(err);
				//err.status = 403;
				//return res.negotiate(err);
			}

			var mes = parseInt(req.param('mes'));
			var anio = 2016;

			var d = new Date();
			var now = d.getTime();
			var mesActual = d.getMonth()+1;

			var sprintf = require("sprintf");

			var infoMeses = {meses:Array(), mes:{}};
			for (var m=3;m<12;m++) {
				infoMeses.meses[m] = {
					nombre: meses[m],
					inhabilitado: (m >= mesActual || m<6),
					fecha: new Date(anio+"-"+(m+1)+(m==9 ? "-15" : "-09")+" GMT-0300")
				};
				infoMeses.meses[m].estado = (now > infoMeses.meses[m].fecha.getTime() ? "Vencido" : "Vencimiento");
			}
			infoMeses.fecha_toString = function(d) {return sprintf("%02d/%02d/%04d", d.getDate(),d.getMonth()+1,d.getFullYear())};

			Presentismo.find({anio:anio, DependId:session.Dependid}).exec(function(err, presentismo) {
				if (err) {
					return res.serverError(err);
				}
				presentismo.forEach (function(info){
					infoMeses.meses[info.mes].fecha = info.updatedAt;
					infoMeses.meses[info.mes].estado = "Presentado";
				});

				var cerrar = parseInt(req.param('cerrar'));
				if (cerrar) {
					Presentismo.create({anio:anio, mes:cerrar, DependId:session.Dependid, userid:session.Userid}).exec(function(err,data) {
						var mensaje;

						if (err) {
							sails.log("error="+err);
							mensaje = "No se pudo cerrar el mes por un error al acceder a la base de datos";
							return res.view({infoMeses:infoMeses, DependId:session.Dependid, presentismo:presentismo,  mensaje:mensaje, certificados:undefined});
						} else {
							sails.log("data="+data);
							sails.log("Cierre de mes="+cerrar+" dependid="+session.Dependid);
							return res.redirect(sails.config.environment==='development' ? '' : '/node/presentismo');
						}
					});
					return;
				}

				if (!mes) {
					return res.view({infoMeses:infoMeses, DependId:session.Dependid, presentismo:presentismo, certificados:undefined});
				}

				infoMeses.mes.id = mes;
				infoMeses.mes.nombre = meses[mes];

				// obtengo todas las inasistencias de la dependencia:
				Inasistencias.get({DependId:session.Dependid,Anio:anio,Mes:mes}, function(err, inasistencias) {
					if (err) {
						return res.serverError(err);
					}

					// transformo las inasistencias en un array
					var arrInasistencias = Array();
					inasistencias.forEach(function(info) {
						if (!arrInasistencias[info.perdocid]) {
							arrInasistencias[info.perdocid] = Array();
						}
						if (typeof arrInasistencias[info.perdocid][info.InasisLicTipo]==='undefined') {
							arrInasistencias[info.perdocid][info.InasisLicTipo] = 0;
						}
						arrInasistencias[info.perdocid][info.InasisLicTipo] += info.inasistencias;
					});

					// obtengo los certificados que faltan en la dependencia
					Certificados.get({DependId:session.Dependid,Anio:anio,Mes:mes}, function(err, certificados) {
						if (err) {
							return res.serverError(err);
						}

						// obtengo las personas de la dependencia:
						Personal.find({Anio:anio,Mes:mes,DependId:session.Dependid}).sort('PerNombreCompleto ASC').exec(function(err, personalLiceo) {
							if (err) {
								return res.serverError(err);
							}

							return res.view({arrInasistencias:arrInasistencias, personalLiceo:personalLiceo, infoMeses:infoMeses, DependId:session.Dependid, presentismo:presentismo, certificados:certificados});
						});
					});
				});
			});
		});
	},

	pendientes: function (req, res) {

		var sessionid;
		if (sails.config.environment === "development") {
			sessionid = '9728448076454730240';
		} else {
			sessionid = req.cookies.SESION;
		}
		wsPortal.getSession(sessionid, function(err,session) {
			if (sails.config.environment === "development") {
				err = undefined;
				session = {Sesionesid:1,Userid:'u34551411',Dependid:2710,Lugarid:2710};
			}
			if (err) {
				return res.forbidden(err);
				//err.status = 403;
				//return res.negotiate(err);
			}

			var meses = ['','enero','febrero','marzo','abril','mayo','junio',
						 'julio','agosto','setiembre','octubre','noviembre','diciembre'];
			var mes = parseInt(req.param('mes'));
			var anio = 2016;

			var sprintf = require("sprintf");

			Portal.getDependsWithMenu({Userid:session.Userid, Menuid:'MP_INASISTENCIAS_LICENCIAS_LICEOS'}, function(err,depends) {
				if (err) {
					return res.serverError(err);
				}

				var infoMeses = {meses:Array()};
				for (var m=3;m<12;m++) {
					infoMeses.meses[m] = { nombre: meses[m], depend:Array() };
				}
				infoMeses.fecha_toString = function(d) {return sprintf("%02d/%02d/%04d", d.getDate(),d.getMonth()+1,d.getFullYear())};

				var arrDepends = depends.map(function(i){ return i.dependid });
				Presentismo.find({DependId:arrDepends, anio:anio}).exec(function(err, presentismo) {
					if (err) {
						return res.serverError(err);
					}

					presentismo.forEach (function(info){
						infoMeses.meses[info.mes].depend[info.DependId] = info.updatedAt;
					});

					res.view({depends:depends, infoMeses:infoMeses})
				});
			});
		});
	},

};
