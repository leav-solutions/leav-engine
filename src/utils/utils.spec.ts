import {Kind, ValueNode} from 'graphql';
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
    describe('validateID', () => {
        test('Check ID format is correct', async () => {
            const utilsModule = utils();

            expect(utilsModule.validateID('correct_id')).toEqual(true);
            expect(utilsModule.validateID('correct_id42')).toEqual(true);
            expect(utilsModule.validateID('invalid id')).toEqual(false);
            expect(utilsModule.validateID('invalid id')).toEqual(false);
            expect(utilsModule.validateID('Invalid_id')).toEqual(false);
            expect(utilsModule.validateID('')).toEqual(false);
            expect(utilsModule.validateID(null)).toEqual(false);
            expect(utilsModule.validateID(undefined)).toEqual(false);
        });
    });

    describe('mergeConcat', () => {
        test('Merge objects, concat their arrays', async () => {
            const utilsModule = utils();
            const o1 = {
                val1: 'toto',
                val2: ['a', 'b']
            };

            const o2 = {
                val2: ['c', 'd'],
                val3: 'tata'
            };

            expect(utilsModule.mergeConcat(o1, o2)).toEqual({
                val1: 'toto',
                val2: ['a', 'b', 'c', 'd'],
                val3: 'tata'
            });
        });
    });
    describe('nameValArrayToObj', () => {
        const utilsModule = utils();
        test('Convert an array of name/value object to an object', async () => {
            expect(
                utilsModule.nameValArrayToObj([
                    {name: 'key1', value: 'val1'},
                    {name: 'key2', value: 'val2'}
                ])
            ).toStrictEqual({key1: 'val1', key2: 'val2'});
        });

        test('When array if empty or undefined, return null', () => {
            expect(utilsModule.nameValArrayToObj([])).toBe(null);
            expect(utilsModule.nameValArrayToObj()).toBe(null);
        });
    });
    describe('graphqlParseLiteral', () => {
        test('Convert an AST tree to an object', async () => {
            const utilsModule = utils();
            const ast: ValueNode = {
                kind: Kind.LIST,
                values: [
                    {
                        kind: Kind.OBJECT,
                        fields: [
                            {
                                kind: Kind.OBJECT_FIELD,
                                name: {
                                    kind: Kind.NAME,
                                    value: 'id'
                                },
                                value: {
                                    kind: Kind.STRING,
                                    value: 'some_container',
                                    block: false
                                }
                            },
                            {
                                kind: Kind.OBJECT_FIELD,
                                name: {
                                    kind: Kind.NAME,
                                    value: 'type'
                                },
                                value: {
                                    kind: Kind.STRING,
                                    value: 'fields_container',
                                    block: false
                                }
                            }
                        ]
                    }
                ]
            };

            expect(utilsModule.graphqlParseLiteral('JSON', ast)).toEqual([
                {
                    id: 'some_container',
                    type: 'fields_container'
                }
            ]);
        });
    });
});
