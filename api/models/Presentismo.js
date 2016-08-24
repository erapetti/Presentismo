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
	tableName: 'cierres',
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
		CreatedAt: 'date',
		UpdatedAt: 'date',
	}
};

