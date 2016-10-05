
import { Enum as EnumType, MapExpr, ReduceExpr, TypeIdentifier, LazyArray } from '../models/types';
import { Stuff } from './base-decorator';

export function Length(length: number) {
    return Stuff({ length });
}

export function Optional(rate: number = 0.5) {
  return Stuff({ optional: rate });
}

export function Unique(unique = true) {
  return Stuff({ unique });
}

export function Min(min: number) {
    return Stuff({min});
}

export function Max(max: number) {
    return Stuff({ max });
}

export function Decimals(count: number) {
    return Stuff({decimals: count});
}

export function Type(type: TypeIdentifier, secondaryType: TypeIdentifier) {
  return Stuff({ type, secondaryType });
}

export function Enum(type: TypeIdentifier) {
    return Type(EnumType, type );
}

export function Array(type: TypeIdentifier) {
  return Type(Array, type);
}

export function Sum<TTarget, TProp>(map: MapExpr<TTarget, Array<TProp>>, reduce: ReduceExpr<TProp, number>) {
  return Stuff({ sum: { map, reduce } });
}

export function Choice<T>(choices: LazyArray<T>) {
  return Stuff({ choices });
}