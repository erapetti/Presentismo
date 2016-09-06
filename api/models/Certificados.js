/**
 * Certificados.js
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
        tableName: 'certificaciones_anep',
	attributes: {
		certid: 'integer',
		InasisLicFecha: 'date',
		cedula: 'integer',
		PerNombreCompleto: 'string',
		InasisLicFchIni: 'date',
		InasisLicFchFin: 'date',
		tipoLicencia: 'string',
		cargo: 'string',
		horas: 'integer',
		observaciones: 'string',
	},
	get: function(data,callback) {
		return this.query('												\
		SELECT certid,													\
		       C.InasisLicFecha,											\
		       cedula*10+digito cedula,											\
		       PerNombreCompleto,											\
		       C.InasisLicFchIni,											\
		       C.InasisLicFchFin,											\
		       case codlic when "J" then "Junta Médica" when "L" then "Lactancia" when "M" then "Maternidad" when "E" then "Enfermedad" when "EM" then "Medio horario por enfermedad" when "LM" then "Medio horario por lactancia" end tipoLicencia,				\
			cargo,													\
			horas,													\
			observaciones												\
		 FROM Personal.certificaciones_anep C										\
		 JOIN Personas.PERSONASDOCUMENTOS										\
		   ON perdocid=concat(cedula,digito) and paiscod="UY" and doccod="CI"						\
		 JOIN Personas.PERSONAS P using (perid)										\
		 LEFT JOIN INASISLIC I												\
		   ON personalperid=perid and C.InasisLicFchIni=I.InasisLicFchIni and C.InasisLicFchFin=I.InasisLicFchFin	\
                 LEFT JOIN FUNCIONES_ASIGNADAS USING (FuncAsignadaId)								\
                 LEFT JOIN SILLAS USING (SillaId)										\
		WHERE InasisLicId is null											\
		  AND codlic<>"N"												\
		  AND ((LiceoPlanDependId is null and SillaDependid=?) OR LiceoPlanDependId=?)					\
		  AND C.InasisLicFchFin>=?											\
		  AND C.InasisLicFchIni<=?											\
		',
		[data.DependId,data.DependId, data.Anio+'-'+data.Mes+'-01', data.Anio+'-'+data.Mes+'-31'],
		callback);
	},
};

