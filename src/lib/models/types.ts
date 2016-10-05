
export const StuffDecoratorMetadata = Symbol.for('jimmyboh.stuff.decorator');
export const Enum = Symbol.for('jimmyboh.stuff.enum');

export type TypeIdentifier = Function | Symbol;
export type LazyArray<T> = Array<T> | (() => Array<T>);

export type PropertySelector<TParent, TChild> = (target: TParent) => TChild;
export type CollectionSelector<TParent, TChild> = PropertySelector<TParent, Array<TChild>>;

export type FilterExpr<TModel> = (target: TModel) => boolean;
export type MapExpr<TModel, TResult> = (target: TModel) => TResult;
export type ReduceExpr<TModel, TResult> = (target: TModel, curr: TResult) => TResult;

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