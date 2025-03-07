// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, renderHook} from '_ui/_tests/testUtils';
import {Mockify} from '@leav/utils';
import * as gqlTypes from '_ui/_gqlTypes';
import * as useExecuteSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import * as useViewSettingsReducer from '../useViewSettingsReducer';
import {IEntrypointLibrary} from '../_types';
import {useLinkMassAction} from './useLinkMassAction';
import {viewSettingsInitialState} from '../manage-view-settings';

const libraryEntrypoint: IEntrypointLibrary = {
    type: 'library',
    libraryId: 'campaigns'
};

const explorerLinkAttribute = {
    id: 'link_attribute',
    multiple_values: true,
    label: {
        en: 'Delivery Platforms',
        fr: 'Plateformes de diffusion'
    },
    linked_library: {
        id: 'delivery_platforms',
        label: {
            fr: 'Plateformes de diffusion'
        },
        __typename: 'Library'
    },
    __typename: 'LinkAttribute'
};

const mockExplorerAttributesQueryResult: Mockify<typeof gqlTypes.useExplorerAttributesQuery> = {
    loading: false,
    called: true,
    data: {
        attributes: {
            list: [explorerLinkAttribute]
        }
    }
};

const mockViewsResult: Mockify<typeof gqlTypes.useGetViewsListQuery> = {
    data: {
        views: {
            list: [
                {
                    id: '42',
                    label: {en: 'My view'},
                    filters: [],
                    sort: []
                }
            ]
        }
    },
    loading: false,
    called: true
};

describe('useLinkMassAction', () => {
    test('should call the link action', async () => {
        jest.spyOn(gqlTypes, 'useExplorerLinkAttributeQuery').mockImplementation(
            () => mockExplorerAttributesQueryResult as gqlTypes.ExplorerLinkAttributeQueryResult
        );

        jest.spyOn(gqlTypes, 'useGetViewsListQuery').mockReturnValue(
            mockViewsResult as gqlTypes.GetViewsListQueryResult
        );

        jest.spyOn(gqlTypes, 'useExplorerAttributesQuery').mockImplementation(
            () => mockExplorerAttributesQueryResult as gqlTypes.ExplorerAttributesQueryResult
        );

        const viewInitialState = {
            ...viewSettingsInitialState,
            entrypoint: libraryEntrypoint
        };
        jest.spyOn(useViewSettingsReducer, 'useViewSettingsReducer').mockReturnValue({
            loading: false,
            error: undefined,
            view: viewInitialState,
            dispatch: jest.fn()
        });

        const saveValuesResult = 'saveValuesResult';
        const saveValues = jest.fn<any, any>(async () => saveValuesResult);
        jest.spyOn(useExecuteSaveValueBatchMutation, 'default').mockImplementation(() => ({
            loading: false,
            saveValues
        }));

        const filters = [
            {
                condition: gqlTypes.RecordFilterCondition.EQUAL,
                field: 'id',
                value: '123456'
            }
        ];

        const ExplorerSelectionIdsDocumentQueryMock = {
            request: {
                query: gqlTypes.ExplorerSelectionIdsDocument,
                variables: {
                    libraryId: libraryEntrypoint.libraryId,
                    filters
                }
            },
            result: {
                data: {
                    records: {
                        list: [
                            {
                                id: '123456'
                            }
                        ]
                    }
                }
            }
        };

        const onLink = jest.fn();

        const {
            result: {
                current: {addLinkMassAction}
            }
        } = renderHook(
            () =>
                useLinkMassAction({
                    isEnabled: true,
                    store: {
                        view: {
                            ...viewInitialState,
                            entrypoint: {
                                ...viewInitialState.entrypoint,
                                type: 'link',
                                parentRecordId: 'parentRecordId',
                                parentLibraryId: 'parentLibraryId'
                            } as any
                        },
                        dispatch: jest.fn()
                    },
                    onLink,
                    libraryId: libraryEntrypoint.libraryId,
                    linkAttributeId: explorerLinkAttribute.id,
                    closeModal: () => null
                }),
            {mocks: [ExplorerSelectionIdsDocumentQueryMock]}
        );

        expect(addLinkMassAction).not.toBeNull();
        await act(() => addLinkMassAction!.callback(filters));

        expect(saveValues).toHaveBeenCalledWith(
            {
                id: 'parentRecordId',
                library: {
                    id: 'parentLibraryId'
                }
            },
            [{attribute: 'link_attribute', idValue: null, value: '123456'}]
        );
        expect(onLink).toHaveBeenCalledWith(saveValuesResult);
    });
});
