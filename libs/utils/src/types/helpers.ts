// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IKeyValue<T> {
    [key: string]: T;
}

export type AnyPrimitive = string | number | boolean;

export type Override<T1, T2> = Omit<T1, keyof T2> & T2;

// Allow a field __typename recursively on every object
export type WithTypename<T> = {
    [P in keyof T]: T[P] extends object ? WithTypename<T[P]> : T[P];
} & {
    readonly __typename?: string;
};

export type Mockify<T> = {
    [P in keyof T]?: T[P] extends (...args: any[]) => any
        ? jest.Mock<ReturnType<T[P]> extends never ? never : any>
        : T[P];
};
