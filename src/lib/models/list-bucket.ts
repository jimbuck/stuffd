import { Lookup } from './types';

export interface LedgerEntry<T=any> {
  key: string;
  value: T;
}

export class ListBucket {
  
  private _data: Lookup<any[]> = {};
  private _ledger: LedgerEntry[] = [];
  private _trackLedger: boolean;

  constructor(ledger: boolean = false) {
    this._trackLedger = ledger;
  }

  public get ledger() {
    return this._trackLedger ? this._ledger.slice() : null;
  }

  public get<T=any>(key: string): T[] {
    return (this._data[key] || []).slice();
  }

  public add<T=any>(key: string, items: T[]): T[] {
    let savedData = this.get<T>(key);
    savedData.push(...items);
    this._data[key] = savedData;
    if (this._trackLedger) this._ledger.push(...items.map(value => ({ key, value }) ));
    return items;
  }

  public clear() {
    this._data = {};
    if (this._trackLedger) this._ledger = [];
  }

  public forEachKey(cb: (key: string) => void): void {
    Object.keys(this._data).forEach(cb);
  }

  private toJSON() {
    return this._data;
  }
}