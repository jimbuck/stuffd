import { Chance } from 'chance';
import * as RandExp from 'randexp';

export class Rand {

  public readonly seed: number;

  private _rand: Chance.Chance;

  constructor(seed: number) {
    this.seed = seed;
    this._rand = new Chance(seed);
  }

  public nextFloat(min: number, max: number, fixed: number = 10): number {
    return this._rand.floating({ min, max, fixed });
  }

  public nextInt(min: number, max: number): number{
    return this._rand.integer({ min, max });
  }

  public nextBoolean(truthRate: number = 0.5): boolean {
    let val = this.nextFloat(0, 1);
    return val < truthRate;
  }

  public nextDate(min: Date, max: Date): Date {
    let minVal = min.valueOf();
    let ms = this.nextInt(0, max.valueOf() - minVal);

    return new Date(minVal + ms);
  }

  public nextGuid(): string {
    return this._rand.guid();
  }

  public nextString(length: number = 8): string {
    return this._rand.string({ length });
  }
  
  public chance<T>(fn: (options: Chance.Chance) => T ): T {
    return fn(this._rand);
  }

  public choice<T>(choices: T[]): T {
    return choices[this._rand.integer({ min: 0, max: (choices.length - 1) })];
  }

  public getPatternGenerator(pattern: RegExp): () => string;
  public getPatternGenerator(pattern: string, flags?: string): () => string;
  public getPatternGenerator(pattern: string | RegExp, flags?: string): ()=>string {
    let randExp = new RandExp(pattern, flags);
    return () => randExp.gen();
  }
}

