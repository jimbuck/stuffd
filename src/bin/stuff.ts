const meow: (options: string | {}, minimistOptions?: {}) => { inputs: Array<string>, flags: {} } = require('meow');
import { Context } from '../lib/builders/context';
import { Lookup } from '../lib/models/dictionary';
import { FileLoader } from '../lib/cli/file-loader';

// Process:
//  - Init service
//  - Load tasks from file
//  - Run specified task

const fileLoader = new FileLoader();
const currDir = process.cwd();

const cli = meow(``, {});

// TODO: Init the service...
fileLoader.load<Context>(currDir).then((ctx) => {
  
  // Run the specified tasks...

});