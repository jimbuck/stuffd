import { Lookup } from './types';

export class ListBucket {
  
  private _data: Lookup<any[]> = {};

  public get<T=any>(key: string): T[] {
    return (this._data[key] || []).slice();
  }

  public add<T=any>(key: string, items: T[]): T[] {
    let savedData = this.get<T>(key);
    savedData.push(...items);
    this._data[key] = savedData;
    return items;
  }

  public set<T=any>(key: string, items: T[]): T[] {
    this._data[key] = (items || []).slice();
    return items;
  }

  public clear() {
    this._data = {};
  }

  public forEachKey(cb: (key: string) => void): void {
    Object.keys(this._data).forEach(cb);
  }

  private toJSON() {
    return this._data;
  }
}