import { Activator } from './activator';
import { Lookup, Constructor, GeneratedArray } from '../models/types';
import { CollectionBuilder } from '../builders/collection-builder';

export class Context {

    private _activator: Activator;

    constructor(seed?: number) {
        this._activator = new Activator(seed);
    }

    public get seed(): number {
        return this._activator.seed;
    }

    public create<T=any>(Type: Constructor<T>, count: number, constants: Lookup<any> = {}): GeneratedArray<T> {
        return new CollectionBuilder(this._activator).create<T>(Type, count, constants);
    }

    public using(data: Lookup<GeneratedArray>): CollectionBuilder {
        return new CollectionBuilder(this._activator).using(data);
    }

    public cross(data: Lookup<GeneratedArray>): CollectionBuilder {
        return new CollectionBuilder(this._activator).cross(data);
    }

    public clear(): void {
        this._activator.clear();
    }

    public reset(newSeed?: number): void {
        this._activator.reset(newSeed);
    }

    public data(): Lookup {
        let copy: Lookup = {};

        this._activator.data.forEachKey(id => {
            const Type = this._activator.types[id];
            copy[id] = this._activator.data.get(id).map(item => new Type(item));
        });

        return copy;
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

        return JSON.stringify(this._activator.data, null, space);
    }
}