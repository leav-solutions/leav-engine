// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {deleteApiKeyMutation} from 'queries/apiKeys/deleteApiKeyMutation';
import {getApiKeysQuery} from 'queries/apiKeys/getApiKeysQuery';
import React from 'react';
import {render, screen, waitFor} from '_tests/testUtils';
import {mockApiKey} from '__mocks__/common/apiKeys';
import GeneralApiKeysTab from './GeneralApiKeysTab';

jest.mock('../../../../hooks/useLang');

jest.mock('./EditApiKeyModal', () => {
    return function EditApiKeyModal() {
        return <div>EditApiKeyModal</div>;
    };
});

describe('ApiKeys', () => {
    const mocks = [
        {
            request: {
                query: getApiKeysQuery,
                variables: {filters: {}}
            },
            result: {
                data: {
                    apiKeys: {
                        __typename: 'ApiKeyList',
                        list: [
                            {...mockApiKey, id: 'key1', label: 'keyA'},
                            {...mockApiKey, id: 'key2', expiresAt: null, label: 'keyB'},
                            {...mockApiKey, id: 'key3', expiresAt: 2000000000, label: 'keyC'}
                        ]
                    }
                }
            }
        },
        {
            request: {
                query: getApiKeysQuery,
                variables: {filters: {label: '%C%'}}
            },
            result: {
                data: {
                    apiKeys: {
                        __typename: 'ApiKeyList',
                        list: [{...mockApiKey, id: 'key3', expiresAt: 2000000000, label: 'keyC'}]
                    }
                }
            }
        }
    ];

    const cacheSettings = {possibleTypes: {Record: ['User']}};

    test('Render test', async () => {
        render(<GeneralApiKeysTab />, {apolloMocks: mocks, cacheSettings});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText('keyA')).toBeInTheDocument();
        expect(await screen.findByText('keyB')).toBeInTheDocument();
        expect(await screen.findByText('keyC')).toBeInTheDocument();

        // Filter list
        userEvent.type(screen.getByRole('textbox', {name: /label/}), 'C');

        expect(screen.getByText(/loading/)).toBeInTheDocument();
        expect(await screen.findByText('keyC')).toBeInTheDocument();
        expect(screen.queryByText('keyA')).not.toBeInTheDocument();
        expect(screen.queryByText('keyB')).not.toBeInTheDocument();

        userEvent.click(screen.getByText('keyC'));
        expect(screen.getByText('EditApiKeyModal')).toBeInTheDocument();
    });

    test('Can delete a key', async () => {
        let deleteCalled = false;
        const mocksWithDelete = [
            ...mocks,
            {
                request: {
                    query: deleteApiKeyMutation,
                    variables: {id: 'key1'}
                },
                result: () => {
                    deleteCalled = true;
                    return {
                        data: {
                            deleteApiKey: {
                                __typename: 'ApiKey',
                                id: 'keyA'
                            }
                        }
                    };
                }
            }
        ];

        render(<GeneralApiKeysTab />, {apolloMocks: mocksWithDelete, cacheSettings});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        userEvent.click((await screen.findAllByRole('button', {name: /delete/}))[0]);
        userEvent.click(await screen.findByText('OK'));

        await waitFor(() => expect(deleteCalled).toBe(true));
    });
});
