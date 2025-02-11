// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '_ui/_tests/testUtils';
import {Mockify} from '@leav/utils';
import * as gqlTypes from '_ui/_gqlTypes';
import * as useViewSettingsReducer from '../useViewSettingsReducer';
import {IEntrypointLibrary} from '../_types';
import {useLinkMassAction} from './useLinkMassAction';
import {viewSettingsInitialState} from '../manage-view-settings';
import * as useExecuteSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';

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

        const saveValues = jest.fn();
        jest.spyOn(useExecuteSaveValueBatchMutation, 'default').mockReturnValue({
            loading: false,
            saveValues
        });

        const fetch = jest.fn();
        const selectionIdsImplementation = [
            fetch,
            {
                loading: false,
                called: true,
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
        ];

        jest.spyOn(gqlTypes, 'useExplorerSelectionIdsLazyQuery').mockImplementationOnce(
            () => selectionIdsImplementation as unknown as gqlTypes.ExplorerSelectionIdsLazyQueryHookResult
        );

        const {
            result: {
                current: {addLinkMassAction}
            }
        } = renderHook(() =>
            useLinkMassAction({
                isEnabled: true,
                store: {
                    view: {...viewInitialState},
                    dispatch: jest.fn()
                },
                libraryId: libraryEntrypoint.libraryId,
                linkAttributeId: explorerLinkAttribute.id
            })
        );

        const filters = [
            {
                condition: gqlTypes.RecordFilterCondition.EQUAL,
                field: 'id',
                value: '123456'
            }
        ];

        expect(addLinkMassAction).not.toBeNull();

        addLinkMassAction?.callback(filters);
        expect(fetch).toHaveBeenCalledWith({
            variables: {
                filters,
                libraryId: libraryEntrypoint.libraryId
            }
        });
    });
});
