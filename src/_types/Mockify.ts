// Used to mock any interface, turning all function properties to an optionnal mock
// Mockified object must be then passed to a function with a type assertion
export type Mockify<T> = {[P in keyof T]?: P extends () => void ? jest.Mock<{}> : T[P]};
