'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('boards', {
    id: {
      type: 'int',
      unsigned: true,
      length: 10,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    created_at: {
      type: 'datetime',
      notNull: true,
    },
    updated_at: {
      type: 'datetime',
      notNull: true,
    },
    url: {
      type: 'string',
      notNull: true,
      unique: true,
    },
  })
};

exports.down = function(db) {
  return db.dropTable('boards')
};

exports._meta = {
  "version": 1
};
