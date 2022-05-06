// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {gqlUnchecked} from 'utils';
import ApolloHandler from './ApolloHandler';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch
}));

console.error = jest.fn();

jest.mock('hooks/useGraphqlPossibleTypes');

describe('ApolloHandler', () => {
    test('should fail and display message', async () => {
        const query = gqlUnchecked`
            {
                test {
                    test
                }
            }
        `;

        const MockComponent = () => {
            const {loading} = useQuery(query);

            if (loading) {
                return <div></div>;
            }

            return <div>MockComponent</div>;
        };

        await act(async () => {
            render(
                <ApolloHandler>
                    <MockComponent />
                </ApolloHandler>
            );
        });

        // wait for dispatch to be call
        expect(await waitFor(() => screen.getByText('MockComponent'))).toBeInTheDocument();
        expect(mockDispatch).toBeCalled();
    });
});
