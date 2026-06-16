import {type ExplorerSelectionIdsQuery} from '_ui/_gqlTypes';
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {type ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {type IEntrypointLink} from '../_types';
import {type IViewSettingsState} from '../manage-view-settings';

/**
 * Hook used to replace link
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
    closeModal,
}: {
    store: {
        view: IViewSettingsState;
    };
    linkAttributeId: string;
    linkId?: string;
    onReplace?: (replaceValuesResult: ISubmitMultipleResult) => void;
    closeModal: () => void;
}) => {
    const {saveValues} = useSaveValueBatchMutation();

    return {
        replaceLink: async (data: ExplorerSelectionIdsQuery) => {
            if (!linkId) {
                return;
            }
            const entrypoint = view.entrypoint as IEntrypointLink;
            const values = data.records.list.map(({id}) => ({
                attribute: linkAttributeId,
                idValue: linkId,
                value: id,
            }));

            const replaceValuesResult = await saveValues(
                {
                    id: entrypoint.parentRecordId,
                    library: {
                        id: entrypoint.parentLibraryId,
                    },
                },
                values,
            );
            onReplace?.(replaceValuesResult);
            closeModal();
        },
    };
};
