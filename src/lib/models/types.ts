
import { Model } from '../builders/model';

export const Enum = Symbol('jimmyboh.stuff.enum');
export const Index = Symbol('jimmyboh.stuff.index');
export const Guid = Symbol('jimmyboh.stuff.guid');

export type Constructor<T> = { new(): T; };
export type StoredEnum = { names: string[], values: number[] };
export type TypeDefinition = Function | Symbol | Model;

export type PropertySelector<TParent, TChild> = (target: TParent) => TChild;
export type CollectionSelector<TParent, TChild> = PropertySelector<TParent, Array<TChild>>;
