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

  public nextFloat(min: number, max: number, fixed: number = 8): number {

    return this._chance.floating({ min, max, fixed });
  }

  public nextInt(min: number, max: number): number {
    return this._chance.integer({ min, max });
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
    return this._chance.guid();
  }

  public nextString(length: number = 8): string {
    return this._chance.string({ length });
  }

  public chance<T>(fn: (options: Chance.Chance) => T): T {
    return fn(this._chance);
  }

  public choice<T>(choices: T[]): T {
    return choices[this._chance.integer({ min: 0, max: (choices.length - 1) })];
  }

  public nextPattern(regex: RegExp): string {
    let regexId = regex.toString();
    // Cache the regex for faster usage...
    if (!this._patternCache[regexId]) {
      let randExp = new RandExp(regex);
      // Override the randInt function to use out seeded function...
      randExp.randInt = (from, to) => this.nextInt(from, to);
      this._patternCache[regexId] = randExp;
    }

    return this._patternCache[regexId].gen();
  }
}