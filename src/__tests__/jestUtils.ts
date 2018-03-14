declare namespace NodeJS {
    // tslint:disable-next-line:interface-name
    interface Global {
        __mockPromise(promRes?: any): any;
    }
}

global.__mockPromise = promRes => jest.fn().mockReturnValue(Promise.resolve(promRes));
