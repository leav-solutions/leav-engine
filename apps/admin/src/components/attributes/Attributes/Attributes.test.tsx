import {type MockedResponse} from '@apollo/client/testing';
import {act, render, screen} from '../../../_tests/testUtils';
import {mockAttrSimple} from '../../../__mocks__/attributes';
import Attributes from './Attributes';
import {GetAttributesDocument} from '../../../_gqlTypes';

vi.mock('../AttributesList', () => ({
    default: function AttributesList() {
        return <div>AttributesList</div>;
    },
}));

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
