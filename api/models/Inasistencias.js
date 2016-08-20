/**
 * Inasistencias.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

        connection: 'Personal',
        autoCreatedAt: false,
        autoUpdatedAt: false,
        autoPK: false,
        migrate: 'safe',
        tableName: 'INASISLIC',
	attributes: {
		perdocid: 'string',
		inasistencias: 'integer',
	},
	get: function(data,callback) {
		return Inasistencias.query('					\
		SELECT perdocid,count(*) inasistencias				\
		 FROM Personal.INASISLIC					\
		 JOIN Personas.PERSONASDOCUMENTOS				\
		   ON personalperid=perid and paiscod="UY" and doccod="CI"	\
		WHERE LiceoPlanDependId=?					\
		  AND InasisLicFchFin>=?					\
		  AND InasisLicFchIni<=?					\
		GROUP BY perdocid',
		[data.DependId, data.Anio+'-'+data.Mes+'-01', data.Anio+'-'+data.Mes+'-31'],
		callback);
	},
};

