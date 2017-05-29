import { User } from '../src/modules/user/model';

exports.seed = (knex, Promise) => Promise.join(
  // Deletes ALL existing entries
  knex('user').del(),
  // Inserts seed entries
  knex('user').insert([
    { user_id: 1, name: 'admin', email: 'andrew@pionize.com', password: User.hashPasswordSync('admin'), status: 'active', role: 'admin' },
    { user_id: 2, name: 'guest', email: 'guest@pionize.com', password: User.hashPasswordSync('guest'), status: 'active', role: 'user' },
  ]),
);

