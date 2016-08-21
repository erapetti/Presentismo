/**
 * PresentismoController
 *
 * @description :: Server-side logic for managing presentismoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	index: function (req, res) {
		var userId = "u15098331"; // lo tomo de la sesion
		var dependid = 101; // lo tomo de la sesion

		var mesBase = 5;
		var meses = ['','enero','febrero','marzo','abril','mayo','junio',
		             'julio','agosto','setiembre','octubre','noviembre','diciembre'];
		var mes=parseInt(req.param('mes',1)) + mesBase;
		var anio=2016;
	
		var d = new Date();
		var mesActual = d.getMonth()+1;

		// obtengo todas las inasistencias de la dependencia:
		Inasistencias.get({DependId:dependid,Anio:anio,Mes:mes}, function(err, inasistencias) {
			if (err) {
				return res.serverError(err);
			}

			// obtengo las personas de la dependencia:
			Presentismo.find({Anio:anio,Mes:mes,DependId:dependid}).exec(function(err, personalLiceo) {
				if (err) {
					return res.serverError(err);
				}

				var arrInasistencias = Array();
				inasistencias.forEach(function(info) { 
					if (!arrInasistencias[info.perdocid]) {
						arrInasistencias[info.perdocid] = Array();
						arrInasistencias[info.perdocid][info.InasisLicTipo] = 0;
					}
					arrInasistencias[info.perdocid][info.InasisLicTipo] += info.inasistencias;
				});

				var infoMeses = {mes1:Array(), mes2:Array(), mes3:Array(), mes:Array()};
				infoMeses.mes1.nombre = meses[mesBase+1];
				infoMeses.mes1.class = (mesBase+1>=mesActual ? "disabled" : mes==mesBase+1 ? "active" : undefined);
				infoMeses.mes2.nombre = meses[mesBase+2];
				infoMeses.mes2.class = (mesBase+2>=mesActual ? "disabled" : mes==mesBase+2 ? "active" : undefined);
				infoMeses.mes3.nombre = meses[mesBase+3];
				infoMeses.mes3.class = (mesBase+3>=mesActual ? "disabled" : mes==mesBase+3 ? "active" : undefined);
				infoMeses.mes.id = mes-mesBase;
				infoMeses.mes.nombre = meses[mes];
				
				res.view({arrInasistencias:arrInasistencias, personalLiceo:personalLiceo, infoMeses:infoMeses});
			});
		});
	}
	
};

