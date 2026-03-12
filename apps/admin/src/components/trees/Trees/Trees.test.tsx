// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type MockedResponse} from '@apollo/client/testing';
import {act, render, screen, waitFor} from '_tests/testUtils';
import {mockTree} from '__mocks__/trees';
import Trees from './Trees';
import {GetTreesDocument} from '_gqlTypes';

jest.mock(
    '../TreesList',
    () =>
        function TreesList() {
            return <div>TreesList</div>;
        },
);

describe('Trees', () => {
    test('Snapshot test', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: GetTreesDocument,
                    variables: {},
                },
                result: {
                    data: {
                        attributes: {
                            list: [mockTree],
                        },
                    },
                },
            },
        ];

        await act(async () => {
            render(<Trees />, {apolloMocks: mocks});
        });

        expect(await waitFor(() => screen.getByText('TreesList'))).toBeInTheDocument();
    });
});
