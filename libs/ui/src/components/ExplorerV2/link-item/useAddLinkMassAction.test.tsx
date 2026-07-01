import {act, renderHook} from '_ui/_tests/testUtils';
import * as useExecuteSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {type IEntrypointLibrary} from '../_types';
import {useAddLinkMassAction} from './useAddLinkMassAction';
import {viewSettingsInitialState} from '../manage-view-settings-v2';

const libraryEntrypoint: IEntrypointLibrary = {
    type: 'library',
    libraryId: 'campaigns',
};

const explorerLinkAttribute = {
    id: 'link_attribute',
    multiple_values: true,
    label: {
        en: 'Delivery Platforms',
        fr: 'Plateformes de diffusion',
    },
    linked_library: {
        id: 'delivery_platforms',
        label: {
            fr: 'Plateformes de diffusion',
        },
        __typename: 'Library',
    },
    __typename: 'LinkAttribute',
};

describe('useAddLinkMassAction', () => {
    test('should call the link action', async () => {
        const viewInitialState = {
            ...viewSettingsInitialState,
            entrypoint: libraryEntrypoint,
        };

        const saveValuesResult = 'saveValuesResult';
        const saveValues = vi.fn(async () => saveValuesResult);
        vi.spyOn(useExecuteSaveValueBatchMutation, 'default').mockImplementation(
            () =>
                ({
                    loading: false,
                    saveValues,
                }) as unknown as ReturnType<typeof useExecuteSaveValueBatchMutation.default>,
        );

        const onLink = vi.fn();

        const {
            result: {
                current: {createLinks},
            },
        } = renderHook(() =>
            useAddLinkMassAction({
                store: {
                    view: {
                        ...viewInitialState,
                        entrypoint: {
                            ...viewInitialState.entrypoint,
                            type: 'link',
                            parentRecordId: 'parentRecordId',
                            parentLibraryId: 'parentLibraryId',
                        } as any,
                    },
                },
                onLink,
                linkAttributeId: explorerLinkAttribute.id,
                closeModal: () => null,
            }),
        );

        await act(() =>
            createLinks({
                records: {
                    list: [
                        {
                            id: '123456',
                        },
                    ],
                },
            }),
        );

        expect(saveValues).toHaveBeenCalledWith(
            {
                id: 'parentRecordId',
                library: {
                    id: 'parentLibraryId',
                },
            },
            [{attribute: 'link_attribute', idValue: null, value: '123456'}],
        );
        expect(onLink).toHaveBeenCalledWith(saveValuesResult);
    });
});
