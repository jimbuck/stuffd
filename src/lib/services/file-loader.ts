import { readFileSync } from 'fs';
import { transpileModule, ScriptTarget, ModuleKind } from 'typescript';

const requireFromString: (js: string, filepath?: string) => any = require('require-from-string');

export function loadFile<T>(path: string, verbose: boolean = false): T {
  let script = readFileSync(path, { encoding: 'utf8' });

  if (path.endsWith('.ts')) {
    let result = transpileModule(script, {
      compilerOptions: {
        target: ScriptTarget.ES2015,
        module: ModuleKind.CommonJS,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        lib: ['es2016']
      }
    });

    if (verbose) {
      console.log(JSON.stringify(result.diagnostics, null, 4));
    }

    script = result.outputText;
  }

  return requireFromString(script, path);
}