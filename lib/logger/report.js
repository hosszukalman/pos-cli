const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://36aa7321636447dc9e629e0ae9ab9ad0@sentry.io/1491332',
  release: require('../../package.json').version
});

Sentry.configureScope(scope => {
  scope.setExtra('platform', process.platform);
  scope.setExtra('nodeVersion', process.version);
  scope.setExtra('shell', process.env.SHELL);
});

const setExtras = o => {
  if (o && o.extras) {
    Sentry.configureScope(scope => {
      for (let extra in o.extras) {
        scope.setExtra(o.extras[extra].key, o.extras[extra].value);
      }
    });
  }
};

const error = (error, opts) => {
  if (process.env.CI) {
    return;
  }

  setExtras(opts);

  Sentry.captureException(error);
};

const message = (message, opts) => {
  if (process.env.CI) {
    return;
  }

  setExtras(opts);

  Sentry.captureMessage(message);
};

module.exports = { error, message };