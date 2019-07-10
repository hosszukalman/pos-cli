#!/usr/bin/env node

const program = require('commander'),
  spawn = require('child_process').spawn,
  command = require('../lib/command'),
  fetchAuthData = require('../lib/settings').fetchSettings,
  logger = require('../lib/logger');

const DEFAULT_CONCURRENCY = 3;

program
  .arguments('[environment]', 'Name of environment. Example: staging')
  .option('-c --config-file <config-file>', 'config file path', '.marketplace-kit')
  .option('--concurrency <number>', 'maximum concurrent connections to the server', DEFAULT_CONCURRENCY)
  .action((environment, params) => {
    process.env.CONFIG_FILE_PATH = params.configFile;
    const authData = fetchAuthData(environment, program);
    const env = Object.assign(process.env, {
      MARKETPLACE_EMAIL: authData.email,
      MARKETPLACE_TOKEN: authData.token,
      MARKETPLACE_URL: authData.url,
      CONCURRENCY: process.env.CONCURRENCY || params.concurrency
    });
    const p = spawn(command('pos-cli-watch'), [], { stdio: 'inherit', env: env });

    p.on('close', code => {
      if (code === 1) logger.Error('Sync failed.', { exit: false });
    });

    p.on('error', logger.Error);
  });

program.parse(process.argv);
