const constraints = {};

/**
 * Login
 */
constraints.login = {
  email: {
    presence: true,
  },
  password: {
    presence: true,
  },
};

export default constraints;
