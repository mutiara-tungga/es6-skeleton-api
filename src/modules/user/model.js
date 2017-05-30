import bcrypt from 'bcrypt';
import config from '../../../config';
import core from '../../modules/core';

const bookshelf = core.mysql.connect(config.knex);

bookshelf.plugin('pagination');

// used by bcrypt to generate new salt
// 8 rounds will produce about 40 hashes per second on a 2GHz core
// see: https://www.npmjs.com/package/bcrypt
const SALT_ROUND = 8;

export const UserRoles = {
  ROLE_ADMIN: 'admin',
  ROLE_USER: 'user',
};


export const UserStatus = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
};

export const Status = UserStatus;

class UserModel extends bookshelf.Model {
  // eslint-disable-next-line class-methods-use-this
  get tableName() {
    return 'users';
  }
  // eslint-disable-next-line class-methods-use-this
  get idAttribute() {
    return 'id';
  }
  // eslint-disable-next-line class-methods-use-this
  get hasTimestamps() {
    return false;
  }

  /**
   * Create password hash from plain text
   * @param {string} str
   */
  static async hashPassword(str) {
    return await bcrypt.hash(str, SALT_ROUND);
  }

  /**
   * Create password hash from plain text synchronously
   * @param {string} str
   */
  static hashPasswordSync(str) {
    return bcrypt.hashSync(str, SALT_ROUND);
  }

  static async getById(idReq) {
    return await this.where({ id: idReq }).fetch();
  }

  static async getByEmail(emailReq) {
    return await this.where({ email: emailReq }).fetch();
  }

  /**
   * Compare plain password with it's hashed password
   * @param {string} plain
   * @return {bool}
   */
  checkPassword(plain) {
    return bcrypt.compareSync(plain, this.get('password'));
  }

  static async createUser(user) {
    user.password = bcrypt.hashSync(user.password, SALT_ROUND);
    return await new UserModel(user).save();
  }

  static async updateById(idReq, newData) {
    return await new UserModel({ id: idReq })
    .save(newData, { patch: true });
  }
}

export const User = UserModel;
