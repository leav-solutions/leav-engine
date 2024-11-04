// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql, useQuery} from '@apollo/client';
import {enableFetchMocks} from 'jest-fetch-mock';
import {act} from 'react-dom/test-utils';
import {render, screen, waitFor} from '_tests/testUtils';
import ApolloHandler from './ApolloHandler';

enableFetchMocks();

console.error = jest.fn();

const gqlUnchecked = gql;
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
    });
});
