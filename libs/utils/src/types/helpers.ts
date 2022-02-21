// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IKeyValue<T> {
    [key: string]: T;
}

export type AnyPrimitive = string | number | boolean;

export type Override<T1, T2> = Omit<T1, keyof T2> & T2;
