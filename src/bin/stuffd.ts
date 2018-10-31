#!/usr/bin/env node

import { join as joinPath } from 'path';
import { existsSync as fileExistsSync } from 'fs';
import * as commander from 'commander';

import { Stuffd, Context } from '../index';
import { breakPromise } from '../lib/utils/extensions';
import { Lookup } from '../lib/models/types';

const packageJson = require('../../package.json');

const currDir = process.cwd();

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

commander
  .version(packageJson.version, '-V, --version');

commander.command('run <task>')
  .option('-c, --config <path>', 'Path to the js/ts config file.')
  .option('-s, --seed <seed>', 'The starting seed for the PRNG.')
  .action(async (task, { config, seed }) => {
    configureAndLoad(config);
    await Stuffd.run(task, { seed });
  });

commander.command('create <pairs...>')
  .option('-c, --config <path>', 'Path to the js/ts config file.')
  .option('-s, --seed <seed>', 'The starting seed for the PRNG.')
  .option('-f, --formatted', 'Format the JSON.')
  .action(async (pairs, { config, seed, formatted }) => {
    const models = toPairs(pairs);

    const moduleExports = configureAndLoad(config);

    const ctx = new Context(seed);

    models.forEach(entry => {
      const Model = moduleExports[entry.type];
      // Only create models
      if (typeof Model === 'function') {
        ctx.create(Model, entry.count);
      }
    });

    const { promise, resolve, reject } = breakPromise();

    process.stdout.write(ctx.json(formatted ? '  ': null), (err: any) => err ? reject(err) : resolve());

    await promise;
  });

commander.parse(process.argv);

function configureAndLoad(config: string) {
  config = joinPath(currDir, config || 'stuffd.ts');

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