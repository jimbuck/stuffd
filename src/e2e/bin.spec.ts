import { join as joinPath } from 'path';
import { readFile, mkdir, unlink } from 'fs';
import { exec } from 'child_process';

import { test } from 'ava';

import { League, Shopper, Department, Product, CartItem } from './bin.config';

type CreationPair = [string, number];
const EMPTY_STRING = '';
const e2eDir = joinPath(__dirname, '.');
const tempDir = joinPath(__dirname, '../../temp');
const binDir = joinPath(__dirname, '../../dist/bin/stuffd.js');
const binConfig = joinPath(e2eDir, './bin.config.js');

test.before('Setup temp dir', async (t) => {
  await mkdirAsync(tempDir).catch(() => { });
});

test.beforeEach('Create cleanup array', t => {
  t.context.cleanup = [];
});

test.afterEach('Create cleanup array', async (t) => {
  let cleanup = t.context.cleanup as string[] || [];
  for (let path of cleanup) {
    t.log(`Deleting '${path}'...`);
    await delAsync(path).catch(() => { });
  }
});

test(`init command creates the default TS config file`, async (t) => {
  const expectedConfigPath = joinPath(tempDir, 'stuffd.ts');
  t.context.cleanup.push(expectedConfigPath);
  await runStuffdInit();
  const contents = await readAsync(expectedConfigPath);
  t.true(contents.startsWith('import'));
});
test(`init command accepts a different TS filename`, async (t) => {
  const expectedConfigPath = _getTempFile('config', '.ts');
  t.context.cleanup.push(expectedConfigPath);
  await runStuffdInit(expectedConfigPath);
  const contents = await readAsync(expectedConfigPath);
  t.true(contents.startsWith('import'));
});
test(`init command accepts a JS filename`, async (t) => {
  const expectedConfigPath = _getTempFile('config', '.js');
  t.context.cleanup.push(expectedConfigPath);
  await runStuffdInit(expectedConfigPath);
  const contents = await readAsync(expectedConfigPath);
  t.true(contents.startsWith('const'));
});
test(`run command executes the task`, async (t) => {
  const seed = Math.floor(Math.random() * 99999);
  const result: { League: League[] } = await runStuffdRun(seed, 'nested');
  const leagues = result.League;
  t.is(leagues.length, 2);
  t.truthy(leagues[0].chairmen);
  t.true(leagues[0].teams.length > 0);
  t.truthy(leagues[0].teams[0].city);
  t.truthy(leagues[0].teams[0].mascot);
  t.truthy(leagues[0].teams[0].region);
  t.truthy(leagues[0].teams[0].owner);
  t.truthy(leagues[0].teams[0].players.length > 0);
});
test(`run command accepts a seed`, async (t) => {
  const seed = Math.floor(Math.random() * 99999);
  const result1 = await runStuffdRun(seed, 'nested');
  const result2 = await runStuffdRun(seed, 'nested');
  t.deepEqual(result1, result2);
});
test(`run command executes requires a task name`, async (t) => {
  const seed = Math.floor(Math.random() * 99999);
  let failedToRun = await runStuffdRun(seed).then(() => false, () => true);
  t.true(failedToRun);
});
test(`create command generates nested data`, async (t) => {
  const seed = Math.floor(Math.random() * 99999);
  const result: { League: League[] } = await runStuffdCreate(seed, [['League', 2]]);
  const leagues = result.League;
  t.is(leagues.length, 2);
  t.truthy(leagues[0].chairmen);
  t.true(leagues[0].teams.length > 0);
  t.truthy(leagues[0].teams[0].city);
  t.truthy(leagues[0].teams[0].mascot);
  t.truthy(leagues[0].teams[0].region);
  t.truthy(leagues[0].teams[0].owner);
  t.truthy(leagues[0].teams[0].players.length > 0);
});
test(`create command generates relational data`, async (t) => {
  const seed = Math.floor(Math.random() * 99999);
  const result: {
    'Shopper': Shopper[],
    'Department': Department[],
    'Product': Product[],
    'CartItem': CartItem[],
  } = await runStuffdCreate(seed, [['Shopper', 6], ['Department', 3], ['Product', 20], ['CartItem', 25]]);
  const { Shopper: shoppers, Department: departments, Product: products, CartItem: cartItems } = result;
  
  t.is(shoppers.length, 6);
  t.is(departments.length, 3);
  t.is(products.length, 20);
  t.is(cartItems.length, 25);
  t.true(products.some(p => p.id === cartItems[0].productId));
  t.true(shoppers.some(s => s.id === cartItems[0].shopperId));
});

function runStuffdInit(filename?: string) {
  return _execAsync(filename ? `init "${filename}"` : 'init', tempDir);
}

async function runStuffdRun(seed: number, task?: string) {
  let file = _getTempFile('output', '.json');

  if (task) {
    await _execAsync(`--config "${binConfig}" --seed ${seed} run ${task} -- --file "${file}"`, e2eDir); 
  } else {
    await _execAsync(`--config "${binConfig}" --seed ${seed} run -- --file "${file}"`, e2eDir);
  }

  let result = require(file);
  await delAsync(file);
  return result;
}

async function runStuffdCreate(seed: number, pairs: CreationPair[]) {
  let pairStr = pairs.map(p => `${p[0]} ${p[1]}`).join(' ');
  let json = await _execAsync(`--config "${binConfig}" --seed ${seed} create --models ${pairStr}`, e2eDir);
  return JSON.parse(json);
}

function _getTempFile(prefix: string, ext: string) {
  return joinPath(tempDir, `${prefix}-${Math.random().toString(16).substring(2, 8).toUpperCase()}${ext}`);
}

function _execAsync(args: string, cwd: string) {
  return new Promise<string>((resolve, reject) => {
    exec(`node ${binDir} ${args}`, { cwd }, (err, stdout) => err ? reject(err) : resolve(stdout));
  });
}

function mkdirAsync(path: string) {
  return new Promise<void>((resolve, reject) => {
    mkdir(path, (err) => err ? reject(err) : resolve());
  });
}

function readAsync(path: string) {
  return new Promise<string>((resolve, reject) => {
    readFile(path, { encoding: 'utf8' }, (err, contents) => err ? reject(err) : resolve(contents.trim()));
  });
}

function delAsync(path: string) {
  return new Promise<void>((resolve, reject) => {
    unlink(path, (err) => err ? reject(err) : resolve());
  });
}