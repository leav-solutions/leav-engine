import {render, screen} from '../../../_tests/testUtils';
import {AttributeType, GetAttributesDocument} from '../../../_gqlTypes';
import {mockAttrSimple} from '../../../__mocks__/attributes';
import AttributeSelector from './AttributeSelector';

jest.mock(
    './AttributeSelectorField',
    () =>
        function AttributeSelectorField() {
            return <div>AttributeSelectorField</div>;
        },
);

describe('AttributeSelector', () => {
    test('Loading and success state', async () => {
        const mocks = [
            {
                request: {
                    query: GetAttributesDocument,
                    variables: {
                        type: [AttributeType.tree],
                    },
                },
                result: {
                    data: {
                        attributes: {
                            __typename: 'AttributesList',
                            totalCount: 0,
                            list: [
                                {
                                    ...mockAttrSimple,
                                    __typename: 'Attribute',
                                    label: {
                                        fr: 'Attr 1',
                                    },
                                    id: 'test_tree_attr',
                                    versions_conf: null,
                                },
                                {
                                    ...mockAttrSimple,
                                    __typename: 'Attribute',
                                    label: {
                                        fr: 'Attr 2',
                                    },
                                    id: 'other_test_tree_attr',
                                    versions_conf: null,
                                },
                            ],
                        },
                    },
                },
            },
        ];

        render(<AttributeSelector filters={{type: [AttributeType.tree]}} />, {apolloMocks: mocks});

        expect(screen.getByText('AttributeSelectorField')).toBeInTheDocument();
    });

    test('Error state', async () => {
        const mocks = [
            {
                request: {
                    query: GetAttributesDocument,
                    variables: {
                        type: [AttributeType.tree],
                    },
                },
                error: new Error('Boom!'),
            },
        ];

        render(<AttributeSelector filters={{type: [AttributeType.tree]}} />, {apolloMocks: mocks});

        expect(await screen.findByText(/Boom/)).toBeInTheDocument();
    });
});
