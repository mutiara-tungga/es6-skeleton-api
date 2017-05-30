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
    const token = jwt.sign(payload, config.jwt.secretOrKey);
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

// FOR CREATE NEW USER
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
  delete saveUser.password;
  delete saveUser.activation_code;
  req.resData = {
    status: true,
    message: 'User Data',
    data: saveUser,
  };
  return next();
};

// FOR ACTIVATE ACCOUNT
UserController.accountActivation = async (req, res, next) => {
  const code = req.query.code;
  const email = req.query.email;

  const user = await User.getByEmail(email);
  if (!user) {
    const err = new Error('User not found');
    return next(err);
  }

  if (user.get('activation_code') !== code) {
    const err = new Error('Code didn\'t match');
    return next(err);
  }

  const updateUser = await User.updateById(user.get('id'), { status: 1 });
  if (!updateUser) {
    const err = new Error('Activation Failed');
    return next(err);
  }
  delete updateUser.password;
  delete updateUser.activation_code;
  req.resData = {
    status: true,
    message: 'Activation success',
    data: updateUser,
  };
  return next();
};

// FOR LOGIN USE WITH JWT TOKEN
UserController.login = async (req, res, next) => {
  const emailReq = req.body.email;
  const passwordReq = req.body.password;
  const user = await User.getByEmail(emailReq);
  if (!user) {
    const err = new Error('User not found');
    return next(err);
  }
  if (user.get('status') !== 1) {
    const err = new Error('Please activate your account');
    return next(err);
  }
  const matchPassword = user.checkPassword(passwordReq);
  if (!matchPassword) {
    const err = new Error('Password did\'t match');
    return next(err);
  }
  const payload = user.get('id');
  const token = jwt.sign(payload, config.jwt.secretOrKey);
  req.resData = {
    status: true,
    message: 'Login success',
    data: { token },
  };
  return next();
};

// FOR PROFILE
UserController.profile = async (req, res, next) => {
  const id = req.decoded;
  const user = await User.getById(id);
  if (!user) {
    const err = new Error('User not found');
    next(err);
  }
  const profile = {
    firstName: user.get('first_name'),
    lastName: user.get('last_name'),
    email: user.get('email'),
  };

  req.resData = {
    status: true,
    message: 'Your profile',
    data: profile,
  };
  next();
};

