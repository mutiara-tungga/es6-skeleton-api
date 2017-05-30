import express from 'express';
// import passport from 'passport';
import { validateLogin } from './middleware';
import { UserController } from './controller';
import core from '../core';
import { apiResponse } from '../core/middleware';

const routes = express.Router();
const { wrap } = core.utils;

/**
 * GET /profile/:id*?
 * View user profile
 */
// routes.get('/user/:id*?',
//   passport.authenticate('local', {}),
//   wrap(UserController.getUser),
//   apiResponse());
routes.post('/user', wrap(UserController.newUser), apiResponse());
routes.get('/user/activation', wrap(UserController.accountActivation), apiResponse());
routes.post('/user/login', validateLogin(), wrap(UserController.login), apiResponse());
export default routes;
