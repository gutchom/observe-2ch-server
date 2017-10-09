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
  return db.createTable('posts', {
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
    name: {
      type: 'string',
      notNull: true,
    },
    uid: {
      type: 'string',
      notNull: true,
    },
    url: {
      type: 'string',
      notNull: true,
    },
    timestamp: {
      type: 'datetime',
      notNull: true,
    },
    message: {
      type: 'text',
      notNull: true,
    },
    thread_id: {
      type: 'int',
      unsigned: true,
      length: 10,
      notNull: true,
      foreignKey: {
        name: 'post_thread_id_fk',
        table: 'threads',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT',
        },
        mapping: 'id',
      },
    },
  });
};

exports.down = function(db) {
  return db.dropTable('posts');
};

exports._meta = {
  "version": 1
};
