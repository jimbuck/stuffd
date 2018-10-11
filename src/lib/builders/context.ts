import { Activator } from '../services/activator';
import { Lookup, Constructor, GeneratedArray } from '../models/types';
import { CollectionBuilder } from './collection-builder';

import { getModelId } from '../services/meta-reader';

export class Context {

    private _activator: Activator;

    constructor(seed?: number) {
        this._activator = new Activator(seed);
    }

    public get seed() {
        return this._activator.seed;
    }

    public create<T>(Type: Constructor<T>, count: number, constants: Lookup<any> = {}): GeneratedArray<T> {
        let typeId = getModelId(Type);
        return new CollectionBuilder(this._activator).create<T>(Type, count, constants);
    }

    public using(data: Lookup<GeneratedArray>) {
        return new CollectionBuilder(this._activator).using(data);
    }

    public cross(data: Lookup<GeneratedArray>) {
        return new CollectionBuilder(this._activator).cross(data);
    }

    public clear(): void {
        this._activator.clear();
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

        return JSON.stringify(this._activator.data(), null, space);
    }

    public toString(): string {
        return `Context (seed: ${this.seed})`;
    }
}