// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ExplorerSelectionIdsQuery} from '_ui/_gqlTypes';
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {IEntrypointLink} from '../_types';
import {IViewSettingsState} from '../manage-view-settings';

/**
 * Hook used to link records
 *
 * @param view - represent the current view
 * @param linkAttributeId - attribute that represent the link
 * @param linkId - concerned link item
 * @param onReplace - callback to let outside world know about replacing feedback
 * @param closeModal - callback to close the link modal
 */
export const useReplaceLinkMassAction = ({
    store: {view},
    linkAttributeId,
    linkId,
    onReplace,
    closeModal
}: {
    store: {
        view: IViewSettingsState;
    };
    linkAttributeId: string;
    linkId: string;
    onReplace?: (replaceValuesResult: ISubmitMultipleResult) => void;
    closeModal: () => void;
}) => {
    const {saveValues} = useSaveValueBatchMutation();

    return {
        replaceLink: async (data: ExplorerSelectionIdsQuery) => {
            const entrypoint = view.entrypoint as IEntrypointLink;
            const values = data.records.list.map(({id}) => ({
                attribute: linkAttributeId,
                idValue: linkId,
                value: id
            }));

            const replaceValuesResult = await saveValues(
                {
                    id: entrypoint.parentRecordId,
                    library: {
                        id: entrypoint.parentLibraryId
                    }
                },
                values
            );
            onReplace?.(replaceValuesResult);
            closeModal();
        }
    };
};
