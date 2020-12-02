// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getRecordDataQuery} from '../../../../../queries/records/recordDataQuery';
import {
    GET_LIBRARIES_libraries_list,
    GET_LIBRARIES_libraries_list_attributes
} from '../../../../../_gqlTypes/GET_LIBRARIES';
import {LibraryBehavior} from '../../../../../_gqlTypes/globalTypes';
import MockedLangContextProvider from '../../../../../__mocks__/MockedLangContextProvider';
import EditRecordForm from './EditRecordForm';

// attributes: GET_LIBRARIES_libraries_list_attributes[];
// errors?: IEditRecordFormError;
// onSave?: (values: RecordData) => void;
// setSubmitFuncRef?: RecordEdition.SetSubmitFuncRef;
// inModal?: boolean;
// library: GET_LIBRARIES_libraries_list;
// valueVersion?: {[treeName: string]: TreeElementInput};
// onIdentityUpdate?: any;
// initialRecordId?: string;
// setRecordIdentity?: (input: React.SetStateAction<RecordIdentity_whoAmI | undefined>) => void;

const lang = ['en', 'fr'];

const attributes = [
    {
        id: 'avance',
        type: 'advanced',
        format: 'text',
        system: false,
        label: {fr: 'avance', en: 'advanced'},
        linked_library: null,
        linked_tree: null,
        multiple_values: false,
        metadata_fields: null,
        permissions_conf: null,
        versions_conf: {versionable: false, mode: 'smart', trees: []}
    },
    {
        id: 'test',
        type: 'simple',
        format: 'text',
        system: false,
        label: {fr: 'test', en: 'test'},
        linked_library: null,
        linked_tree: null,
        multiple_values: false,
        metadata_fields: null,
        permissions_conf: null,
        versions_conf: {versionable: false, mode: 'smart', trees: []}
    },
    {
        id: 'prix',
        type: 'advanced',
        format: 'numeric',
        system: false,
        label: {en: 'price', fr: 'prix'},
        linked_library: null,
        linked_tree: null,
        multiple_values: true,
        metadata_fields: null,
        permissions_conf: null,
        versions_conf: {versionable: false, mode: 'smart', trees: []}
    },
    {
        id: 'id',
        type: 'simple',
        format: 'text',
        system: true,
        label: {fr: 'Identifiant', en: 'Identifier'},
        linked_library: null,
        linked_tree: null,
        multiple_values: false,
        metadata_fields: null,
        permissions_conf: null,
        versions_conf: {versionable: false, mode: null, trees: []}
    },
    {
        id: 'created_at',
        type: 'simple',
        format: 'numeric',
        system: true,
        label: {fr: 'Date de création', en: 'Creation date'},
        linked_library: null,
        linked_tree: null,
        multiple_values: false,
        metadata_fields: null,
        permissions_conf: null,
        versions_conf: {versionable: false, mode: null, trees: []}
    },
    {
        id: 'created_by',
        type: 'simple_link',
        format: 'text',
        system: true,
        label: {fr: 'Créé par', en: 'Created by'},
        linked_library: 'users',
        linked_tree: null,
        multiple_values: false,
        metadata_fields: null,
        permissions_conf: null,
        versions_conf: {versionable: false, mode: null, trees: []}
    },
    {
        id: 'modified_at',
        type: 'simple',
        format: 'numeric',
        system: true,
        label: {fr: 'Date de modification', en: 'Modification date'},
        linked_library: null,
        linked_tree: null,
        multiple_values: false,
        metadata_fields: null,
        permissions_conf: null,
        versions_conf: {versionable: false, mode: null, trees: []}
    },
    {
        id: 'modified_by',
        type: 'simple_link',
        format: 'text',
        system: true,
        label: {fr: 'Modifié par', en: 'Modified by'},
        linked_library: 'users',
        linked_tree: null,
        multiple_values: false,
        metadata_fields: null,
        permissions_conf: null,
        versions_conf: {versionable: false, mode: null, trees: []}
    }
];

const library: GET_LIBRARIES_libraries_list = {
    id: 'produits',
    system: false,
    behavior: LibraryBehavior.standard,
    label: {fr: 'produits', en: 'products'},
    attributes: attributes as GET_LIBRARIES_libraries_list_attributes[],
    permissions_conf: null,
    recordIdentityConf: {label: null, color: null, preview: null},
    gqlNames: {
        query: 'produits',
        type: 'Produit',
        list: 'ProduitList',
        filter: 'ProduitFilter',
        searchableFields: 'ProduitSearchableFields'
    }
};

const query = getRecordDataQuery(library, attributes as GET_LIBRARIES_libraries_list_attributes[]);
const requestAndResult = {
    request: {
        query,
        variables: {id: '1234567', version: [], lang}
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

describe('EditRecordForm', () => {
    test('Renders without error', async () => {
        let wrapper;
        await act(async () => {
            wrapper = render(
                <MockedLangContextProvider>
                    <MockedProvider mocks={mocks} addTypename={false}>
                        <EditRecordForm
                            attributes={attributes as GET_LIBRARIES_libraries_list_attributes[]}
                            library={library}
                            initialRecordId={'1234567'}
                        />
                    </MockedProvider>
                </MockedLangContextProvider>
            );
        });
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
