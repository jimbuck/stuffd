import { Readable as ReadableStream } from 'stream';

import { Activator } from './activator';
import { Lookup, Constructor, GeneratedArray } from '../models/types';
import { CollectionBuilder } from '../builders/collection-builder';
import { Random } from '../utils/random';

/**
 * Used to generate instances of models and export the data.
 */
export class Context {

    private _activator: Activator;

    /**
     * Creates a new context used to instantiate new objects.
     * @param seed Provided a previously used seed to the PRNG to generate identical results.
     */
    constructor(seed?: number) {
        this._activator = new Activator(seed);
    }

    /**
     * Gets the seed used by the PRNG.
     */
    public get seed(): number {
        return this._activator.seed;
    }

    /**
     * Gets the random utility instance used to generate values.
     */
    public get rand(): Random {
        return this._activator.rand;
    }

    /**
     * Creates a collection of the given type.
     * @param Type The type to instantiate.
     * @param count The number of items to create.
     * @param constants Properties that should be set on every single instance.
     */
    public create<T=any>(Type: Constructor<T>, count: number, constants: Lookup<any> = {}): GeneratedArray<T> {
        return new CollectionBuilder(this._activator).create<T>(Type, count, constants);
    }

    /**
     * Begins the creation of a collection by specifying foreign key lookups.
     * @param data An object hash with properties for each ref property. When a 
     */
    public using(data: Lookup<GeneratedArray>): CollectionBuilder {
        return new CollectionBuilder(this._activator).using(data);
    }

    /**
     * Begins the creation of a collection by specifying cross-join definitions.
     * @param data An object hash with properties for each ref property.
     */
    public cross(data: Lookup<GeneratedArray>): CollectionBuilder {
        return new CollectionBuilder(this._activator).cross(data);
    }

    /**
     * Removes all generated data from the context.
     */
    public clear(): void {
        this._activator.clear();
    }

    /**
     * Removes all generated data from the context and resets the PRNG.
     * @param newSeed Optionally provide a new seed to use. If not specified the PRNG is reset to original seed (results will be identical).
     */
    public reset(newSeed?: number): void {
        this._activator.reset(newSeed);
    }

    /**
     * Returns a new object hash of every instance created group by type name.
     */
    public data(): Lookup {
        let copy: Lookup = {};

        this._activator.data.forEachKey(id => {
            const Type = this._activator.types[id];
            copy[id] = this._activator.data.get(id).map(item => new Type(item));
        });

        return copy;
    }

    /**
     * Returns all of the data in unformatted JSON.
     */
    public json(): string;
    /**
     * Returns all of the data as optionally formatted JSON.
     * @param formatted `true` will format the JSON using `'\t'`, `false` will return the JSON unformatted.
     */
    public json(formatted: boolean): string;
    /**
     * Returns all of the data in formatted JSON.
     * @param space Used as the indentation characters for formatting.
     */
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

    /**
     * Returns a new readable stream of objects (or standard strings if specified) in the order that they were created.
     * @param objectMode `true` (default) will enable objectMode on the stream. `false` will stream serialized JSON separated by newlines. Defaults to `true`.
     */
    public stream(objectMode: boolean = true): NodeJS.ReadableStream {
        const items = this._activator.data.ledger;
        const stream = new ReadableStream({
            objectMode,
            read() {
                let item = items.shift();
                
                if (!item) {
                    return this.push(null);
                }

                let chunk: any = { type: item.key, value: item.value };
                if (!objectMode) chunk = `${JSON.stringify(chunk)}\n`;
                
                return this.push(chunk);
            }
        });

        return stream;
    }
}