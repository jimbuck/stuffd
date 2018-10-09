
import { ModelBuilder } from '../builders/model-builder';

export const Enum = Symbol('jimmyboh:stuff:enum');
export type Enum = typeof Enum;
export const Guid = Symbol('jimmyboh:stuff:guid');
export type Guid = typeof Guid;

export type Constructor<T=any> = { new(): T; };
export type StoredEnum = { names: string[], values: number[] };
export type ClassReference<T=any> = Constructor<T> | ModelBuilder;
export type TypeReference<T=any> = ClassReference<T> | Enum | Guid;

export type PropertySelector<TParent, TChild> = (target: TParent) => TChild;
export type CollectionSelector<TParent, TChild> = PropertySelector<TParent, Array<TChild>>;
