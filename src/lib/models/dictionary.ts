export type Lookup<T> = { [key: string]: T };

export class ListBucket {
  
  private _data: Lookup<any[]> = {};

  public get<T>(key: string): T[] {
    return this._data[key] || [];
  }

  public add<T>(key: string, items: T[]): T[] {
    let savedData = this.get<T>(key);
    savedData.push(...items);
    this._data[key] = savedData;
    return items;
  }

  public set<T>(key: string, items: T[]): T[] {
    this._data[key] = items;
    return items;
  }

  public clear() {
    this._data = {};
  }

  private toJSON() {
    return this._data;
  }
}

export class Dictionary<T> {
  
  private _store: Lookup<T>  = {};

  constructor(defaultStore: Lookup<T> = {}) {
    this._store = defaultStore;
  }

  public get(key: string): T {
    return this._store[key];
  }

  public hasKey(key: string): boolean {
    return !!this._store[key];
  }
  
  public set(key: string, val: T): T {
    return this._store[key] = val;
  }

  public has(item: T): boolean {
    for (let key in this._store) {
      if (this._store[key] === item) {
        return true;
      }
    }

    return false;
  }

  public delete(key: string): void {
    
    if (!this.hasKey(key)) return;
  
    delete this._store[key];   
  }  

  public forEach(callback: (value: T, key: string) => void): void {
    for (let key in this._store) {
      callback(this.get(key), key);
    }
  }

  public map<TResult>(callback: (value: T, key: string) => TResult): Array<TResult> {
    let result: Array<TResult> = [];

    this.forEach((item, key) => result.push(callback(item, key)));

    return result;
  }

  public find(callback: (value: T, key: string) => boolean): T {
    for (let key in this._store) {
      let item = this.get(key);
      if (callback(item, key)) {
        return item;
      }
    }

    return;
  }

  public findKey(callback: (value: T, key: string) => boolean): string {
    for (let key in this._store) {
      let item = this.get(key);
      if (callback(item, key)) {
        return key;
      }
    }
  }
}