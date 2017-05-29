import knex from 'knex';
import bookshelf from 'bookshelf';

/**
 * Connect to mysql instance
 * @param {string} dsn
 * @return {Promise}
 * TODO: add log file for debugging
 */
function connect(config) {
  return bookshelf(knex(config));
}

export default { connect };
