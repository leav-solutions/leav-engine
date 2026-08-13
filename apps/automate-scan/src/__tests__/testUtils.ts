declare global {
    /* eslint-disable @typescript-eslint/naming-convention */
    namespace NodeJS {
        interface Global {
            __mockPromise(promRes?: any): any;
            __mockPromiseMultiple(promRes?: any[]): any;
        }
    }
}

global.__mockPromise = promRes => vi.fn().mockReturnValue(Promise.resolve(promRes));
global.__mockPromiseMultiple = promResults => {
    const jestFn = vi.fn();
    for (const promRes of promResults) {
        jestFn.mockReturnValueOnce(promRes);
    }

    return jestFn;
};
