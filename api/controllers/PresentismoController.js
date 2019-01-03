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

		var title = 'Consulta de cierre de presentismo';

		var sessionid;
		if (sails.config.environment === "development") {
			sessionid = '9728448076454730240';
		} else {
			sessionid = req.cookies.SESION;
		}
		wsPortal.getSession(sessionid, function(err,session) {
			if (sails.config.environment === "development") {
				err = undefined;
				session = {Sesionesid:1,Userid:'u19724241',Dependid:1072,Lugarid:1072};
			}
			if (err) {
				return res.forbidden(err);
				//err.status = 403;
				//return res.negotiate(err);
			}

			var mes = parseInt(req.param('mes'));

			var d = new Date();
			var now = d.getTime();
			var diaActual = d.getDate();
			var mesActual = d.getMonth()+1;
			var anio = d.getFullYear();
			if (mesActual < 3) {
				anio = anio - 1;
			}

			var sprintf = require("sprintf");

			var infoMeses = {meses:Array(), mes:{}};
			for (var m=3;m<12;m++) {
				infoMeses.meses[m] = {
					nombre: meses[m],
					inhabilitado: (m > mesActual || m==mesActual && diaActual<25),
					fecha: new Date(anio+"-"+(m+1)+"-09 23:59:59 GMT-0300")
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
							return res.view({title:title,infoMeses:infoMeses, DependId:session.Dependid, presentismo:presentismo,  mensaje:mensaje, certificados:undefined});
						} else {
							sails.log("Cierre de mes="+cerrar+" dependid="+session.Dependid);
							return res.redirect(sails.config.environment==='development' ? '' : '/node/presentismo');
						}
					});
					return;
				}

				if (!mes) {
					return res.view({title:title,infoMeses:infoMeses, DependId:session.Dependid, presentismo:presentismo, certificados:undefined});
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
						Personal.get({Anio:anio,Mes:mes,DependId:session.Dependid}, function(err, personalLiceo) {
							if (err) {
								return res.serverError(err);
							}

							return res.view({title:title, arrInasistencias:arrInasistencias, personalLiceo:personalLiceo, infoMeses:infoMeses, DependId:session.Dependid, presentismo:presentismo, certificados:certificados});
						});
					});
				});
			});
		});
	},

	pendientes: function (req, res) {

		var title = 'Consulta de pendientes de cierre de presentismo';

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

			var meses = ['','ene','feb','mar','abr','may','jun',
						 'jul','ago','set','oct','nov','dic'];
			var mes = parseInt(req.param('mes'));

			var d = new Date();
			var mesActual = d.getMonth()+1;
			var anioActual = d.getFullYear()
			var anio = anioActual;
			if (mesActual == 1) {
				anio = anio - 1;
			}

			var sprintf = require("sprintf");

			Portal.getDependsWithMenu({Userid:session.Userid, Menuid:'MP_INASISTENCIAS_LICENCIAS_LICEOS'}, function(err,depends) {
				if (err) {
					return res.serverError(err);
				}

				var infoMeses = {meses:Array()};
				for (var m=1;m<(mesActual==1 ? 13 : mesActual);m++) {
					infoMeses.meses[m] = { nombre: meses[m], depend:Array() };
				}
				infoMeses.fecha_toString = function(d) {return sprintf("%02d/%02d/%04d", d.getDate(),d.getMonth()+1,d.getFullYear())};

				var arrDepends = depends.map(function(i){ return i.dependid });
				Presentismo.find({DependId:arrDepends, anio:anio}).exec(function(err, presentismo) {
					if (err) {
						return res.serverError(err);
					}

					presentismo.forEach (function(info){
						infoMeses.meses[info.mes].depend[info.DependId] = [info.updatedAt];
					});

					Multas.find({DependId:arrDepends, anio:anio}).exec(function(err, multas) {
						if (err) {
							return res.serverError(err);
						}

						multas.forEach (function(info){
							if (typeof infoMeses.meses[info.mes].depend[info.DependId] === 'undefined') {
								infoMeses.meses[info.mes].depend[info.DependId] = Array();
							}
							infoMeses.meses[info.mes].depend[info.DependId][1] = info.updatedAt;
						});

						return res.view({title:title,depends:depends, infoMeses:infoMeses});
					});
				});
			});
		});
	},

	multas: function (req, res) {

		var title = 'Consulta de multas por inasistencia';

		var sessionid;
		if (sails.config.environment === "development") {
			sessionid = '9728448076454730240';
		} else {
			sessionid = req.cookies.SESION;
		}
		wsPortal.getSession(sessionid, function(err,session) {
			if (sails.config.environment === "development") {
				err = undefined;
				session = {Sesionesid:1,Userid:'u19724241',Dependid:1072,Lugarid:1072};
			}
			if (err) {
				return res.forbidden(err);
			}

			var mes = parseInt(req.param('mes'));

			var d = new Date();
			var now = d.getTime();
			var diaActual = d.getDate();
			var mesActual = d.getMonth()+1;
			var anioActual = d.getFullYear()
			var anio = anioActual;
			if (mesActual == 1) {
				anio = anio - 1;
			}

			var sprintf = require("sprintf");

			var infoMeses = {meses:Array(), mes:{}};
			for (var m=1;m<=12;m++) {
				infoMeses.meses[m] = {
					nombre: meses[m],
					inhabilitado: ((anio==anioActual) && ((m==mesActual && diaActual<25) || (m > mesActual))),
					fecha: new Date((m<12 ? anio : anio+1)+"-"+(m<12 ? m+1 : 1)+"-09 23:59:59 GMT-0300")
				};
				infoMeses.meses[m].estado = (now > infoMeses.meses[m].fecha.getTime() ? "Vencido" : "Vencimiento");
			}
			infoMeses.fecha_toString = function(d) {return sprintf("%02d/%02d/%04d", d.getDate(),d.getMonth()+1,d.getFullYear())};

			Multas.find({anio:anio, DependId:session.Dependid}).exec(function(err, multas) {
				if (err) {
					return res.serverError(err);
				}
				multas.forEach (function(info){
					infoMeses.meses[info.mes].fecha = info.updatedAt;
					infoMeses.meses[info.mes].estado = "Presentado";
				});

				var cerrar = parseInt(req.param('cerrar'));
				if (cerrar) {
					Multas.create({anio:anio, mes:cerrar, DependId:session.Dependid, userid:session.Userid}).exec(function(err,data) {
						var mensaje;

						if (err) {

							Multas.update({anio:anio, mes:cerrar, DependId:session.Dependid, userid:session.Userid},{}).exec(function(err,data) {

								if (err) {
									sails.log("error="+err);
									mensaje = "No se pudo cerrar el mes por un error al acceder a la base de datos";
									return res.view({title:title,infoMeses:infoMeses, DependId:session.Dependid, mensaje:mensaje, certificados:undefined});
								} else {
									sails.log("Cierre por update de mes="+cerrar+" dependid="+session.Dependid);
									return res.redirect(sails.config.environment==='development' ? 'multas' : '/node/presentismo/multas');
								}
							});

						} else {
							sails.log("Cierre de mes="+cerrar+" dependid="+session.Dependid);
							return res.redirect(sails.config.environment==='development' ? 'multas' : '/node/presentismo/multas');
						}
					});
					return;
				}

				if (!mes) {
					return res.view({title:title,infoMeses:infoMeses, DependId:session.Dependid, certificados:undefined});
				}

				infoMeses.mes.id = mes;
				infoMeses.mes.nombre = meses[mes];

				// obtengo todas las inasistencias de la dependencia:
				Inasistencias.get_multas({DependId:session.Dependid,Anio:anio,Mes:mes}, function(err, inasistencias) {
					if (err) {
						return res.serverError(err);
					}

					// transformo las inasistencias en un array
					var arrInasistencias = Array();
					inasistencias.forEach(function(info) {
						if (!arrInasistencias[info.perdocid]) {
							arrInasistencias[info.perdocid] = Array();
						}
						if (!arrInasistencias[info.perdocid][info.InasisLicTipo]) {
							arrInasistencias[info.perdocid][info.InasisLicTipo] = Array();
						}
						if (!arrInasistencias[info.perdocid][info.InasisLicTipo][info.InasCausTipo]) {
							arrInasistencias[info.perdocid][info.InasisLicTipo][info.InasCausTipo] = Array();
						}
						if (!arrInasistencias[info.perdocid][info.InasisLicTipo][info.InasCausTipo][info.InasCausId]) {
							arrInasistencias[info.perdocid][info.InasisLicTipo][info.InasCausTipo][info.InasCausId] = Array();
						}
						if (typeof arrInasistencias[info.perdocid][info.InasisLicTipo][info.InasCausTipo][info.InasCausId][info.CicloPago]==='undefined') {
							arrInasistencias[info.perdocid][info.InasisLicTipo][info.InasCausTipo][info.InasCausId][info.CicloPago] = {horas:0, dias:0};
						}
						arrInasistencias[info.perdocid][info.InasisLicTipo][info.InasCausTipo][info.InasCausId][info.CicloPago].horas += info.horas;
						arrInasistencias[info.perdocid][info.InasisLicTipo][info.InasCausTipo][info.InasCausId][info.CicloPago].dias  += info.dias;
					});

					// obtengo los certificados que faltan en la dependencia
					Certificados.get({DependId:session.Dependid,Anio:anio,Mes:mes}, function(err, certificados) {
						if (err) {
							return res.serverError(err);
						}

						// obtengo las personas de la dependencia:
						Personal.get({Anio:anio,Mes:mes,DependId:session.Dependid,activo:'S'}, function(err, personalLiceo) {
							if (err) {
								return res.serverError(err);
							}

							// averiguo si este liceo trabaja los sábados:
							Estudiantil.liceo_sabado({DependId:session.Dependid,Anio:anio,Mes:mes},function(err,trabaja_sabado){
								if (err) {
									return res.serverError(err);
								}

								return res.view({title:title,arrInasistencias:arrInasistencias, personalLiceo:personalLiceo, infoMeses:infoMeses, DependId:session.Dependid, certificados:certificados, trabaja_sabado:trabaja_sabado});
							});
						});
					});
				});
			});
		});
	},

};
