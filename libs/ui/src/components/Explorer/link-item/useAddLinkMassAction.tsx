// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {ExplorerSelectionIdsQuery} from '_ui/_gqlTypes';
import {IEntrypointLink} from '../_types';
import {IViewSettingsState} from '../manage-view-settings';

/**
 * Hook used to link records
 *
 * @param view - represent the current view
 * @param linkAttributeId - attribute that represent the link
 * @param onLink - callback to let outside world know about linking feedback
 * @param closeModal - callback to close the link modal
 */
export const useAddLinkMassAction = ({
    store: {view},
    linkAttributeId,
    onLink,
    closeModal
}: {
    store: {
        view: IViewSettingsState;
    };
    linkAttributeId: string;
    onLink?: (saveValuesResult: ISubmitMultipleResult) => void;
    closeModal: () => void;
}) => {
    const {saveValues} = useSaveValueBatchMutation();

    return {
        createLinks: async (data: ExplorerSelectionIdsQuery) => {
            const entrypoint = view.entrypoint as IEntrypointLink;
            const values = data.records.list.map(({id}) => ({
                attribute: linkAttributeId,
                idValue: null,
                value: id
            }));

            const saveValuesResult = await saveValues(
                {
                    id: entrypoint.parentRecordId,
                    library: {
                        id: entrypoint.parentLibraryId
                    }
                },
                values
            );
            onLink?.(saveValuesResult);
            closeModal();
        }
    };
};
