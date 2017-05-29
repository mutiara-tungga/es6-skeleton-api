import express from 'express';
import passport from 'passport';
import { UserController } from './controller';
import core from '../core';
import { apiResponse } from '../core/middleware';

const routes = express.Router();
const { wrap } = core.utils;

/**
 * GET /profile/:id*?
 * View user profile
 */
routes.get('/user/:id*?',
  passport.authenticate('jwt', {}),
  wrap(UserController.getUser),
  apiResponse());

export default routes;
