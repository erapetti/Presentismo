/**
 * PresentismoController
 *
 * @description :: Server-side logic for managing presentismoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	index: function (req, res) {

		var session = Portal.getSession(req.cookies.SESION);
		var mesBase = 5;
		var meses = ['','enero','febrero','marzo','abril','mayo','junio',
		             'julio','agosto','setiembre','octubre','noviembre','diciembre'];
		var mes=parseInt(req.param('mes'));
		var anio=2016;

		var d = new Date();
		var now = d.getTime();
		var mesActual = d.getMonth()+1;

		var infoMeses = {mes1:Array(), mes2:Array(), mes3:Array(), mes:Array()};
		infoMeses.mes1.nombre = meses[mesBase+1];
		infoMeses.mes1.inhabilitado = mesBase+1>=mesActual;
		infoMeses.mes1.vencimiento = new Date(anio+"-"+(mesBase+2)+"-09");
		infoMeses.mes1.vencido = now > infoMeses.mes1.vencimiento.getTime();
		infoMeses.mes1.class = (infoMeses.mes1.inhabilitado ? "disabled" : mes==1 ? "active" : undefined);
		infoMeses.mes2.nombre = meses[mesBase+2];
		infoMeses.mes2.inhabilitado = mesBase+2>=mesActual;
		infoMeses.mes2.vencimiento = new Date(anio+"-"+(mesBase+3)+"-09");
		infoMeses.mes2.vencido = now > infoMeses.mes2.vencimiento.getTime();
		infoMeses.mes2.class = (infoMeses.mes2.inhabilitado ? "disabled" : mes==2 ? "active" : undefined);
		infoMeses.mes3.nombre = meses[mesBase+3];
		infoMeses.mes3.inhabilitado = mesBase+3>=mesActual;
		infoMeses.mes3.vencimiento = new Date(anio+"-"+(mesBase+4)+"-09");
		infoMeses.mes3.vencido = now > infoMeses.mes3.vencimiento.getTime();
		infoMeses.mes3.class = (infoMeses.mes3.inhabilitado ? "disabled" : mes==3 ? "active" : undefined);


		if (!mes) {
			res.view({infoMeses:infoMeses});
			return;
		}

		mes+=mesBase;
		infoMeses.mes.id = mes-mesBase;
		infoMeses.mes.nombre = meses[mes];
			
		// obtengo todas las inasistencias de la dependencia:
		Inasistencias.get({DependId:session.dependid,Anio:anio,Mes:mes}, function(err, inasistencias) {
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

			// obtengo las personas de la dependencia:
			Presentismo.find({Anio:anio,Mes:mes,DependId:session.dependid}).exec(function(err, personalLiceo) {
				if (err) {
					return res.serverError(err);
				}

				res.view({arrInasistencias:arrInasistencias, personalLiceo:personalLiceo, infoMeses:infoMeses});
			});
		});
	}
};
