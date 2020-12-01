import {Kind} from 'graphql';
import utils from '../../../../utils';
import dateTime from './dateTime';

describe('SystemTranslation', () => {
    const actualUtils = utils();

    const scalar = dateTime({'core.utils': actualUtils});

    const expectedDate = new Date('2037-03-01T00:42:00.000Z');

    describe('serialize', () => {
        test('Date object => ISO string', async () => {
            expect(scalar.serialize(new Date('2037-03-01T00:42:00.000Z'))).toEqual('2037-03-01T00:42:00.000Z');
        });

        test('Timestamp => ISO string', async () => {
            expect(scalar.serialize(2119480920)).toEqual('2037-03-01T00:42:00.000Z');
        });

        test('Timestamp in a string => ISO string', async () => {
            expect(scalar.serialize('2119480920')).toEqual('2037-03-01T00:42:00.000Z');
        });
    });

    describe('parseValue', () => {
        test('Convert unix timestamp to Date object', async () => {
            expect(scalar.parseValue(2119480920)).toEqual(expectedDate);
            expect(scalar.parseValue('2119480920')).toEqual(expectedDate);
        });

        test('Reject invalid (not string or number) input', async () => {
            expect(() => scalar.parseValue(false)).toThrow(Error);
            expect(() => scalar.parseValue({})).toThrow(Error);
        });
    });

    describe('parseLiteral', () => {
        test('Convert unix timestamp to Date object', async () => {
            const mockAst = {
                kind: Kind.STRING,
                value: '2119480920'
            };

            expect(scalar.parseLiteral(mockAst, null)).toEqual(expectedDate);
        });

        test('Reject invalid input', async () => {
            const mockAst = {
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
                            value: 'tat'
                        }
                    }
                ]
            };
            expect(() => scalar.parseLiteral(mockAst, null)).toThrow();
        });
    });
});
