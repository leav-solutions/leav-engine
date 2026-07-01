import {type vi} from 'vitest';

export type Mockify<T> = {
    [P in keyof T]?: T[P] extends (...args: any[]) => any ? ReturnType<typeof vi.fn> : T[P];
};
