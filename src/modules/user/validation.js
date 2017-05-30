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

constraints.createNew = {
  firstName: {
    presence: true,
  },
  lastName: {
    presence: true,
  },
  email: {
    presence: true,
    email: {
      message: "doesn't look like a valid email",
    },
  },
  password: {
    presence: true,
  },
};

export default constraints;
