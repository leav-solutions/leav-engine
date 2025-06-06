/// <reference types="jest" />
export interface IKeyValue<T> {
    [key: string]: T;
}
export declare type AnyPrimitive = string | number | boolean;
export declare type Override<T1, T2> = Omit<T1, keyof T2> & T2;
export declare type WithTypename<T> = {
    [P in keyof T]: T[P] extends object ? WithTypename<T[P]> : T[P];
} & {
    readonly __typename?: string;
};
export declare type Mockify<T> = {
    [P in keyof T]?: T[P] extends (...args: any[]) => any
        ? jest.Mock<ReturnType<T[P]> extends never ? never : any>
        : T[P];
};
