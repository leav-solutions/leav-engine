export type Mockify<T> = {
    [P in keyof T]?: T[P] extends (...args: any[]) => any
        ? jest.Mock<ReturnType<T[P]> extends never ? never : any>
        : T[P];
};
