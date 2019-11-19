import {ISize} from './types';

export const sizes: ISize[] = [
    {
        width: 800,
        height: 600
    }
];

export const errorToString = (e: any): string => {
    if (e instanceof Error) {
        return e.message;
    } else if (typeof e === 'string' || e instanceof String) {
        return e.toString();
    } else if (typeof e === 'number' || e instanceof Number) {
        return e.toString();
    } else if (typeof e === 'boolean' || e instanceof Boolean) {
        return e.toString();
    }
    return '';
};
