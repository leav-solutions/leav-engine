// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
declare namespace NodeJS {
    /* eslint-disable @typescript-eslint/naming-convention */
    interface Global {
        __mockPromise(promRes?: any): any;
        __mockPromiseMultiple(promRes?: any[]): any;
    }
}

global.__mockPromise = promRes => jest.fn().mockReturnValue(Promise.resolve(promRes));
global.__mockPromiseMultiple = promResults => {
    const jestFn = jest.fn();
    for (const promRes of promResults) {
        jestFn.mockReturnValueOnce(promRes);
    }

    return jestFn;
};

// Used to mock any interface, turning all function properties to an optional mock
// Mockified object must be then passed to a function with a type assertion
type Mockify<T> = {
    [P in keyof T]?: T[P] extends (...args: any[]) => any
        ? jest.Mock<ReturnType<T[P]> extends never ? never : any>
        : T[P];
};
