
import { Lookup, ListBucket } from '../models/dictionary';
import { ModelBuilder } from './model-builder';
import { Activator } from '../services/activator';
import { Constructor } from '../models/types';
import { CollectionReference, GeneratedArray } from './collection-reference';

import { getModelId } from '../services/meta-reader';

export class Context {

    private _activator: Activator;
    private _data: ListBucket;

    constructor(seed?: number) {
        this._activator = new Activator(seed);
        this._data = new ListBucket();
    }

    public get seed() {
        return this._activator.seed;
    }

    public create<T>(Type: Constructor<T>, count: number, constants: Lookup<any> = {}): GeneratedArray<T> {
        let typeId = getModelId(Type);
        let data = new CollectionReference(this._activator).create<T>(Type, count, constants);
        return this._data.add(typeId, data);
    }

    public using(data: Lookup<GeneratedArray>) {
        return new CollectionReference(this._activator).using(data);
    }

    public cross(data: Lookup<GeneratedArray>) {
        return new CollectionReference(this._activator).cross(data);
    }

    public clear(): void {
        this._data.clear();
    }

    public data(): Lookup<any> {
        return JSON.parse(this.json());
    }

    public json(): string;
    public json(formatted: boolean): string;
    public json(space: string): string;
    public json(spaceOrFlag: string | boolean = false): string {
        let space: string;
        if (typeof spaceOrFlag === 'boolean') {
            if(spaceOrFlag) space = '\t';
        } else {
            space = spaceOrFlag;
        }

        return JSON.stringify(this._data, null, space);
    }

    public toString(): string {
        return `Context (seed: ${this.seed})`;
    }
}