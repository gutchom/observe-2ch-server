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
  return db.createTable('users', {
    id: {
      type: 'int',
      unsigned: true,
      length: 10,
      notNull: true,
      primaryKey: true,
      autoIncrement: true
    },
    created_at: {
      type: 'datetime',
      notNull: true,
    },
    updated_at: {
      type: 'datetime',
      notNull: true,
    },
    uid: {
      type: 'string',
      notNull: true,
      unique: true,
    },
    token: {
      type: 'string',
      notNull: true,
    },
    user_name: {
      type: 'string',
      notNull: true,
    },
    display_name: {
      type: 'string',
      notNull: true,
    },
  })
};

exports.down = function(db) {
  return db.dropTable('users')
};

exports._meta = {
  "version": 1
};
