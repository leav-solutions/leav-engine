// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockAttrAdv} from '../../../__tests__/mocks/attribute';
import getSearchQuery from './getSearchQuery';

describe('getSearchQuery', () => {
    test('Return search query', async () => {
        const {query} = getSearchQuery()('libraryId', ['fieldA', 'fieldB'], 'search');

        expect(query).toMatch('SEARCH');
        expect(query).toMatch('ANALYZER');
        expect(query).toMatch('SORT BM25');
    });

    test('If specific sort supplied, do not sort on score', async () => {
        const getSearchQueryFunc = getSearchQuery();
        const {query} = getSearchQueryFunc('libraryId', ['fieldA', 'fieldB'], 'search', {
            attributes: [{...mockAttrAdv, reverse_link: null}],
            order: 'asc'
        });

        expect(query).not.toMatch('SORT BM25');
    });
});
