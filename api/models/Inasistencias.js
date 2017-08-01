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
		return Inasistencias.query(`
    SELECT perdocid,
      InasisLicTipo,
      IF(inascauspres=3, greatest(0,ifnull(max(InasisLicId_Dias),1)-2), ifnull(max(InasisLicId_Dias),1)) inasistencias
    FROM (
    	SELECT *
    	FROM Personal.INASISLIC
    	JOIN FUNCIONES_ASIGNADAS USING (FuncAsignadaId)
    	JOIN SILLAS USING (SillaId)
    	WHERE SillaDependId=?
    	  AND InasisLicFchFin>=?
    	  AND InasisLicFchIni<=?
    	GROUP BY PERSONALPERID,INASISLICID
    ) I
    JOIN INASCAUSALES USING (InasCausId)
    JOIN Personas.PERSONASDOCUMENTOS ON personalperid=perid and paiscod="UY" and doccod="CI"
    LEFT JOIN INASISLIC_LICENCIA_DIAS ID on ID.InasisLicId=I.InasisLicId and ID.PersonalPerId=I.PersonalPerId and ID.InasisLicId_Mes=?
    WHERE inascauspres<>0
    GROUP BY perdocid,InasisLicTipo,InasisLicFchIni,InasisLicFchFin`
      ,
		  [data.DependId, data.Anio+'-'+data.Mes+'-01', data.Anio+'-'+data.Mes+'-31', data.Mes],
		  callback);
	},
  get_multas: function(data,callback) {
    return Inasistencias.query(`
    SELECT perdocid,
      InasisLicTipo,
      sum(if(InasisLicDiaHora='H',InasisLicCant,0)) horas,
      sum(if(ID.InasisLicId_Mes is not null,InasisLicId_Dias,if(InasisLicDiaHora='D',1,0))) dias,
      ifnull(max(InasisLicId_Dias),1) inasistencias
    FROM (
      SELECT *
      FROM Personal.INASISLIC
      JOIN FUNCIONES_ASIGNADAS USING (FuncAsignadaId)
      JOIN SILLAS USING (SillaId)
      WHERE SillaDependId=?
        AND InasisLicFchFin>=?
        AND InasisLicFchIni<=?
      GROUP BY PERSONALPERID,INASISLICID
    ) I
    JOIN INASCAUSALES USING (InasCausId)
    JOIN Personas.PERSONASDOCUMENTOS ON personalperid=perid and paiscod="UY" and doccod="CI"
    LEFT JOIN INASISLIC_LICENCIA_DIAS ID on ID.InasisLicId=I.InasisLicId and ID.PersonalPerId=I.PersonalPerId and ID.InasisLicId_Mes=?
    WHERE InasCausDescuento<>0
      AND InasCausTipo='I'
    GROUP BY perdocid,InasisLicTipo,InasisLicFchIni,InasisLicFchFin`
      ,
      [data.DependId, data.Anio+'-'+data.Mes+'-01', data.Anio+'-'+data.Mes+'-31', data.Mes],
      callback);
  },
};
