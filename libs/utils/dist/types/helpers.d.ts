export interface IKeyValue<T> {
    [key: string]: T;
}
export declare type AnyPrimitive = string | number | boolean;
export declare type Override<T1, T2> = Omit<T1, keyof T2> & T2;
