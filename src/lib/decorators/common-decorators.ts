
import { Enum as EnumType, MapExpr, ReduceExpr, TypeDefinition } from '../models/types';
import { Prop } from './base-decorator';

export function Ignore(ignore = true) {
  return Prop({ ignore });
}

export function Length(length: number) {
    return Prop({ length });
}

export function Optional(rate: number = 0.5) {
  return Prop({ optional: rate });
}

export function Unique(unique = true) {
  return Prop({ unique });
}

export function Min(min: number) {
    return Prop({min});
}

export function Max(max: number) {
    return Prop({ max });
}

export function Decimals(count: number) {
    return Prop({decimals: count});
}

export function Integer() {
  return Decimals(0);
}

export function Type(type: TypeDefinition, secondaryType: TypeDefinition = null) {
  return Prop({ type, secondaryType });
}

export function Enum(type: TypeDefinition) {
    return Type(EnumType, type);
}

export function Array(type: TypeDefinition) {
  return Type(Array, type);
}

export function Sum<TTarget, TProp>(map: MapExpr<TTarget, Array<TProp>>, reduce: ReduceExpr<TProp, number>) {
  return Prop({ sum: { map, reduce } });
}

export function Choice<T>(choices: T[] | (() => T[])) {
  return Prop({ choices });
}

export function Pattern(pattern: RegExp) {
  return Prop({ pattern });
}