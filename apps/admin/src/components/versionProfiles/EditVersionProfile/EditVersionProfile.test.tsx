import userEvent from '@testing-library/user-event';
import {fireEvent, render, screen, waitFor} from '../../../_tests/testUtils';
import {mockAttrAdv} from '../../../__mocks__/attributes';
import {mockRecord} from '../../../__mocks__/common/records';
import {mockVersionProfile} from '../../../__mocks__/common/versionProfiles';
import * as useUserData from '../../../hooks/useUserData';
import EditVersionProfile from './EditVersionProfile';
import {
    GetAttributesDocument,
    GetTreesDocument,
    GetVersionProfileByIdDocument,
    GetVersionProfilesDocument,
    SaveAttributeDocument,
    SaveVersionProfileDocument,
} from '../../../_gqlTypes';

vi.mock('../../attributes/AttributesSelectionModal', () => ({
    default: function AttributesSelectionModal() {
        return <div>AttributesSelectionModal</div>;
    },
}));

vi.mock('../../attributes/EditAttribute/EditAttributeTabs/CustomConfigTab', () => ({
    default: function CustomConfigTab() {
        return <div>CustomConfigTab</div>;
    },
}));

const mockUseParams = vi.fn().mockReturnValue({id: mockVersionProfile.id});

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual<object>('react-router-dom')),
    useParams: () => mockUseParams(),
}));

describe('EditVersionProfile', () => {
    const getTreesMock = {
        request: {query: GetTreesDocument},
        result: {
            data: {
                trees: {
                    __typename: 'TreesList',
                    totalCount: 0,
                    list: [],
                },
            },
        },
    };

    const mocks = [
        {
            request: {
                query: GetVersionProfileByIdDocument,
                variables: {
                    id: mockVersionProfile.id,
                },
            },
            result: {
                data: {
                    versionProfiles: {
                        list: [
                            {
                                ...mockVersionProfile,
                                description: {fr: ''},
                                trees: [],
                                linkedAttributes: [],
                                __typename: 'VersionProfile',
                            },
                        ],
                    },
                },
            },
        },
        getTreesMock,
    ];

    beforeEach(() => vi.clearAllMocks());

    test('Render form', async () => {
        render(<EditVersionProfile />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        expect(await screen.findByText(mockVersionProfile.label.fr)).toBeInTheDocument();
        expect(await screen.findByText(/version_profiles.trees/)).toBeInTheDocument();
        expect(screen.getByText(/linked_attributes/)).toBeInTheDocument();
    });

    test('If profile is new, ID and label are editable', async () => {
        mockUseParams.mockReturnValueOnce({id: undefined});

        render(<EditVersionProfile />, {apolloMocks: mocks});

        expect(screen.getByRole('textbox', {name: 'id'})).toBeEnabled();
        expect(screen.getByRole('textbox', {name: 'label.fr'})).toBeEnabled();
    });

    test('If editing is not allowed, inputs are disabled', async () => {
        const spy = vi.spyOn(useUserData, 'default').mockImplementation(() => ({
            id: '1',
            name: 'Test',
            whoAmI: mockRecord,
            permissions: {admin_edit_version_profile: false},
        }));

        render(<EditVersionProfile />, {apolloMocks: mocks});

        expect(await screen.findByRole('textbox', {name: 'label.fr'})).toBeDisabled();

        spy.mockRestore();
    });

    test('Save profile on submit', async () => {
        let saveCalled = false;
        const mocksWithSave = [
            ...mocks,
            {
                request: {
                    query: SaveVersionProfileDocument,
                    variables: {
                        versionProfile: {
                            id: 'my_profile',
                            label: {fr: 'Mon profil', en: 'My profile'},
                            description: {fr: ''},
                            trees: [],
                        },
                    },
                },
                result: () => {
                    saveCalled = true;
                    return {
                        data: {
                            saveVersionProfiles: mockVersionProfile,
                        },
                    };
                },
            },
        ];

        render(<EditVersionProfile />, {apolloMocks: mocksWithSave});

        fireEvent.submit(await screen.findByRole('form'));

        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('Autofill ID with label on new attribute', async () => {
        mockUseParams.mockReturnValueOnce({id: undefined});

        render(<EditVersionProfile />, {apolloMocks: mocks});

        await userEvent.type(screen.getByRole('textbox', {name: 'label.fr'}), 'labelfr', {delay: 5});

        expect(screen.getByRole('textbox', {name: 'id'})).toHaveValue('labelfr');
    });

    test('Validate ID uniqueness', async () => {
        mockUseParams.mockReturnValueOnce({id: undefined});

        vi.spyOn(useUserData, 'default').mockImplementation(() => ({
            id: '1',
            name: 'Test',
            whoAmI: mockRecord,
            permissions: {admin_edit_version_profile: true},
        }));

        const mocksWithIdCheck = [
            ...mocks,
            {
                request: {
                    query: GetVersionProfilesDocument,
                    variables: {filters: {id: 'a'}},
                },
                result: {
                    data: {
                        versionProfiles: {
                            list: [mockVersionProfile],
                        },
                    },
                },
            },
        ];

        render(<EditVersionProfile />, {apolloMocks: mocksWithIdCheck});

        await userEvent.type(screen.getByRole('textbox', {name: 'id'}), 'a', {delay: 5});
        fireEvent.blur(screen.getByRole('textbox', {name: 'id'}));

        expect(await screen.findByText(/validation_errors.id_exists/)).toBeInTheDocument();
    });

    describe('Linked attributes', () => {
        const mocksWithLinkedAttributes = [
            {
                request: {
                    query: GetVersionProfileByIdDocument,
                    variables: {id: mockVersionProfile.id},
                },
                result: {
                    data: {
                        versionProfiles: {
                            list: [
                                {
                                    __typename: 'VersionProfile',
                                    ...mockVersionProfile,
                                    description: {fr: ''},
                                    trees: [],
                                    linkedAttributes: [
                                        {
                                            id: 'attribute_1',
                                            label: {fr: 'Attribut 1', en: 'Attribute 1'},
                                            __typename: 'Attribute',
                                        },
                                        {
                                            id: 'attribute_2',
                                            label: {fr: 'Attribut 2', en: 'Attribute 2'},
                                            __typename: 'Attribute',
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
            getTreesMock,
        ];

        test('Display list of linked attributes', async () => {
            render(<EditVersionProfile />, {apolloMocks: mocksWithLinkedAttributes});

            expect(await screen.findByText('Attribut 1')).toBeInTheDocument();
            expect(await screen.findByText('Attribut 2')).toBeInTheDocument();
        });

        test('Can link a new attribute', async () => {
            const mocksWithAttributesList = [
                ...mocksWithLinkedAttributes,
                {
                    request: {
                        query: GetAttributesDocument,
                        variables: {type: ['advanced', 'advanced_link', 'tree']},
                    },
                    result: {data: {attributes: {list: [{mockAttrAdv}]}}},
                },
            ];

            render(<EditVersionProfile />, {apolloMocks: mocksWithAttributesList});

            userEvent.click(await screen.findByRole('button', {name: /link_attributes/}));

            expect(await screen.findByText('AttributesSelectionModal')).toBeInTheDocument();
        });

        test('Can unlink an attribute', async () => {
            let saveAttributeCalled = false;
            const mocksWithLinkedAttributesAndDelete = [
                ...mocksWithLinkedAttributes,
                {
                    request: {
                        query: SaveAttributeDocument,
                        variables: {attrData: {id: 'attribute_1', versions_conf: {versionable: true, profile: null}}},
                    },
                    result: () => {
                        saveAttributeCalled = true;
                        return {
                            data: {
                                saveAttribute: {mockAttrAdv},
                            },
                        };
                    },
                },
            ];

            render(<EditVersionProfile />, {
                apolloMocks: mocksWithLinkedAttributesAndDelete,
            });

            await waitFor(() => expect(screen.getAllByRole('button', {name: /unlink/})).toBeTruthy());

            await userEvent.click(screen.getAllByRole('button', {name: /unlink/})[0]);
            await userEvent.click(await screen.findByText('OK'));

            await waitFor(() => expect(saveAttributeCalled).toBe(true));
        });
    });
});
