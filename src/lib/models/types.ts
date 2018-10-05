
import { ModelBuilder } from '../builders/model-builder';

export const Enum = Symbol('jimmyboh.stuff.enum');
export const Index = Symbol('jimmyboh.stuff.index');
export const Guid = Symbol('jimmyboh.stuff.guid');

export type Constructor<T> = { new(): T; };
export type StoredEnum = { names: string[], values: number[] };
export type TypeReference<T=any> = Constructor<T> | ModelBuilder | Symbol | Function;

export type PropertySelector<TParent, TChild> = (target: TParent) => TChild;
export type CollectionSelector<TParent, TChild> = PropertySelector<TParent, Array<TChild>>;
