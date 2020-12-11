// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Kind} from 'graphql';
import {IConfig} from '_types/config';
import systemTranslation from './systemTranslation';

describe('SystemTranslation', () => {
    const mockLabel = {fr: 'Mon libellé', en: 'My Label'};
    const mockConfig: Partial<IConfig> = {
        lang: {
            default: 'fr',
            available: ['fr', 'en']
        }
    };

    const scalar = systemTranslation({config: mockConfig as IConfig});

    describe('serialize', () => {
        test('Return translations as a key/value object', async () => {
            expect(scalar.serialize(mockLabel)).toEqual(mockLabel);
        });
    });

    describe('parseValue', () => {
        test('Accept incoming key/value object', async () => {
            expect(scalar.parseValue(mockLabel)).toEqual(mockLabel);
        });

        test('Reject invalid (not key/value) input', async () => {
            expect(() => scalar.parseValue('not an object')).toThrow(Error);
            expect(() => scalar.parseValue({fr: 1111})).toThrow(Error);
            expect(() => scalar.parseValue({fr: {fr: 'nested object'}})).toThrow(Error);
            expect(() => scalar.parseValue({fr: true})).toThrow(Error);
        });

        test('Accept only languages available in config', async () => {
            expect(() => scalar.parseValue({es: 'La descripción'})).toThrow();
        });

        test('Default language must be present', async () => {
            expect(() => scalar.parseValue({en: 'English label'})).toThrow();
        });
    });

    describe('parseLiteral', () => {
        test('Accept incoming key/value object', async () => {
            const mockAst = {
                kind: Kind.OBJECT,
                fields: [
                    {
                        kind: Kind.OBJECT_FIELD,
                        name: {
                            kind: Kind.NAME,
                            value: 'fr'
                        },
                        value: {
                            kind: Kind.STRING,
                            value: 'Mon libellé'
                        }
                    },
                    {
                        kind: Kind.OBJECT_FIELD,
                        name: {
                            kind: Kind.NAME,
                            value: 'en'
                        },
                        value: {
                            kind: Kind.STRING,
                            value: 'My Label'
                        }
                    }
                ]
            };

            expect(scalar.parseLiteral(mockAst, null)).toEqual(mockLabel);
        });

        test('Reject invalid (not key/value) input', async () => {
            const mockAst = {
                kind: Kind.STRING,
                value: 'coucou'
            };

            expect(() => scalar.parseLiteral(mockAst, null)).toThrow(Error);
        });

        test('Accept only languages available in config', async () => {
            const mockAst = {
                kind: Kind.OBJECT,
                fields: [
                    {
                        kind: Kind.OBJECT_FIELD,
                        name: {
                            kind: Kind.NAME,
                            value: 'fr'
                        },
                        value: {
                            kind: Kind.STRING,
                            value: 'Mon libellé'
                        }
                    },
                    {
                        kind: Kind.OBJECT_FIELD,
                        name: {
                            kind: Kind.NAME,
                            value: 'es'
                        },
                        value: {
                            kind: Kind.STRING,
                            value: 'La descripción'
                        }
                    }
                ]
            };
            expect(() => scalar.parseLiteral(mockAst, null)).toThrow();
        });

        test('Default language must be present', async () => {
            const mockAst = {
                kind: Kind.OBJECT,
                fields: [
                    {
                        kind: Kind.OBJECT_FIELD,
                        name: {
                            kind: Kind.NAME,
                            value: 'es'
                        },
                        value: {
                            kind: Kind.STRING,
                            value: 'La descripción'
                        }
                    }
                ]
            };
            expect(() => scalar.parseLiteral(mockAst, null)).toThrow();
        });
    });
});
