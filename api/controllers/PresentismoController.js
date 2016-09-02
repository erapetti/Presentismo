/**
 * PresentismoController
 *
 * @description :: Server-side logic for managing presentismoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	index: function (req, res) {

		var sessionid;
		if (sails.config.environment === "development") {
			sessionid = '9728448076454730240';
		} else {
			sessionid = req.cookies.SESION;
		}
		Portal.getSession(sessionid, function(err,session) {
			if (sails.config.environment === "development") {
				err = undefined;
				session = {Sesionesid:1,Userid:'u19724241',Dependid:232,Lugarid:232};
			}
			if (err) {
				return res.forbidden(err);
				//err.status = 403;
				//return res.negotiate(err);
			}

			var mesBase = 5;
			var meses = ['','enero','febrero','marzo','abril','mayo','junio',
				     'julio','agosto','setiembre','octubre','noviembre','diciembre'];
			var mes = parseInt(req.param('mes'));
			var anio = 2016;

			var d = new Date();
			var now = d.getTime();
			var mesActual = d.getMonth()+1;

			var sprintf = require("sprintf");

			var infoMeses = {mes1:Array(), mes2:Array(), mes3:Array(), mes:Array()};
			infoMeses.mes1.nombre = meses[mesBase+1];
			infoMeses.mes1.inhabilitado = mesBase+1>=mesActual;
			infoMeses.mes1.fecha = new Date(anio+"-"+(mesBase+2)+"-09");
			infoMeses.mes1.estado =  (now > infoMeses.mes1.fecha.getTime() ? "Vencido" : "Vencimiento");
			infoMeses.mes1.class = (infoMeses.mes1.inhabilitado ? "disabled" : mes==1 ? "active" : undefined);

			infoMeses.mes2.nombre = meses[mesBase+2];
			infoMeses.mes2.inhabilitado = mesBase+2>=mesActual;
			infoMeses.mes2.fecha = new Date(anio+"-"+(mesBase+3)+"-09");
			infoMeses.mes2.estado = (now > infoMeses.mes2.fecha.getTime() ? "Vencido" : "Vencimiento");
			infoMeses.mes2.class = (infoMeses.mes2.inhabilitado ? "disabled" : mes==2 ? "active" : undefined);

			infoMeses.mes3.nombre = meses[mesBase+3];
			infoMeses.mes3.inhabilitado = mesBase+3>=mesActual;
			infoMeses.mes3.fecha = new Date(anio+"-"+(mesBase+4)+"-09");
			infoMeses.mes3.estado = (now > infoMeses.mes3.fecha.getTime() ? "Vencido" : "Vencimiento");
			infoMeses.mes3.class = (infoMeses.mes3.inhabilitado ? "disabled" : mes==3 ? "active" : undefined);

			infoMeses.fecha_toString = function(d) {return sprintf("%02d/%02d/%04d", d.getDate(),d.getMonth()+1,d.getFullYear())};



			Presentismo.find({anio:anio, DependId:session.Dependid}).exec(function(err, presentismo) {
				if (err) {
					return res.serverError(err);
				}
				presentismo.forEach (function(info){
					if (info.mes == 1+mesBase) {
						infoMeses.mes1.fecha = info.updatedAt;
						infoMeses.mes1.estado = "Presentado";
					} else if (info.mes == 2+mesBase) {
						infoMeses.mes2.fecha = info.updatedAt;
						infoMeses.mes2.estado = "Presentado";
					} else if (info.mes == 3+mesBase) {
						infoMeses.mes3.fecha = info.updatedAt;
						infoMeses.mes3.estado = "Presentado";
					}
				});

				var cerrar = parseInt(req.param('cerrar'));
				if (cerrar) {
					Presentismo.create({anio:anio, mes:cerrar+mesBase, DependId:session.Dependid, userid:session.Userid}).exec(function(err,data) {
						var mensaje;

						if (err) {
							sails.log("error="+err);
							mensaje = "No se pudo cerrar el mes por un error al acceder a la base de datos";
							return res.view({infoMeses:infoMeses, DependId:session.Dependid, presentismo:presentismo,  mensaje:mensaje});
						} else {
							sails.log("data="+data);
							sails.log("Cierre de mes="+cerrar+" dependid=session.Dependid");
							return res.redirect(sails.config.environment==='development' ? '' : '/node/presentismo');
						}
					});
					return;
				}

				if (!mes) {
					return res.view({infoMeses:infoMeses, DependId:session.Dependid, presentismo:presentismo});
				}

				mes+=mesBase;
				infoMeses.mes.id = mes-mesBase;
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
							arrInasistencias[info.perdocid][info.InasisLicTipo] = 0;
						}
						arrInasistencias[info.perdocid][info.InasisLicTipo] += info.inasistencias;
					});

					// obtengo los certificados que faltan en la dependencia
					var certificados;
					try {
						var fs = require('fs');
						fs.accessSync("assets/files/"+session.Dependid+".ods", fs.R_OK);
						certificados = "files/"+session.Dependid+".ods";
					} catch(e) { sails.log("error="+e) };

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
	}
};
