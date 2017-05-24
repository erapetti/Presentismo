/**
 * Inasistencias.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

        connection: 'Estudiantil',
        autoCreatedAt: false,
        autoUpdatedAt: false,
        autoPK: false,
        migrate: 'safe',

        liceo_sabado: function(data,callback) {
          Estudiantil.query(`
            SELECT 1 trabaja_sabado
            FROM Estudiantil.LICEOPLANTURNO_HORARIOS
            WHERE HorarioDiaSemana='SAB'
              AND LiceoPlanDependId=?
              AND (HorarioFchHasta IS NULL OR HorarioFchHasta>=?)
              AND (HorarioFchDesde IS NULL OR HorarioFchDesde<=?)
            GROUP BY 1`
            ,
            [data.DependId,data.Anio+'-'+data.Mes+'-01', data.Anio+'-'+data.Mes+'-31'],
            function(err, result){
              callback(err, err ? undefined : (typeof result[0] !== 'undefined'));
            });
          },
};
