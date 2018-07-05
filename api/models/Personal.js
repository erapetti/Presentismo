/**
 * Personal.js
 *
 * @description :: El personal de los liceos por mes, tomado del AS400
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	connection: 'Personal',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,
	migrate: 'safe',
	tableName: 'as400',
	attributes: {
		anio: {
			type: 'integer',
			primaryKey: true
		},
		mes: {
			type: 'integer',
			primaryKey: true
		},
		DependId: {
			type: 'integer',
			primaryKey: true
		},
		tipo: {
			type: 'integer',
			primaryKey: true
		},
		cedula: {
			type: 'integer',
			primaryKey: true
		},
		PerNombreCompleto: 'string',
		codcargo: 'string',
		cargo: 'string',
		DependDesc: 'string',
		horas: 'integer',
		activo: 'string',
		TipoCargo: function() {
			return (this.tipo==1 ? 'ND' : (this.tipo==2 ? 'DI' : 'DD'));
		},
	},

	get: function(data,callback) {
		return Personal.query(`
			select Dependid,
			       DependDesc,
						 cedula,
						 PerNombreCompleto,
						 cargo,
						 case tipo when 1 then 'ND' when 2 then 'DI' when 3 then 'DD' end TipoCargo,
						 activo,
						 concat(sum(if(AsiCod<>75,horas,0)),if(sum(if(AsiCod=75,horas,0))>0,concat('+',sum(if(AsiCod=75,horas,0))),'')) horas
			from as400
			where anio = ?
			  and mes = ?
				and DependId = ?
			group by 1,2,3,4,5,6,7
			`
			,
			[data.Anio,data.Mes,data.DependId],
			callback);
		},

};
