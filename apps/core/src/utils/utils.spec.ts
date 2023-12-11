// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {i18n} from 'i18next';
import {IConfig} from '_types/config';
import {IValue} from '_types/value';
import {AttributeFormats} from '../_types/attribute';
import {Errors} from '../_types/errors';
import {
    mockAttrAdv,
    mockAttrAdvLink,
    mockAttrSimple,
    mockAttrSimpleLink,
    mockAttrTree
} from '../__tests__/mocks/attribute';
import {mockLibraryFiles} from '../__tests__/mocks/library';
import utils from './utils';

describe('Utils', () => {
    describe('getFileExtension', () => {
        test('Should return filename extension', async function () {
            const utilsModule = utils();
            expect(utilsModule.getFileExtension('file.txt')).toEqual('txt');
            expect(utilsModule.getFileExtension('file')).toEqual(null);
        });
    });
    describe('libNameToQueryName', () => {
        test('Should format a string to camelCase', async function () {
            const utilsModule = utils();
            expect(utilsModule.libNameToQueryName('not camel_case string!')).toEqual('notCamelCaseString');
            expect(utilsModule.libNameToQueryName('Users & Groups')).toEqual('usersGroups');
            expect(utilsModule.libNameToQueryName('lot       of      space!!!')).toEqual('lotOfSpace');
        });
    });
    describe('libNameToTypeName', () => {
        test('Should format a string to CamelCase, upper first with no trailing "s"', async function () {
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
            expect(() => utilsModule.rethrow(error, 'Error prefix')).toThrow('Error prefix, boom');
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

            expect(utilsModule.isIdValid('correct_id')).toEqual(true);
            expect(utilsModule.isIdValid('correct_id42')).toEqual(true);
            expect(utilsModule.isIdValid('invalid id')).toEqual(false);
            expect(utilsModule.isIdValid('invalid id')).toEqual(false);
            expect(utilsModule.isIdValid('Invalid_id')).toEqual(false);
            expect(utilsModule.isIdValid('')).toEqual(false);
            expect(utilsModule.isIdValid(null)).toEqual(false);
            expect(utilsModule.isIdValid(undefined)).toEqual(false);
        });
    });

    describe('validateEndpoint', () => {
        test('Check endpoint format is correct', async () => {
            const utilsModule = utils();

            // Internal endpoint
            expect(utilsModule.isEndpointValid('correct-endpoint', false)).toEqual(true);
            expect(utilsModule.isEndpointValid('correct-42-endpoint', false)).toEqual(true);
            expect(utilsModule.isEndpointValid('invalid endpoint', false)).toEqual(false);
            expect(utilsModule.isEndpointValid('invalid_endpoint', false)).toEqual(false);
            expect(utilsModule.isEndpointValid('Invalid-endpoint', false)).toEqual(false);
            expect(utilsModule.isEndpointValid('Invalid_endpoint', false)).toEqual(false);
            expect(utilsModule.isEndpointValid('', false)).toEqual(false);
            expect(utilsModule.isEndpointValid(null, false)).toEqual(false);
            expect(utilsModule.isEndpointValid(undefined, false)).toEqual(false);

            // External URL
            expect(utilsModule.isEndpointValid('http://www.google.com', true)).toEqual(true);
            expect(utilsModule.isEndpointValid('http://google.com', true)).toEqual(true);
            expect(utilsModule.isEndpointValid('https://google.com', true)).toEqual(true);
            expect(utilsModule.isEndpointValid('http://localhost', true)).toEqual(true);
            expect(utilsModule.isEndpointValid('google.com', true)).toEqual(false);
            expect(utilsModule.isEndpointValid('localhost', true)).toEqual(false);
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

        test('Convert an array of name/value object to an object with specified fields names', async () => {
            expect(
                utilsModule.nameValArrayToObj(
                    [
                        {myKey: 'key1', myValueField: 'val1'},
                        {myKey: 'key2', myValueField: 'val2'}
                    ],
                    'myKey',
                    'myValueField'
                )
            ).toStrictEqual({key1: 'val1', key2: 'val2'});
        });

        test('When array if empty or undefined, return null', () => {
            expect(utilsModule.nameValArrayToObj([])).toBe(null);
            expect(utilsModule.nameValArrayToObj()).toBe(null);
        });
    });

    describe('objToNameValArray', () => {
        test('Convert an object to an array with name and value fields', async () => {
            const utilsModule = utils();
            const obj = {
                toto: 'tata',
                tutu: 'titi'
            };

            const arr = utilsModule.objToNameValArray(obj);

            expect(arr).toEqual([
                {
                    name: 'toto',
                    value: 'tata'
                },
                {
                    name: 'tutu',
                    value: 'titi'
                }
            ]);
        });

        test('Convert an object to an array with specified key and value fields', async () => {
            const utilsModule = utils();
            const obj = {
                toto: 'tata',
                tutu: 'titi'
            };

            const arr = utilsModule.objToNameValArray(obj, 'myKey', 'myValueField');

            expect(arr).toEqual([
                {
                    myKey: 'toto',
                    myValueField: 'tata'
                },
                {
                    myKey: 'tutu',
                    myValueField: 'titi'
                }
            ]);
        });
    });

    describe('forceArray', () => {
        test('If value is not an array, return an array', async () => {
            const utilsModule = utils();

            expect(utilsModule.forceArray('foo')).toEqual(['foo']);
        });

        test('If value is already an array, just return value', async () => {
            const utilsModule = utils();

            expect(utilsModule.forceArray(['foo'])).toEqual(['foo']);
        });
    });

    describe('timestampToDate', () => {
        test('Convert UNIX timestamp to instance of Date', async () => {
            const utilsModule = utils();

            const resNum = utilsModule.timestampToDate(1445412480);
            expect(resNum.toISOString()).toBe('2015-10-21T07:28:00.000Z');

            const resStr = utilsModule.timestampToDate('1445412480');
            expect(resStr.toISOString()).toBe('2015-10-21T07:28:00.000Z');
        });
    });

    describe('dateToTimestamp', () => {
        test('Convert instance of Date to UNIX timestamp', async () => {
            const utilsModule = utils();

            const resNum = utilsModule.dateToTimestamp(new Date('2015-10-21T07:28:00.000Z'));
            expect(resNum).toBe(1445412480);
        });
    });

    describe('isStandardAttribute', () => {
        test('Returns true for simple or advanced', async () => {
            const utilsModule = utils();

            expect(utilsModule.isStandardAttribute(mockAttrSimple)).toBe(true);
            expect(utilsModule.isStandardAttribute(mockAttrAdv)).toBe(true);
        });

        test('Returns false for other types', async () => {
            const utilsModule = utils();

            expect(utilsModule.isStandardAttribute(mockAttrSimpleLink)).toBe(false);
            expect(utilsModule.isStandardAttribute(mockAttrAdvLink)).toBe(false);
            expect(utilsModule.isStandardAttribute(mockAttrTree)).toBe(false);
        });
    });

    describe('isLinkAttribute', () => {
        test('Returns true for simple or advanced link', async () => {
            const utilsModule = utils();

            expect(utilsModule.isLinkAttribute(mockAttrSimpleLink)).toBe(true);
            expect(utilsModule.isLinkAttribute(mockAttrAdvLink)).toBe(true);
        });

        test('Returns false for other types', async () => {
            const utilsModule = utils();

            expect(utilsModule.isLinkAttribute(mockAttrSimple)).toBe(false);
            expect(utilsModule.isLinkAttribute(mockAttrAdv)).toBe(false);
            expect(utilsModule.isLinkAttribute(mockAttrTree)).toBe(false);
        });
    });

    describe('isTreeAttribute', () => {
        test('Returns true for tree', async () => {
            const utilsModule = utils();

            expect(utilsModule.isTreeAttribute(mockAttrTree)).toBe(true);
        });

        test('Returns false for other types', async () => {
            const utilsModule = utils();

            expect(utilsModule.isTreeAttribute(mockAttrSimple)).toBe(false);
            expect(utilsModule.isTreeAttribute(mockAttrSimpleLink)).toBe(false);
            expect(utilsModule.isTreeAttribute(mockAttrAdv)).toBe(false);
            expect(utilsModule.isTreeAttribute(mockAttrAdvLink)).toBe(false);
        });
    });

    describe('decomposeValueEdgeDestination', () => {
        test('Returns library and record of an edge destination', async () => {
            const utilsModule = utils();

            expect(utilsModule.decomposeValueEdgeDestination('my_lib/12345')).toEqual({library: 'my_lib', id: '12345'});
        });
    });

    describe('translateError', () => {
        const mockTranslator: Mockify<i18n> = {
            t: jest.fn().mockImplementation((str, options) => `${str}_${JSON.stringify(options)}`)
        };
        test('Translate error by code', async () => {
            const utilsModule = utils({translator: mockTranslator as i18n});

            expect(utilsModule.translateError(Errors.FORMAT_ERROR, 'fr')).toMatch('errors.FORMAT_ERROR');
        });

        test('Translate error with vars', async () => {
            const utilsModule = utils({translator: mockTranslator as i18n});

            const toTranslate = {msg: 'my_error', vars: {foo: 'bar'}};
            expect(utilsModule.translateError(toTranslate, 'fr')).toMatch('errors.my_error');
            expect(utilsModule.translateError(toTranslate, 'fr')).toMatch('"foo":"bar"');
        });

        test('Translate simple string', async () => {
            const utilsModule = utils({translator: mockTranslator as i18n});

            expect(utilsModule.translateError('custom_error', 'fr')).toMatch('custom_error');
        });
    });

    describe('generateExplicitValidationError', () => {
        test('Generate a validation error with explicit message', async () => {
            const mockTranslator: Mockify<i18n> = {
                t: jest.fn().mockImplementation((str, options) => `[TRANSLATED] ${str}_${JSON.stringify(options)}`)
            };

            const utilsModule = utils({translator: mockTranslator as i18n});
            const error = utilsModule.generateExplicitValidationError('id', Errors.UNKNOWN_ELEMENT, 'fr');
            expect(error.fields.id).toMatch('UNKNOWN_ELEMENT');
            expect(error.message).toMatch('[TRANSLATED]');
        });
    });

    describe('getPreviewAttributesSettings', () => {
        test('Generate attribute settings for previews attributes', async () => {
            const mockConfig = {
                lang: {available: ['fr', 'en'], default: 'fr'}
            };

            const utilsModule = utils({config: mockConfig as IConfig});

            const settings = utilsModule.getPreviewAttributesSettings({
                ...mockLibraryFiles,
                previewsSettings: [
                    {
                        label: {fr: 'Previews'},
                        system: false,
                        versions: {
                            background: '#123456',
                            density: 42,
                            sizes: [
                                {
                                    name: 'small',
                                    size: 42
                                },
                                {
                                    name: 'huge',
                                    size: 1337
                                }
                            ]
                        }
                    }
                ]
            });

            expect(settings).toEqual({
                files_previews: [
                    {
                        id: 'small',
                        label: {fr: 'small', en: 'small'},
                        format: AttributeFormats.TEXT
                    },
                    {
                        id: 'huge',
                        label: {fr: 'huge', en: 'huge'},
                        format: AttributeFormats.TEXT
                    }
                ],
                files_previews_status: [
                    {
                        id: 'small',
                        label: {fr: 'small', en: 'small'},
                        format: AttributeFormats.EXTENDED,
                        embedded_fields: [
                            {
                                id: 'status',
                                format: AttributeFormats.NUMERIC
                            },
                            {
                                id: 'message',
                                format: AttributeFormats.TEXT
                            }
                        ]
                    },
                    {
                        id: 'huge',
                        label: {fr: 'huge', en: 'huge'},
                        format: AttributeFormats.EXTENDED,
                        embedded_fields: [
                            {
                                id: 'status',
                                format: AttributeFormats.NUMERIC
                            },
                            {
                                id: 'message',
                                format: AttributeFormats.TEXT
                            }
                        ]
                    }
                ]
            });
        });
    });

    describe('previewsSettingsToVersions', () => {
        test('Extract versions from previews settings', async () => {
            const utilsModule = utils();
            expect(utilsModule.previewsSettingsToVersions(mockLibraryFiles.previewsSettings)).toEqual([
                {
                    background: '#123456',
                    density: 42,
                    sizes: [
                        {
                            name: 'my_size',
                            size: 1337
                        }
                    ]
                },
                {
                    background: '#123456',
                    density: 42,
                    sizes: [
                        {
                            name: 'my_other_size',
                            size: 1337
                        }
                    ]
                }
            ]);
        });
    });

    describe('areValuesIdentical', () => {
        test('should return true if values and metadata are identical', () => {
            const utilsModule = utils();
            const value1 = {value: 'hello', metadata: {foo: 'bar'}};
            const value2 = {value: 'hello', metadata: {foo: 'bar'}};
            expect(utilsModule.areValuesIdentical(value1, value2)).toBe(true);

            const value3 = {value: 'hello'};
            const value4 = {value: 'hello'};
            expect(utilsModule.areValuesIdentical(value3, value4)).toBe(true);
        });

        test('should return false if values are different', () => {
            const utilsModule = utils();
            const value1: IValue = {value: 'hello', metadata: {foo: 'bar'}};
            const value2: IValue = {value: 'world', metadata: {foo: 'bar'}};
            expect(utilsModule.areValuesIdentical(value1, value2)).toBe(false);
        });

        test('should return false if metadata is different', () => {
            const utilsModule = utils();
            const value1: IValue = {value: 'hello', metadata: {foo: 'bar'}};
            const value2: IValue = {value: 'hello', metadata: {bar: 'baz'}};
            expect(utilsModule.areValuesIdentical(value1, value2)).toBe(false);

            const value3: IValue = {value: 'hello'};
            const value4: IValue = {value: 'hello', metadata: {bar: 'baz'}};
            expect(utilsModule.areValuesIdentical(value3, value4)).toBe(false);
        });

        test('should return true if metadata are falsy on both values', () => {
            const utilsModule = utils();
            const value1: IValue = {value: 'hello'};
            const value2: IValue = {value: 'hello'};
            expect(utilsModule.areValuesIdentical(value1, value2)).toBe(true);

            const value3: IValue = {value: 'hello', metadata: null};
            const value4: IValue = {value: 'hello', metadata: null};
            expect(utilsModule.areValuesIdentical(value3, value4)).toBe(true);

            const value5: IValue = {value: 'hello', metadata: undefined};
            const value6: IValue = {value: 'hello', metadata: undefined};
            expect(utilsModule.areValuesIdentical(value5, value6)).toBe(true);

            const value7: IValue = {value: 'hello', metadata: {}};
            const value8: IValue = {value: 'hello', metadata: null};
            expect(utilsModule.areValuesIdentical(value7, value8)).toBe(true);

            const value9: IValue = {value: 'hello'};
            const value10: IValue = {value: 'hello', metadata: null};
            expect(utilsModule.areValuesIdentical(value9, value10)).toBe(true);
        });

        test('should return false if both values and metadata are different', () => {
            const utilsModule = utils();
            const value1: IValue = {value: 'hello', metadata: {foo: 'bar'}};
            const value2: IValue = {value: 'world', metadata: {bar: 'baz'}};
            expect(utilsModule.areValuesIdentical(value1, value2)).toBe(false);
        });

        test('should return false if one of the values is null or undefined', () => {
            const utilsModule = utils();
            const value1: IValue = {value: 'hello', metadata: {foo: 'bar'}};
            const value2: IValue = {value: null, metadata: {foo: 'bar'}};
            expect(utilsModule.areValuesIdentical(value1, value2)).toBe(false);

            const value3: IValue = {value: 'hello', metadata: {foo: 'bar'}};
            const value4: IValue = {value: undefined, metadata: {foo: 'bar'}};
            expect(utilsModule.areValuesIdentical(value3, value4)).toBe(false);

            const value5: IValue = {value: null, metadata: {foo: 'bar'}};
            const value6: IValue = {value: undefined, metadata: {foo: 'bar'}};
            expect(utilsModule.areValuesIdentical(value5, value6)).toBe(false);
        });
    });
});
