import {Kind} from 'graphql';
import any from './any';

describe('SystemTranslation', () => {
    const scalar = any();

    describe('serialize', () => {
        test('Return value', async () => {
            expect(scalar.serialize('toto')).toBe('toto');
            expect(scalar.serialize({toto: 'tata'})).toEqual({toto: 'tata'});
        });
    });

    describe('parseValue', () => {
        test('Transmit value, as is', async () => {
            expect(scalar.parseValue('toto')).toBe('toto');
            expect(scalar.parseValue({toto: 'tata'})).toEqual({toto: 'tata'});
        });
    });

    describe('parseLiteral', () => {
        test('Convert value', async () => {
            const mockAst = {
                kind: Kind.STRING,
                value: 'toto'
            };

            const mockObj = {
                kind: Kind.OBJECT,
                fields: [
                    {
                        kind: Kind.OBJECT_FIELD,
                        name: {
                            kind: Kind.NAME,
                            value: 'toto'
                        },
                        value: {
                            kind: Kind.STRING,
                            value: 'tata'
                        }
                    }
                ]
            };

            expect(scalar.parseLiteral(mockAst, null)).toBe('toto');
            expect(scalar.parseLiteral(mockObj, null)).toEqual({toto: 'tata'});
        });
    });
});
