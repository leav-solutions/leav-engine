import utils from './utils';

describe('Utils', () => {
    describe('libNameToQueryName', () => {
        test('Should format a string to camelCase', async function() {
            const utilsModule = utils();
            expect(utilsModule.libNameToQueryName('not camel_case string!')).toEqual('notCamelCaseString');
            expect(utilsModule.libNameToQueryName('Users & Groups')).toEqual('usersGroups');
            expect(utilsModule.libNameToQueryName('lot       of      space!!!')).toEqual('lotOfSpace');
        });
    });
    describe('libNameToTypeName', () => {
        test('Should format a string to CamelCase, upper first with no trailing "s"', async function() {
            const utilsModule = utils();
            expect(utilsModule.libNameToTypeName('not camel_case string!')).toEqual('NotCamelCaseString');
            expect(utilsModule.libNameToTypeName('Users & Groups')).toEqual('UsersGroup');
            expect(utilsModule.libNameToTypeName('lot       of      space!!!')).toEqual('LotOfSpace');
        });
    });
    describe('rethrow', () => {
        test('Should throw error with amend message', async () => {
            const utilsModule = utils();

            const error = new Error('boom');

            expect(() => utilsModule.rethrow(error)).toThrow('boom');
            expect(() => utilsModule.rethrow(error, 'Error prefix:')).toThrow('Error prefix: boom');
        });
    });
    describe('pipe', () => {
        test('Shoud pipe simple functions', async () => {
            const utilsModule = utils();

            const add = (a, b) => a + b;
            const square = n => n * n;

            const addSquare = utilsModule.pipe(add, square);

            expect(await addSquare(1, 2)).toBe(9);
        });
        test('Shoud pipe async functions', async () => {
            const utilsModule = utils();

            const multiply = factor => async n => {
                return new Promise((resolve, reject) => {
                    resolve(n * factor);
                });
            };

            const triple = multiply(3);
            const triples = utilsModule.pipe(triple, triple);

            expect(await triples(3)).toBe(27);
        });
    });
});
