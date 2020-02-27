module.exports = {
  env: {
    browser: true,
    node: true
  },
  extends: ['airbnb', 'eslint:recommended', 'plugin:prettier/recommended'],
  rules: {
    'react/prop-types': 0,
    'react/destructuring-assignment': 0,
    'react/jsx-props-no-spreading': 0,
    'no-underscore-dangle': 0
  }
};
