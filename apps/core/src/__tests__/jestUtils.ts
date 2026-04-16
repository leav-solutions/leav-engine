// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Mock} from 'vitest';

declare global {
    /* eslint-disable @typescript-eslint/naming-convention */
    namespace NodeJS {
        interface Global {
            __mockPromise<T>(promRes?: T): Mock;
            __mockPromiseMultiple(promRes?: any[]): any;
        }
    }

    // Used to mock any interface, turning all function properties to an optional mock
    // Mockified object must be then passed to a function with a type assertion
    type Mockify<T> = {
        [P in keyof T]?: T[P] extends (...args: any[]) => any
            ? Mock<ReturnType<T[P]> extends never ? never : (...args: any[]) => any>
            : T[P];
    };

    type MandatoryId<T> = T & {id: string};
}

// TODO: fix that (currently it seems not applied)
global.__mockPromise = <T>(promRes: T): Mock => vi.fn().mockReturnValue(Promise.resolve(promRes));
global.__mockPromiseMultiple = promResults => {
    const vitestFn = vi.fn();
    for (const promRes of promResults) {
        vitestFn.mockReturnValueOnce(promRes);
    }

    return vitestFn;
};
