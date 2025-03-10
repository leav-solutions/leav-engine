// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, renderHook} from '_ui/_tests/testUtils';
import * as useExecuteSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {IEntrypointLibrary} from '../_types';
import {useAddLinkMassAction} from './useAddLinkMassAction';
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

describe('useAddLinkMassAction', () => {
    test('should call the link action', async () => {
        const viewInitialState = {
            ...viewSettingsInitialState,
            entrypoint: libraryEntrypoint
        };

        const saveValuesResult = 'saveValuesResult';
        const saveValues = jest.fn<any, any>(async () => saveValuesResult);
        jest.spyOn(useExecuteSaveValueBatchMutation, 'default').mockImplementation(() => ({
            loading: false,
            saveValues
        }));

        const onLink = jest.fn();

        const {
            result: {
                current: {createLinks}
            }
        } = renderHook(() =>
            useAddLinkMassAction({
                store: {
                    view: {
                        ...viewInitialState,
                        entrypoint: {
                            ...viewInitialState.entrypoint,
                            type: 'link',
                            parentRecordId: 'parentRecordId',
                            parentLibraryId: 'parentLibraryId'
                        } as any
                    }
                },
                onLink,
                linkAttributeId: explorerLinkAttribute.id,
                closeModal: () => null
            })
        );

        await act(() =>
            createLinks({
                records: {
                    list: [
                        {
                            id: '123456'
                        }
                    ]
                }
            })
        );

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
