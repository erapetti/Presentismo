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

	MapeoDependencia: function(data,callback) {
		return Personal.query(`
			select idas400
			from mapeo_dependencias
			where idcorp = ?`
			,
			[data.idcorp],
			callback);
		},

};
