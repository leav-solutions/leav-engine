// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {getAttributesQuery} from 'queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from 'queries/attributes/saveAttributeMutation';
import {getVersionProfileByIdQuery} from 'queries/versionProfiles/getVersionProfileByIdQuery';
import {getVersionProfilesQuery} from 'queries/versionProfiles/getVersionProfilesQuery';
import {saveVersionProfileMutation} from 'queries/versionProfiles/saveVersionProfileMutation';
import React from 'react';
import {match} from 'react-router';
import {act, fireEvent, render, screen, waitFor} from '_tests/testUtils';
import {Mockify} from '_types/Mockify';
import {mockAttrAdv} from '__mocks__/attributes';
import {mockRecord} from '__mocks__/common/records';
import {mockVersionProfile} from '__mocks__/common/versionProfiles';
import * as useUserData from '../../../hooks/useUserData';
import EditVersionProfile, {IEditVersionProfileMatchParams} from './EditVersionProfile';

jest.mock('components/attributes/AttributesSelectionModal', () => {
    return function AttributesSelectionModal() {
        return <div>AttributesSelectionModal</div>;
    };
});
describe('EditVersionProfile', () => {
    type matchType = match<IEditVersionProfileMatchParams>;
    const mockMatch: Mockify<matchType> = {
        params: {id: mockVersionProfile.id}
    };

    const mockMatchNoId: Mockify<matchType> = {
        params: {}
    };

    const mocks = [
        {
            request: {
                query: getVersionProfileByIdQuery,
                variables: {
                    id: mockVersionProfile.id
                }
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
                                __typename: 'VersionProfile'
                            }
                        ]
                    }
                }
            }
        }
    ];

    beforeEach(() => jest.clearAllMocks());

    test('Render form', async () => {
        render(<EditVersionProfile match={mockMatch as matchType} />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        expect(await screen.findByText(mockVersionProfile.label.fr)).toBeInTheDocument();
        expect(await screen.findByText(/version_profiles.trees/)).toBeInTheDocument();
        expect(screen.getByText(/linked_attributes/)).toBeInTheDocument();
    });

    test('If profile is new, ID and label are editable', async () => {
        render(<EditVersionProfile match={mockMatchNoId as matchType} />, {apolloMocks: mocks});

        expect(screen.getByRole('textbox', {name: 'id'})).toBeEnabled();
        expect(screen.getByRole('textbox', {name: 'label.fr'})).toBeEnabled();
    });

    test('If editing is not allowed, inputs are disabled', async () => {
        const spy = jest.spyOn(useUserData, 'default').mockImplementation(() => {
            return {
                id: '1',
                name: 'Test',
                whoAmI: mockRecord,
                permissions: {admin_edit_version_profile: false}
            };
        });

        render(<EditVersionProfile match={mockMatch as matchType} />, {apolloMocks: mocks});

        expect(await screen.findByRole('textbox', {name: 'label.fr'})).toBeDisabled();

        spy.mockRestore();
    });

    test('Save profile on submit', async () => {
        let saveCalled = false;
        const mocksWithSave = [
            ...mocks,
            {
                request: {
                    query: saveVersionProfileMutation,
                    variables: {
                        versionProfile: {
                            id: 'my_profile',
                            label: {fr: 'Mon profil', en: 'My profile'},
                            description: {fr: ''},
                            trees: []
                        }
                    }
                },
                result: () => {
                    saveCalled = true;
                    return {
                        data: {
                            saveVersionProfiles: mockVersionProfile
                        }
                    };
                }
            }
        ];

        render(<EditVersionProfile match={mockMatch as matchType} />, {apolloMocks: mocksWithSave});

        fireEvent.submit(await screen.findByRole('form'));

        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('Autofill ID with label on new attribute', async () => {
        render(<EditVersionProfile match={mockMatchNoId as matchType} />, {apolloMocks: mocks});

        await act(async () => {
            await userEvent.type(screen.getByRole('textbox', {name: 'label.fr'}), 'labelfr', {delay: 5});
        });

        expect(screen.getByRole('textbox', {name: 'id'})).toHaveValue('labelfr');
    });

    test('Validate ID uniqueness', async () => {
        jest.spyOn(useUserData, 'default').mockImplementation(() => {
            return {
                id: '1',
                name: 'Test',
                whoAmI: mockRecord,
                permissions: {admin_edit_version_profile: true}
            };
        });

        const mocksWithIdCheck = [
            ...mocks,
            {
                request: {
                    query: getVersionProfilesQuery,
                    variables: {filters: {id: 'a'}}
                },
                result: {
                    data: {
                        versionProfiles: {
                            list: [mockVersionProfile]
                        }
                    }
                }
            }
        ];

        render(<EditVersionProfile match={mockMatchNoId as matchType} />, {apolloMocks: mocksWithIdCheck});

        await act(async () => {
            await userEvent.type(screen.getByRole('textbox', {name: 'id'}), 'a', {delay: 5});
            fireEvent.blur(screen.getByRole('textbox', {name: 'id'}));
        });

        expect(await screen.findByText(/validation_errors.id_exists/)).toBeInTheDocument();
    });

    describe('Linked attributes', () => {
        const mocksWithLinkedAttributes = [
            {
                request: {
                    query: getVersionProfileByIdQuery,
                    variables: {id: mockVersionProfile.id}
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
                                            __typename: 'Attribute'
                                        },
                                        {
                                            id: 'attribute_2',
                                            label: {fr: 'Attribut 2', en: 'Attribute 2'},
                                            __typename: 'Attribute'
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        ];
        test('Display list of linked attributes', async () => {
            render(<EditVersionProfile match={mockMatch as matchType} />, {apolloMocks: mocksWithLinkedAttributes});

            expect(await screen.findByText('Attribut 1')).toBeInTheDocument();
            expect(await screen.findByText('Attribut 2')).toBeInTheDocument();
        });

        test('Can link a new attribute', async () => {
            const mocksWithAttributesList = [
                ...mocksWithLinkedAttributes,
                {
                    request: {
                        query: getAttributesQuery,
                        variables: {type: ['advanced', 'advanced_link', 'tree']}
                    },
                    result: {data: {attributes: {list: [{mockAttrAdv}]}}}
                }
            ];

            render(<EditVersionProfile match={mockMatch as matchType} />, {apolloMocks: mocksWithAttributesList});

            userEvent.click(await screen.findByRole('button', {name: /link_attributes/}));

            expect(await screen.findByText('AttributesSelectionModal')).toBeInTheDocument();
        });

        test('Can unlink an attribute', async () => {
            let saveAttributeCalled = false;
            const mocksWithLinkedAttributesAndDelete = [
                ...mocksWithLinkedAttributes,
                {
                    request: {
                        query: saveAttributeQuery,
                        variables: {attrData: {id: 'attribute_1', versions_conf: {versionable: true, profile: null}}}
                    },
                    result: () => {
                        saveAttributeCalled = true;
                        return {
                            data: {
                                saveAttribute: {mockAttrAdv}
                            }
                        };
                    }
                }
            ];

            render(<EditVersionProfile match={mockMatch as matchType} />, {
                apolloMocks: mocksWithLinkedAttributesAndDelete
            });

            await waitFor(() => expect(screen.getAllByRole('button', {name: /unlink/})).toBeTruthy());

            userEvent.click(screen.getAllByRole('button', {name: /unlink/})[0]);
            userEvent.click(await screen.getByRole('button', {name: /OK/}));

            await waitFor(() => expect(saveAttributeCalled).toBe(true));
        });
    });
});
