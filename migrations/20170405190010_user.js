
exports.up = (knex, Promise) => Promise.all([
  knex.schema.dropTableIfExists('user'),
  knex.schema.createTableIfNotExists('user', (t) => {
    t.increments('user_id').primary();
    t.string('name').defaultTo('').notNullable();
    t.string('email').defaultTo('').unique().notNullable();
    t.string('password').nullable().defaultTo(null);
    t.enu('status', ['active', 'inactive']).defaultTo('inactive').notNullable();
    t.enu('role', ['admin', 'user']).notNullable();
    t.timestamps(true);
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.dropTableIfExists('user'),
]);
