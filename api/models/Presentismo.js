/**
 * Presentismo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	connection: 'presentismo',
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
	}

};

