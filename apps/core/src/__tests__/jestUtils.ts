// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
declare namespace NodeJS {
    /* eslint-disable @typescript-eslint/naming-convention */
    interface Global {
        __mockPromise<T>(promRes?: T): jest.Mock<T>;
        __mockPromiseMultiple(promRes?: any[]): any;
    }
}

// TODO: fix that (currently it seems not applied)
global.__mockPromise = <T>(promRes: T): jest.Mock<T> => jest.fn().mockReturnValue(Promise.resolve(promRes));
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

type MandatoryId<T> = T & {id: string};
