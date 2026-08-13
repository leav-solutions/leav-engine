import {act} from '@testing-library/react';
import {render, screen} from '../../../_tests/testUtils';
import {mockAttrAdv} from '../../../__mocks__/attributes';
import EditAttribute from './EditAttribute';
import {GetAttributeByIdDocument} from '../../../_gqlTypes';

vi.mock('./EditAttributeTabs', () => ({
    default: function EditAttributeTabs() {
        return <div>EditAttributeTabs</div>;
    },
}));

describe('EditAttribute', () => {
    test('Loading and success state', async () => {
        const mocks = [
            {
                request: {
                    query: GetAttributeByIdDocument,
                    variables: {id: 'test_attr'},
                },
                result: {
                    data: {
                        attributes: {
                            __typename: 'AttributesList',
                            totalCount: 1,
                            list: [
                                {
                                    ...mockAttrAdv,
                                    __typename: 'Attribute',
                                    versions_conf: null,
                                },
                            ],
                        },
                    },
                },
            },
        ];

        render(<EditAttribute attributeId="test_attr" />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();
        expect(await screen.findByText('EditAttributeTabs')).toBeInTheDocument();
    });

    test('Error state', async () => {
        const mocks = [
            {
                request: {
                    query: GetAttributeByIdDocument,
                    variables: {id: 'test_attr'},
                },
                error: new Error('boom!'),
            },
        ];

        render(<EditAttribute attributeId="test_attr" />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();
        expect(await screen.findByText(/error/)).toBeInTheDocument();
    });

    test('Unknown attribute', async () => {
        const mocks = [
            {
                request: {
                    query: GetAttributeByIdDocument,
                    variables: {id: 'test_attr'},
                },
                result: {
                    data: {
                        attributes: {
                            __typename: 'AttributesList',
                            totalCount: 0,
                            list: [],
                        },
                    },
                },
            },
        ];

        render(<EditAttribute attributeId="test_attr" />, {apolloMocks: mocks});

        expect(await screen.findByText(/Unknown/)).toBeInTheDocument();
    });

    test('If no ID provided, display tabs directly (new attribute)', async () => {
        await act(async () => {
            render(<EditAttribute />);
        });

        expect(screen.getByText('EditAttributeTabs')).toBeInTheDocument();
    });
});
