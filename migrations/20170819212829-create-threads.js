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
  return db.createTable('threads', {
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
    title: {
      type: 'string',
      notNull: true,
    },
    url: {
      type: 'string',
      notNull: true,
      unique: true,
    },
    res: {
      type: 'int',
      notNull: true,
    },
    position: {
      type: 'int',
      notNull: true,
    },
    board_id: {
      type: 'int',
      unsigned: true,
      length: 10,
      notNull: true,
      foreignKey: {
        name: 'thread_board_id_fk',
        table: 'boards',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT',
        },
        mapping: 'id',
      },
    },
  })
};

exports.down = function(db) {
  return db.dropTable('threads')
};

exports._meta = {
  "version": 1
};
