// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {render, screen, waitForElement} from '@testing-library/react';
import gql from 'graphql-tag';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import ApolloHandler from './ApolloHandler';

const mockDispatch = jest.fn();

jest.mock('redux/store', () => ({
    useAppDispatch: () => mockDispatch
}));

console.error = jest.fn();

jest.mock('hooks/useGraphqlPossibleTypes');

describe('ApolloHandler', () => {
    test('should fail and display message', async () => {
        const query = gql`
            {
                test {
                    test
                }
            }
        `;

        const MockComponent = () => {
            const {data, loading, error} = useQuery(query);

            if (loading) {
                return <div></div>;
            }

            return <div>MockComponent</div>;
        };

        await act(async () => {
            render(
                <MockStore>
                    <ApolloHandler token={'token'} onTokenInvalid={jest.fn()}>
                        <MockComponent />
                    </ApolloHandler>
                </MockStore>
            );
        });

        // wait for dispatch to be call
        expect(await waitForElement(() => screen.getByText('MockComponent'))).toBeInTheDocument();

        expect(mockDispatch).toBeCalledWith({
            payload: {
                channel: 'trigger',
                content: 'error.network_error_occurred',
                type: 'error'
            },
            type: 'notifications/addNotification'
        });
    });
});
