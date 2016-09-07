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
      `,
      [data.Userid, data.Menuid],
      callback);
  },
};
