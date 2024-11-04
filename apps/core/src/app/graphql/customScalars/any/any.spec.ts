// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Kind, ObjectValueNode, StringValueNode} from 'graphql';
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
            const mockAst: StringValueNode = {
                kind: Kind.STRING,
                value: 'toto'
            };

            const mockObj: ObjectValueNode = {
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
