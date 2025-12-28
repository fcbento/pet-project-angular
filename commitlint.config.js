module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'ci', 'docs', 'style', 'refactor', 'test', 'revert', 'chore'],
    ],
  },
};
