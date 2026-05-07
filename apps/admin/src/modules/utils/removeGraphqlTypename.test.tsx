// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {removeGraphqlTypename} from './removeGraphqlTypename';

describe('removeGraphqlTypename', () => {
    test('removes __typename from a flat object', () => {
        const input = {id: '1', name: 'foo', __typename: 'Record'};

        expect(removeGraphqlTypename(input)).toEqual({id: '1', name: 'foo'});
        expect(removeGraphqlTypename(input)).not.toEqual(expect.objectContaining({__typename: 'Record'}));
    });

    test('removes __typename recursively from nested objects', () => {
        const input = {
            id: '1',
            __typename: 'Record',
            library: {
                id: 'campaigns',
                __typename: 'Library',
            },
        };

        expect(removeGraphqlTypename(input)).toEqual({
            id: '1',
            library: {id: 'campaigns'},
        });
        expect(removeGraphqlTypename(input)).not.toEqual(expect.objectContaining({__typename: 'Record'}));
    });

    test('removes __typename from objects inside arrays', () => {
        const input = [
            {id: '1', __typename: 'Record'},
            {id: '2', __typename: 'Record'},
        ];

        expect(removeGraphqlTypename(input)).toEqual([{id: '1'}, {id: '2'}]);
        expect(removeGraphqlTypename(input)).not.toEqual(expect.objectContaining({__typename: 'Record'}));
    });

    test('handles arrays nested inside objects', () => {
        const input = {
            __typename: 'Query',
            items: [
                {id: '1', __typename: 'Item'},
                {id: '2', __typename: 'Item'},
            ],
        };

        expect(removeGraphqlTypename(input)).toEqual({
            items: [{id: '1'}, {id: '2'}],
        });
        expect(removeGraphqlTypename(input)).not.toEqual(expect.objectContaining({__typename: 'Query'}));
    });

    test('handles deeply nested mixed structure', () => {
        const input = {
            __typename: 'Log',
            topic: {
                __typename: 'LogTopic',
                record: {
                    id: '123',
                    __typename: 'Record',
                    whoAmI: {
                        label: 'Test',
                        __typename: 'RecordIdentity',
                    },
                },
            },
        };

        expect(removeGraphqlTypename(input)).toEqual({
            topic: {
                record: {
                    id: '123',
                    whoAmI: {label: 'Test'},
                },
            },
        });
        expect(removeGraphqlTypename(input)).not.toEqual(expect.objectContaining({__typename: 'Log'}));
        expect(removeGraphqlTypename(input)).not.toEqual(expect.objectContaining({__typename: 'LogTopic'}));
        expect(removeGraphqlTypename(input)).not.toEqual(expect.objectContaining({__typename: 'Record'}));
        expect(removeGraphqlTypename(input)).not.toEqual(expect.objectContaining({__typename: 'RecordIdentity'}));
    });
});
