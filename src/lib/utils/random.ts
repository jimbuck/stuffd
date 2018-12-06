import { Chance } from 'chance';
import * as RandExp from 'randexp';
import { Lookup } from '../models/types';

export class Random {

  private _chance: Chance.Chance;

  private _patternCache: Lookup<RandExp> = {};

  constructor(seed?: number) {
    if (typeof seed === 'undefined') seed = (Date.now() + Math.floor(Math.random() * 9999));
    this._chance = new Chance(seed);
  }

  public get seed(): number {
    return this._chance.seed as number;
  }

  public float(min: number, max: number, fixed: number = 8): number {

    return this._chance.floating({ min, max, fixed });
  }

  public int(min: number, max: number): number {
    return this._chance.integer({ min, max });
  }

  public bool(truthRate: number = 0.5): boolean {
    let val = this.float(0, 1);
    return val < truthRate;
  }

  public date(min: Date, max: Date): Date {
    let minVal = min.valueOf();
    let ms = this.int(0, max.valueOf() - minVal);

    return new Date(minVal + ms);
  }

  public guid(): string {
    return this._chance.guid();
  }

  public string(length?: number): string;
  public string(regex: RegExp): string;
  public string(regex?: number | RegExp): string {
    if (!(regex instanceof RegExp)) {
      return this._chance.string({ length: regex || 8, pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' });
    } else {
      let regexId = regex.toString();
      // Cache the regex for faster usage...
      if (!this._patternCache[regexId]) {
        let randExp = new RandExp(regex);
        // Override the randInt function to use out seeded function...
        randExp.randInt = (from, to) => this.int(from, to);
        this._patternCache[regexId] = randExp;
      }

      return this._patternCache[regexId].gen();
    }
  }

  public custom<T>(fn: (options: Chance.Chance) => T): T {
    return fn(this._chance);
  }

  public pick<T>(choices: T[]): T {
    if (choices.length < 1) throw new Error(`No choices available to pick from!`);
    return choices[this._chance.integer({ min: 0, max: (choices.length - 1) })];
  }
}