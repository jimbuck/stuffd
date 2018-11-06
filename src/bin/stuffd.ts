#!/usr/bin/env node

import { resolve as resolvePath } from 'path';
import { existsSync as fileExistsSync, writeFileSync } from 'fs';
import * as yargs from 'yargs';

import { Stuffd, Context } from '../index';
import { breakPromise } from '../lib/utils/extensions';
import { Lookup } from '../lib/models/types';

const DEFAULT_CONFIG_FILENAME = 'stuffd.ts';

require('ts-node').register({
  transpileOnly: true,
  skipProject: true,
  compilerOptions: {
    target: 'es6',
    module: 'commonjs',
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    inlineSourceMap: true,
    removeComments: false,
    allowJs: false,
    lib: ['es2016']
  }
});

yargs
  .scriptName('stuffd')
  .wrap(120)
  .usage('$0 <cmd> [args]')
  .command('init [file]', 'Creates a new stuffd file.', init =>
    init.positional('file', {
      type: 'string',
      normalize: true,
      default: DEFAULT_CONFIG_FILENAME,
      describe: 'The name of the stuffd config file.'
    }), ({ file }) => {
      if (file.toLowerCase().endsWith('.js')) {
        writeFileSync(file, `
const { Stuffd } = require('stuffd');

Stuffd.task('default', (ctx, args) => {

});
`);
      } else {
        writeFileSync(file, `
import { Stuffd } from 'stuffd';

Stuffd.task('default', (ctx, args) => {

});
`);
      }
    })
  .command('run [task]', 'Executes the specified task.', run => run
    .positional('task', {
      type: 'string',
      describe: 'The name of the task defined in the stuffd configuration file.'
    })
    .option('config', {
      type: 'string',
      alias: 'c',
      normalize: true,
      default: DEFAULT_CONFIG_FILENAME,
      describe: 'Path to the stuffd configuration file.'
    })
    .option('seed', {
      type: 'number',
      alias: 's',
      describe: 'The starting seed for the PRNG.'
    }),
    async ({ config, task, seed, _ }) => {
      configureAndLoad(config);
      let args = yargs(_.slice(1)).argv;
      delete args['$0'];
      await Stuffd.run(task, { seed, args });
    }
  )
  .command('create', 'Creates the specifics models.', create => create
    .option('models', {
      alias: 'm',
      type: 'array',
      describe: 'The name of the task defined in the stuffd configuration file.',
      demand: 'You must specify at least one model to generate!'
    })
    .option('config', {
      type: 'string',
      alias: 'c',
      normalize: true,
      default: DEFAULT_CONFIG_FILENAME,
      describe: 'Path to the stuffd configuration file.'
    })
    .option('seed', {
      type: 'number',
      alias: 's',
      describe: 'The starting seed for the PRNG.'
    })
    .option('formatted', {
      type: 'boolean',
      alias: 'f',
      describe: 'Format the JSON.'
    }),
    async ({ config, seed, models, formatted, _ }) => {
      const entries = toPairs(models);

      const moduleExports = configureAndLoad(config);

      const ctx = new Context(seed);

      entries.forEach(entry => {
        const Model = moduleExports[entry.type];
        // Only create models
        if (typeof Model === 'function') {
          ctx.create(Model, entry.count);
        }
      });

      const { promise, resolve, reject } = breakPromise();

      process.stdout.write(ctx.json(formatted ? '  ' : null), (err: any) => err ? reject(err) : resolve());

      await promise;
    }
  )
  .help()
  .argv;

function configureAndLoad(config: string) {
  config = resolvePath(config || DEFAULT_CONFIG_FILENAME);

  if (!fileExistsSync(config)) throw new Error(`No config file found at '${config}'!`);
  
  return require(config) as Lookup<any>;
}

function toPairs(arr: string[]) {
  const groups = [];

  for (let i = 0; i < arr.length; i += 2) {
    groups.push({
      type: arr[i],
      count: parseInt(arr[i + 1], 10)
    });
  }
  return groups;
}