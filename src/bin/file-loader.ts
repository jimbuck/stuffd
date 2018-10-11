import { readFileSync } from 'fs';
import { join } from 'path';
import { transpileModule, ScriptTarget, ModuleKind } from 'typescript';

const requireFromString: (js: string, filepath?: string) => any = require('require-from-string');

export class FileLoader {

  constructor(private _filename: string = 'stuff.ts', private _verbose: boolean = false) {
    
  }

  public load<T>(path: string, encoding: string = 'utf8'): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        let script = readFileSync(join(path, this._filename), { encoding });
    
        if (path.endsWith('.ts')) {
          let result = transpileModule(script, {
            compilerOptions: {
              target: ScriptTarget.ES5,
              module: ModuleKind.CommonJS,
              experimentalDecorators: true,
              emitDecoratorMetadata: true
            }
          });

          if (this._verbose) {
            console.log(JSON.stringify(result.diagnostics, null, 4));
          }

          script = result.outputText;
        }

        resolve(requireFromString(script, path));
      } catch (err) {
        reject(err);
      }
    });
  }
}