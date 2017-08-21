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
		CertFecha: 'date',
		cedula: 'integer',
		PerNombreCompleto: 'string',
		CertFchIni: 'date',
		CertFchFin: 'date',
		tipoLicencia: 'string',
		cargo: 'string',
		horas: 'integer',
		observaciones: 'string',
	},
	get: function(data,callback) {
		return this.query(`
		SELECT certid,
		       CertFecha,
		       A.cedula,
		       A.PerNombreCompleto,
		       CertFchIni,
		       CertFchFin,
		       case codlic
            when "J" then "Junta Médica"
            when "L" then "Lactancia"
            when "M" then "Maternidad"
            when "E" then "Enfermedad"
            when "EM" then "Medio horario por enfermedad"
            when "LM" then "Medio horario por lactancia"
		       end tipoLicencia,
		       C.cargo,
		       C.horas,
		       observaciones
		 FROM Personal.certificaciones_anep C
		 JOIN as400 A
		   ON floor(A.cedula/10)=C.cedula
		 JOIN Personas.PERSONASDOCUMENTOS
		   ON perdocid=cast(A.cedula as char(30)) AND paiscod="UY" AND doccod="CI"
		WHERE codlic<>"N"
		  AND C.CertFchFin>=?
		  AND C.CertFchIni<=?
		  AND A.dependid=?
		  AND A.anio=?
		  AND A.mes=?
		  AND A.tipo<>1
      AND A.activo='S'
		  AND NOT EXISTS (
        SELECT 1
        FROM INASISLIC I
        JOIN FUNCIONES_ASIGNADAS USING (FuncAsignadaId)
        JOIN SILLAS USING (SillaId)
        WHERE personalperid=perid
          AND InasisLicFchIni<=CertFchIni
          AND InasisLicFchFin>=CertFchFin
          AND SillaDependid=A.dependid
		  )
		GROUP BY certid,CertFecha,A.cedula,
             CertFchIni,CertFchFin,
             codlic,C.cargo,C.horas,observaciones
		ORDER BY perdocid,C.CertFchIni
		`,
		[data.Anio+'-'+data.Mes+'-01', data.Anio+'-'+data.Mes+'-31', data.DependId, data.Anio, data.Mes],
		callback);
	},
};
