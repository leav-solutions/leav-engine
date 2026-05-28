import {mockAttrAdv} from '../../../__tests__/mocks/attribute';
import type * as Config from '../../../_types/config';
import getSearchQuery from './getSearchQuery';

const makeConfig = (fuzzySearch: boolean): Config.IConfig =>
    ({indexationManager: {fuzzySearch, queues: {events: ''}}}) as Config.IConfig;

describe('getSearchQuery', () => {
    test('Return search query with fuzzy search enabled', async () => {
        const {query} = getSearchQuery({config: makeConfig(true)})('libraryId', ['fieldA', 'fieldB'], 'search');

        expect(query).toMatch('SEARCH');
        expect(query).toMatch('ANALYZER');
        expect(query).toMatch('NGRAM_MATCH');
        expect(query).toMatch('SORT BM25');
    });

    test('Omit NGRAM_MATCH when fuzzy search is disabled', async () => {
        const {query} = getSearchQuery({config: makeConfig(false)})('libraryId', ['fieldA', 'fieldB'], 'search');

        expect(query).toMatch('SEARCH');
        expect(query).toMatch('ANALYZER');
        expect(query).not.toMatch('NGRAM_MATCH');
    });

    test('If specific sort supplied, do not sort on score', async () => {
        const getSearchQueryFunc = getSearchQuery({config: makeConfig(true)});
        const {query} = getSearchQueryFunc('libraryId', ['fieldA', 'fieldB'], 'search', {
            attributes: [{...mockAttrAdv, reverse_link: null}],
            order: 'asc',
        });

        expect(query).not.toMatch('SORT BM25');
    });
});
