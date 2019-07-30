/**
 * Dependencias.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  connection: 'Direcciones',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  autoPK: false,
  migrate: 'safe',
  tableName: 'DEPENDENCIAS',
  identity: 'Dependencias',
  attributes: {
          DependId: {
                  type: 'integer',
                  primaryKey: true
          },
          DependDesc: 'string',
          DependNom: 'string',
          StatusId: 'integer',
  },
  conPersonal: function(callback) {
    return this.query(`
      select DependId, D.DependDesc
      from DEPENDENCIAS D
      join Personal.as400 a using (dependid)
      where a.anio=year(curdate())-if(month(curdate())=1,1,0)
        and a.mes=if(month(curdate())>1,month(curdate())-1,12)
      group by 1,2
      order by 2,1
    `, [], callback);
  },

};
