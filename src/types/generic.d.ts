type nil = null | undefined
type Nullable<T> = T | null
type PredicateOrGuard<T, S extends T = T> = ((value: T) => boolean) | ((value: T) => value is S)
type KeyOfTuple<T extends any[]> = Exclude<keyof T, keyof any[]>