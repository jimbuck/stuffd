
import { Enum as EnumType, MapExpr, ReduceExpr, TypeDefinition } from '../models/types';
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

export function Type(type: TypeDefinition, secondaryType: TypeDefinition) {
  return Stuff({ type, secondaryType });
}

export function Enum(type: TypeDefinition) {
    return Type(EnumType, type );
}

export function Array(type: TypeDefinition) {
  return Type(Array, type);
}

export function Sum<TTarget, TProp>(map: MapExpr<TTarget, Array<TProp>>, reduce: ReduceExpr<TProp, number>) {
  return Stuff({ sum: { map, reduce } });
}

export function Choice<T>(choices: T[] | (() => T[])) {
  return Stuff({ choices });
}