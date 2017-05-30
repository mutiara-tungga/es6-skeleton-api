import _ from 'lodash';
import validate from 'validate.js';
import jwt from 'jsonwebtoken';
import constraints from './validation';
import utils from '../../../common/utils';
import { jwt as jwtOptions } from '../../../config';

export const ROLE_ALL = '*';

/**
 * Auth middleware
 * @param {array} roles
 * @param {string|function} failedCb
 */
export function auth(roles, failedCb) {
  const reject = (req, res, next) => {
    if (utils.isFunction(failedCb)) return failedCb(req, res);
    const err = new Error('Access denied.');
    return next(err);
  };

  return (req, res, next) => {
    if (req.isAuthenticated()) {
      if (!roles || roles === ROLE_ALL) return next();

      roles = utils.isArray(roles) ? roles : [roles];
      const user = req.user || {};
      // fix role
      if (_.includes(roles, user.role)) return next();
    }

    return reject(req, res);
  };
}
// FOR VALIDATE CREATE NEW USER
export function validateCreateNew() {
  return (req, res, next) => {
    const hasError = validate(req.body, constraints.createNew);
    if (hasError) {
      next(hasError);
    }
    next();
  };
}
/**
 * Login form validation middleware
 */
export function validateLogin() {
  return (req, res, next) => {
    const hasError = validate(req.body, constraints.login);
    if (hasError) {
      next(hasError);
    }
    next();
  };
}

// FOR VALIDATE TOKEN
export function validateToken() {
  return (req, res, next) => {
    const token = req.headers.auth;
    if (!token) {
      const err = new Error('No token');
      next(err);
    }
    jwt.verify(token, jwtOptions.secretOrKey, (err, decoded) => {
      if (err) {
        next(err);
      }
      req.decoded = decoded;
      next();
    });
  };
}

export function validateForgotPassword() {
  return (req, res, next) => {
    const hasError = validate(req.body, constraints.forgotPassword);
    if (hasError) {
      next(hasError);
    }
    next();
  };
}

export function validateResetPassword() {
  return (req, res, next) => {
    const hasError = validate(req.body, constraints.resetPassword);
    if (hasError) {
      next(hasError);
    }
    next();
  };
}
