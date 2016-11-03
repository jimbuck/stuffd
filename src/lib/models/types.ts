
import { Model } from '../builders/model';

export const StuffMetadata = Symbol('jimmyboh.stuff.metadata');
export const Enum = Symbol('jimmyboh.stuff.enum');
export const Index = Symbol('jimmyboh.stuff.index');
export const Guid = Symbol('jimmyboh.stuff.guid');

export type Type = Function | Symbol | Model;

export type Lazy<T> = T | (() => T);

export function lazyVal<T>(lazy: Lazy<T>): T {
  return typeof lazy === 'function' ? lazy() : lazy;
}

export type PropertySelector<TParent, TChild> = (target: TParent) => TChild;
export type CollectionSelector<TParent, TChild> = PropertySelector<TParent, Array<TChild>>;

export interface FilterExpr<TModel> {
  (target: TModel): boolean;
}
export interface MapExpr<TModel, TResult> {
  (target: TModel): TResult;
}
export interface ReduceExpr<TModel, TResult> {
  (target: TModel, curr: TResult): TResult;
}

export interface MapReduceDefinition<TParent, TChild, TResult> {
  map?: MapExpr<TParent, TChild>;
  filter?: FilterExpr<TChild>;
  reduce?: ReduceExpr<TChild, TResult>;
}

export interface AggregateDefinition<TParent, TChild, TResult> {
  map?: MapExpr<TParent, Array<TChild>>;
  filter?: FilterExpr<TChild>;
  reduce?: ReduceExpr<TChild, TResult>;
}