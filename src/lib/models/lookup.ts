
export type ILookup<T> = { [key: string]: T };

export class Lookup<T> {
  
  private _keys: Set<string>;
  private _store: ILookup<T>  = {};

  constructor(defaultStore: ILookup<T> = {}) {
    this._store = defaultStore || {};
    this._updateKeys();
  }

  public get(key: string): T {
    let val = this._store[key];

    if (typeof val === 'undefined') {
      this._updateKeys();
    }

    return val;
  }

  public hasKey(key: string): boolean {
    return this._keys.has(key);
  }

  public getKey(item: T): string {
    for (let key of this._keys) {
      if (this._store[key] === item) {
        return key;
      }
    }

    return;
  }

  public getOrAdd(key: string, callback: () => T): T {
    if (!this.hasKey(key)) {
      this.set(key, callback());
    }

    return this.get(key);
  }

  public set(key: string, val: T): this {
    this._store[key] = val;
    this._updateKeys();

    return this;
  }

  public has(item: T): boolean {
    for (let key of this._keys) {
      if (this._store[key] === item) {
        return true;
      }
    }

    return false;
  }

  public delete(key: string): this {
    
    if (!this.hasKey(key)) {
      return this;
    }

    this._store[key] = null;
    this._updateKeys();
    return this;    
  }  

  public forEach(callback: (value: T, key: string) => void, thisArg?: any): void {
    this._keys.forEach((key) => callback(this.get(key), key), thisArg);
  }

  public map<TResult>(callback: (value: T, key: string) => TResult, thisArg?: any): Array<TResult> {
    let result: Array<TResult> = [];

    this.forEach((item, key) => result.push(callback(item, key)), thisArg);

    return result;
  }

  public find(callback: (value: T, key: string) => boolean, thisArg?: any): T {
    for (let key of this._keys) {
      let item = this.get(key);
      if (callback(item, key)) {
        return item;
      }
    }

    return;
  }

  public findKey(callback: (value: T, key: string) => boolean, thisArg?: any): string {
    for (let key of this._keys) {
      let item = this.get(key);
      if (callback(item, key)) {
        return key;
      }
    }

    return;
  }

  private _updateKeys(): void {
    this._keys = new Set<string>();
    Object.keys(this._store).forEach(key => {
      if (key && this._store[key]) {
        this._keys.add(key);
      }
    });
  }
}