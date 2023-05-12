// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {act, render, screen} from '_tests/testUtils';
import {mockAttrAdv, mockAttrSimple, mockAttrSimpleLink} from '__mocks__/attributes';
import {mockLibrary} from '__mocks__/libraries';
import {getRecordDataQuery} from '../../../../../queries/records/recordDataQuery';
import {
    GET_LIB_BY_ID_libraries_list,
    GET_LIB_BY_ID_libraries_list_attributes
} from '../../../../../_gqlTypes/GET_LIB_BY_ID';
import {AttributeFormat} from '../../../../../_gqlTypes/globalTypes';
import MockedLangContextProvider from '../../../../../__mocks__/MockedLangContextProvider';
import EditRecordForm from './EditRecordForm';

const lang = ['fr'];

const attributes: GET_ATTRIBUTE_BY_ID_attributes_list[] = [
    {
        ...mockAttrAdv,
        id: 'avance',
        label: {fr: 'avance', en: 'advanced'}
    },
    {
        ...mockAttrSimple,
        id: 'test',
        label: {fr: 'test', en: 'test'}
    },
    {
        ...mockAttrAdv,
        id: 'prix',
        format: AttributeFormat.numeric,
        label: {en: 'price', fr: 'prix'}
    },
    {
        ...mockAttrSimple,
        id: 'id',
        system: true,
        label: {fr: 'Identifiant', en: 'Identifier'}
    },
    {
        ...mockAttrSimple,
        id: 'created_at',
        format: AttributeFormat.numeric,
        system: true,
        label: {fr: 'Date de création', en: 'Creation date'}
    },
    {
        ...mockAttrSimpleLink,
        id: 'created_by',
        system: true,
        label: {fr: 'Créé par', en: 'Created by'},
        linked_library: {id: 'users'},
        versions_conf: {versionable: false, mode: null, profile: null}
    },
    {
        ...mockAttrSimple,
        id: 'modified_at',
        format: AttributeFormat.numeric,
        system: true,
        label: {fr: 'Date de modification', en: 'Modification date'},
        versions_conf: {versionable: false, mode: null, profile: null}
    },
    {
        ...mockAttrSimpleLink,
        id: 'modified_by',
        system: true,
        label: {fr: 'Modifié par', en: 'Modified by'},
        linked_library: {id: 'users'},
        versions_conf: {versionable: false, mode: null, profile: null}
    }
];

const library: GET_LIB_BY_ID_libraries_list = {
    ...mockLibrary,
    id: 'produits',
    label: {fr: 'produits', en: 'products'},
    attributes: attributes as GET_LIB_BY_ID_libraries_list_attributes[]
};

const query = getRecordDataQuery(library, attributes as GET_LIB_BY_ID_libraries_list_attributes[]);
const requestAndResult = {
    request: {
        query,
        variables: {id: '1234567', version: null, lang}
    },
    result: {
        data: {
            record: {
                list: [
                    {
                        id: '1234567',
                        whoAmI: {
                            id: '1234567',
                            library,
                            label: null,
                            color: null,
                            preview: null
                        },
                        avance: null,
                        test: {
                            value: null,
                            id_value: null
                        },
                        prix: [
                            {value: '45829', id_value: '1392982'},
                            {value: '6589', id_value: '1455864'},
                            {value: '1234', id_value: '1467140'},
                            {value: '6546', id_value: '1468572'},
                            {value: '456', id_value: '1646878'}
                        ],
                        created_at: {
                            value: '2020-01-30T09:36:55+00:00',
                            id_value: null
                        },
                        created_by: {
                            id_value: null,
                            value: {
                                whoAmI: {
                                    id: '1',
                                    library: {
                                        id: 'users',
                                        label: {fr: 'Utilisateurs', en: 'Users'}
                                    },
                                    label: null,
                                    color: null,
                                    preview: null
                                }
                            }
                        },
                        modified_at: {
                            value: '2020-02-10T16:00:04+00:00',
                            id_value: null
                        },
                        modified_by: {
                            id_value: null,
                            value: {
                                whoAmI: {
                                    id: '1',
                                    library: {
                                        id: 'users',
                                        label: {fr: 'Utilisateurs', en: 'Users'}
                                    },
                                    label: null,
                                    color: null,
                                    preview: null
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
};

const mocks = [requestAndResult];

jest.mock('../../../FormFields/LinksField', () => {
    return function LinksField() {
        return <div>LinksField</div>;
    };
});

jest.mock('./StandardValuesWrapper', () => {
    return function StandardValuesWrapper() {
        return <div>StandardValuesWrapper</div>;
    };
});

describe('EditRecordForm', () => {
    test('Renders without error', async () => {
        await act(async () => {
            render(
                <MockedLangContextProvider>
                    <EditRecordForm
                        attributes={attributes as GET_LIB_BY_ID_libraries_list_attributes[]}
                        library={library}
                        initialRecordId={'1234567'}
                    />
                </MockedLangContextProvider>,
                {apolloMocks: mocks}
            );
        });

        expect(await screen.findAllByText('LinksField')).toHaveLength(2);
        expect(screen.getAllByText('StandardValuesWrapper')).toHaveLength(6);
    });

    test('Queries and Renders the Edit Record Form Links, Multiple Values Edition Input, and Edit Record Input', async () => {
        //
    });

    test('Saves a value', async () => {
        //
    });

    test('Deletes a value', async () => {
        //
    });

    test('Cancels a value', async () => {
        //
    });
});
