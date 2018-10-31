import { Readable as ReadableStream } from 'stream';

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

    public stream(): NodeJS.ReadableStream;
    public stream(Type: Constructor<any>): NodeJS.ReadableStream;
    public stream(Type?: Constructor<any>): NodeJS.ReadableStream {
        if (Type) {
            return this._streamType(Type);
        } else {
            return this._streamAll();
        }
    }

    private _streamType(Type: Constructor<any>): NodeJS.ReadableStream {
        let items = this._activator.data.get<any>(Type.name);
        const stream = new ReadableStream({
            objectMode: true,
            read() {
                const item = items.shift();
                this.push(!item ? null : item);
            }
        });
        return stream;
    }

    private _streamAll(): NodeJS.ReadableStream {
        const types = Object.keys(this._activator.types);
        const data = this._activator.data;
        let currentType = types.shift();
        let items = data.get(currentType);
        const stream = new ReadableStream({
            objectMode: true,
            read() {
                let item = items.shift();
                while (!item && types.length > 0) {
                    currentType = types.shift();
                    items = data.get(currentType);
                }

                if (item) {
                    return this.push({
                        type: currentType,
                        value: item
                    });
                }

                return this.push(null);
            }
        });

        return stream;
    }
}