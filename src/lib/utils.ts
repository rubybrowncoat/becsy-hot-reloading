import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const lerp = (a: number, b: number, t: number): number => (b - a) * t + a
export const unlerp = (a: number, b: number, t: number): number => (t - a) / (b - a)

export const remap = (a1: number, b1: number, a2: number, b2: number, t: number): number => lerp(a2, b2, unlerp(a1, b1, t))

export const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>
export const getValues = Object.values as <T extends object>(obj: T) => Array<T[keyof T]>
export const getEntries = Object.entries as <T extends object>(obj: T) => Array<[keyof T, T[keyof T]]>
