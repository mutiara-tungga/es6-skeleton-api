import jwt from 'jsonwebtoken';
import randomstring from 'randomstring';

import { User } from './model';
// import { jwt as jwtOptions } from '../../../config';
import config from '../../../config';

export const UserController = {};
export default { UserController };

/**
 * View user profile
 */
UserController.getUser = async (req, res, next) => {
  let profile = req.user;
  if (req.params.id) {
    profile = await User.getById(req.params.id);
  }

  if (!profile) {
    const err = new Error('Invalid user');
    return next(err);
  }
  if (req.route.path === '/user/login') {
    const payload = { user_id: profile.user_id };
    const token = jwt.sign(payload, config.secretOrKey);
    profile.token = token;
  }
  delete profile.password;
  req.resData = {
    status: true,
    message: 'User Data',
    data: profile,
  };
  return next();
};

UserController.newUser = async (req, res, next) => {
  const body = req.body;
  const activationCode = randomstring.generate(20);
  const linkActivation = `${config.baseurl}/user/activation?code=${activationCode}&email=${body.email}`;
  const user = {
    first_name: body.firstName,
    last_name: body.lastName,
    email: body.email,
    password: body.password,
    activation_code: activationCode,
  };
  const save = await User.createUser(user);
  if (save) {
    const err = new Error('Create new user failed');
    return next(err);
  }
  
  req.resData = {
    status: true,
    message: 'User Data',
    data: save,
  };
};
