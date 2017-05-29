import jwt from 'jsonwebtoken';
import randomstring from 'randomstring';
import postmark from 'postmark';
import { User } from './model';
// import { jwt as jwtOptions } from '../../../config';
import config from '../../../config';

export const UserController = {};
export default { UserController };

const client = new postmark.Client(config.apiKeyPostmarkapp);
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
  const saveUser = await User.createUser(user);
  if (!saveUser) {
    const err = new Error('Create new user failed');
    return next(err);
  }
  client.sendEmail({
    From: config.postmarkappServiceSender,
    To: saveUser.get('email'),
    Subject: 'Account Activation',
    HtmlBody: `<html><body><p>Your Account: <br>
    - First Name : ${saveUser.get('first_name')} <br>
    - Last Name : ${saveUser.get('last_name')} <br>
    - Email : ${saveUser.get('email')} <br>
    - Password : ${body.password} <br>
    To activate your account visit this link:
    <a href='${linkActivation}'>Activate my account</a>
    </p><body></html>`,
  });
  req.resData = {
    status: true,
    message: 'User Data',
    data: saveUser,
  };
  return next();
};

UserController.accountActivation = async (req, res, next) => {
  console.log('aaa');
  const code = req.query.code;
  const email = req.query.email;

  const user = UserController.getByEmail(email);
  if (!user) {
    const err = new Error('User not found');
    return next(err);
  }

  if (user.activation_code !== code) {
    const err = new Error('Code didn\'t match');
    return next(err);
  }

  const updateUser = UserController.updateById(user.get('id'), { status: 1 });
  if (!updateUser) {
    const err = new Error('Activation Failed');
    return next(err);
  }

  req.resData = {
    status: true,
    message: 'User Data',
    data: updateUser,
  };
  return next();
};

