declare namespace NodeJS {
    // tslint:disable-next-line:interface-name
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
