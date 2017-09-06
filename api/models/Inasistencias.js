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
      InasCausTipo,
      InasCausId,
      CicloPago,
      sum(horas) horas,
      sum(ifnull(InasisLicId_Dias, dias)) dias
    FROM (
      SELECT PERSONALPERID,InasisLicTipo,InasisLicFchIni,InasisLicFchFin,InasisLicId,InasCausId,
             if(InasisLicCicloPago is not null,InasisLicCicloPago,RelLabCicloPago) CicloPago,
             sum(if(InasisLicDiaHora='H',InasisLicCant*if(InasisLicTipoMov='E',-1,1),0)) horas,
             sum(if(InasisLicDiaHora='D',InasisLicCant*if(InasisLicTipoMov='E',-1,1),0)) dias
      FROM Personal.INASISLIC
      JOIN FUNCIONES_ASIGNADAS USING (FuncAsignadaId)
      JOIN SILLAS USING (SillaId)
      LEFT JOIN FUNCIONES_RELACION_LABORAL USING (FuncAsignadaId)
      LEFT JOIN RELACIONES_LABORALES RL USING (RelLabId,PersonalPerId)
      WHERE SillaDependId=?
        AND InasisLicFchFin>=?
        AND InasisLicFchIni<=?
      GROUP BY 1,2,3,4,5,6,7
    ) I
    JOIN INASCAUSALES USING (InasCausId)
    JOIN Personas.PERSONASDOCUMENTOS ON personalperid=perid and paiscod="UY" and doccod="CI"
    LEFT JOIN INASISLIC_LICENCIA_DIAS ID on ID.InasisLicId=I.InasisLicId and ID.PersonalPerId=I.PersonalPerId and ID.InasisLicId_Mes=?
    WHERE InasCausDescuento<>0
    GROUP BY perdocid,InasisLicTipo,InasCausTipo`
      ,
      [data.DependId, data.Anio+'-'+data.Mes+'-01', data.Anio+'-'+data.Mes+'-31', data.Mes ],
      callback);
  },
};
