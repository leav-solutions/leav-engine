// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dispatch, useMemo} from 'react';
import {FaPlus} from 'react-icons/fa';
import {useExplorerSelectionIdsLazyQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {FeatureHook, IEntrypointLink, IMassActions} from '../_types';
import {IViewSettingsAction, IViewSettingsState} from '../manage-view-settings';

/**
 * Hook used to link records
 *
 * @param isEnabled - whether the action is present
 * @param view - represent the current view
 * @param dispatch - method to change the current view
 * @param libraryId - concerned library
 * @param linkAttributeId - attribute that represent the link
 * @param onLink - callback to let outside world know about linking feedback
 * @param closeModal - callback to close the link modal
 */
export const useLinkMassAction = ({
    isEnabled,
    store: {view, dispatch},
    libraryId,
    linkAttributeId,
    onLink,
    closeModal
}: FeatureHook<{
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    libraryId: string;
    linkAttributeId: string;
    onLink?: (saveValuesResult: ISubmitMultipleResult) => void;
    closeModal: () => void;
}>) => {
    const {t} = useSharedTranslation();

    const {saveValues} = useSaveValueBatchMutation();

    const [fetch] = useExplorerSelectionIdsLazyQuery({
        fetchPolicy: 'no-cache',
        onCompleted: async data => {
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
    });

    const _addLinkMassAction = useMemo(
        () =>
            ({
                label: t('explorer.massAction.add-link'),
                icon: <FaPlus />,
                callback: async massSelectionFilter => {
                    await fetch({
                        variables: {
                            libraryId,
                            filters: massSelectionFilter
                        }
                    });
                }
            }) satisfies IMassActions,
        [t, fetch, view.massSelection, dispatch, libraryId]
    );

    return {
        addLinkMassAction: isEnabled ? _addLinkMassAction : null
    };
};
