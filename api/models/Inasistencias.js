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
		InasisLicTipo: 'string',
		inasistencias: 'integer',
	},
	get: function(data,callback) {
		return Inasistencias.query('					\
		SELECT perdocid,						\
		       InasisLicTipo,						\
		       IF(InasisLicFchIni=InasisLicFchFin,1,GREATEST(InasisLicid_Dias,0)) inasistencias \
		 FROM Personal.INASISLIC					\
		 JOIN Personas.PERSONASDOCUMENTOS				\
		   ON personalperid=perid and paiscod="UY" and doccod="CI"	\
		 LEFT JOIN INASISLIC_LICENCIA_DIAS ID				\
		USING (InasisLicId)						\
		WHERE LiceoPlanDependId=?					\
		  AND InasisLicFchFin>=?					\
		  AND InasisLicFchIni<=?					\
		  AND (ID.InasisLicId is null or ID.InasisLicId_Mes = ?)	\
		GROUP BY perdocid,LiceoPlanDependId,InasisLicTipo,InasisLicId',
		[data.DependId, data.Anio+'-'+data.Mes+'-01', data.Anio+'-'+data.Mes+'-31',data.Mes],
		callback);
	},
};

