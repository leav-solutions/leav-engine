// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Used to mock any interface, turning all function properties to an optionnal mock
// Mockified object must be then passed to a function with a type assertion
export type Mockify<T> = {[P in keyof T]?: T[P] extends (...args: any) => any ? jest.Mock : T[P]};
