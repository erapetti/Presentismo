/**
 * Portal.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  connection: 'Portal',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  autoPK: false,
  migrate: 'safe',
  attributes: {
    dependid: 'integer',
    dependdesc: 'string',
  },

  getDependsWithMenu: function(data,callback) {
      return Portal.query(`
      select dependid, dependdesc
      from SEGRELACION_GRUPO_USUARIO
      join SEGRELACION_GRUPO_MENU using (grupid)
      join Direcciones.DEPENDENCIAS using (dependid)
      where USERID=?
        and menuid=?

      UNION

      select D.dependid, D.dependdesc
      from Portal.SEGRELACION_GRUPO_USUARIO SGU, Direcciones.DEPENDENCIAS D, Personal.as400 a
      where SGU.userid=?
        and SGU.dependid=2710
        and SGU.grupid='G_INASISTENCIAS Y LICENCIAS_RRHH'
        and a.anio=year(curdate())-if(month(curdate())=1,1,0)
        and a.mes=if(month(curdate())>1,month(curdate())-1,12)
        and a.dependid=D.dependid
      `,
      [data.Userid, data.Menuid, data.Userid],
      callback);
  },
};
