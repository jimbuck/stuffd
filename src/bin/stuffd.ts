import { join as joinPath } from 'path';
import { existsSync as fileExistsSync } from 'fs';
import commander from 'commander';

import { Stuffd, Context } from '..';
import { loadFile } from '../lib/services/file-loader';
import { Lookup } from '../lib/models/types';

const currDir = process.cwd();

commander
  .command('[options] run <task>')
  .option('-c, --config <config>', 'Path to the js/ts config file.')
  .option('-s, --seed <seed>', 'The starting seed for the PRNG.')
  .option('-v, --verbose', 'Enable verbose logging.')
  .action(async (task, { config, seed, verbose }) => {
    configureAndLoad(config, verbose);
    await Stuffd.run(task, { seed });
  });

commander
  .command('[options] create <pairs...>')
  .option('-c, --config', 'Path to the js/ts config file.')
  .option('-s, --seed <seed>', 'The starting seed for the PRNG.')
  .option('-v, --verbose', 'Enable verbose logging.')
  .action(async (pairs, { config, seed, verbose }) => {
    const models = toPairs(pairs);

    const moduleExports = configureAndLoad(config, verbose);

    const ctx = new Context(seed);

    models.forEach(entry => {
      const Model = moduleExports[entry.type];
      ctx.create(Model, entry.count);
    });

    process.stdout.write(ctx.json());
  });

commander.parse(process.argv);

function configureAndLoad(config: string, verbose: boolean) {
  config = config || joinPath(currDir, 'stuffd.ts');

    if (fileExistsSync(config)) console.error(`No config file found at '${config}'!`);
    return loadFile<Lookup<any>>(config, verbose);
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