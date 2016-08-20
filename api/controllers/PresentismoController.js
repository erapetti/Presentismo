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

		var anio=2016;
		var mes=6;
	
		Inasistencias.get({DependId:dependid,Anio:anio,Mes:mes}, function(err, inasistencias) {
			if (err) {
				return res.serverError(err);
			}

			Presentismo.find({Anio:anio,Mes:mes,DependId:dependid}).exec(function(err, presentismos) {
				if (err) {
					return res.serverError(err);
				}

				var arrInasistencias = Array();
				inasistencias.forEach(function(info) { 
					arrInasistencias[info.perdocid] = info.inasistencias;
				});
// console.log(arrInasistencias);
				res.view({arrInasistencias:arrInasistencias, presentismos:presentismos});
			});
		});
	}
	
};

