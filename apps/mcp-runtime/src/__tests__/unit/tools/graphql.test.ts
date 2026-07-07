import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createGraphqlHandler} from '../../../tools/graphql';

const CORE_URL = 'http://core.leav.localhost';
const API_KEY = 'test-api-key';
const QUERY = '{ libraries { list { id } } }';
const MUTATION = 'mutation CreateLib($input: LibraryInput!) { createLibrary(library: $input) { id } }';
const VARIABLES = {limit: 10};
const GRAPHQL_RESPONSE = {data: {libraries: {list: [{id: 'lib1'}]}}};

describe('createGraphqlHandler', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', mockFetch);
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(GRAPHQL_RESPONSE),
        });
    });

    describe('when executing a query', () => {
        it('should POST to CORE_URL/graphql with the injected key as query param', async () => {
            const handler = createGraphqlHandler(CORE_URL, API_KEY);
            await handler({query: QUERY});

            expect(mockFetch).toHaveBeenCalledWith(
                `${CORE_URL}/graphql?key=${API_KEY}`,
                expect.objectContaining({method: 'POST'}),
            );
        });

        it('should send query and variables in the request body', async () => {
            const handler = createGraphqlHandler(CORE_URL, API_KEY);
            await handler({query: QUERY, variables: VARIABLES});

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({query: QUERY, variables: VARIABLES}),
                }),
            );
        });

        it('should return the response as MCP text content', async () => {
            const handler = createGraphqlHandler(CORE_URL, API_KEY);
            const result = await handler({query: QUERY});

            expect(result).toEqual({
                content: [{type: 'text', text: JSON.stringify(GRAPHQL_RESPONSE, null, 2)}],
            });
        });
    });

    describe('when executing a mutation', () => {
        it('should POST to CORE_URL/graphql with the injected key as query param', async () => {
            const handler = createGraphqlHandler(CORE_URL, API_KEY);
            await handler({query: MUTATION});

            expect(mockFetch).toHaveBeenCalledWith(
                `${CORE_URL}/graphql?key=${API_KEY}`,
                expect.objectContaining({method: 'POST'}),
            );
        });

        it('should send mutation and variables in the request body', async () => {
            const handler = createGraphqlHandler(CORE_URL, API_KEY);
            await handler({query: MUTATION, variables: VARIABLES});

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({query: MUTATION, variables: VARIABLES}),
                }),
            );
        });
    });
});
