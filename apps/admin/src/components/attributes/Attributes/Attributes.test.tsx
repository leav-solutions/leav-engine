// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type MockedResponse} from '@apollo/client/testing';
import {act, render, screen} from '_tests/testUtils';
import {mockAttrSimple} from '__mocks__/attributes';
import Attributes from './Attributes';
import {GetAttributesDocument} from '_gqlTypes';

jest.mock(
    '../AttributesList',
    () =>
        function AttributesList() {
            return <div>AttributesList</div>;
        },
);

describe('Attributes', () => {
    test('Snapshot test', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: GetAttributesDocument,
                },
                result: {
                    data: {
                        attributes: {
                            list: [mockAttrSimple],
                        },
                    },
                },
            },
        ];

        await act(async () => {
            render(<Attributes />, {apolloMocks: mocks});
        });

        expect(screen.getByText('AttributesList')).toBeInTheDocument();
    });
});
