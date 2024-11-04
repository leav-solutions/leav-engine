// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import gql from 'graphql-tag';
import {act} from 'react-dom/test-utils';
import {render, screen, waitFor} from '_tests/testUtils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import ApolloHandler from './ApolloHandler';

const mockDispatch = jest.fn();

jest.mock('reduxStore/store', () => ({
    useAppDispatch: () => mockDispatch
}));

console.error = jest.fn();

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
                    <ApolloHandler>
                        <MockComponent />
                    </ApolloHandler>
                </MockStore>
            );
        });

        // wait for dispatch to be call
        expect(await waitFor(() => screen.getByText('MockComponent'))).toBeInTheDocument();

        expect(mockDispatch).toBeCalledWith({
            payload: {
                channel: 'trigger',
                content: 'error.network_error_occurred',
                type: 'error'
            },
            type: 'infos/addInfo'
        });
    });
});
