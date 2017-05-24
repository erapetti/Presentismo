/**
 * Multas.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	connection: 'presentismo',
	autoCreatedAt: true,
	autoUpdatedAt: true,
	autoPK: false,
	migrate: 'safe',
	tableName: 'multas_cierre',
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
		userid: 'string',
	}
};
