// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dispatch, useMemo} from 'react';
import {FaTrash} from 'react-icons/fa';
import {useExplorerSelectionIdsLazyQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {FeatureHook, IEntrypointLink, IMassActions} from '../_types';
import {IViewSettingsAction, IViewSettingsState} from '../manage-view-settings';

/**
 * Hook used to link records
 *
 * @param isEnabled - whether the action is present
 * @param view - represent the current view
 * @param dispatch - method to change the current view
 * @param libraryId - concerned library
 * @param linkAttributeId
 */
export const useLinkMassAction = ({
    isEnabled,
    store: {view, dispatch},
    libraryId,
    linkAttributeId
}: FeatureHook<{
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    libraryId: string;
    linkAttributeId: string;
}>) => {
    const {t} = useSharedTranslation();

    const {saveValues} = useSaveValueBatchMutation();

    const [fetch] = useExplorerSelectionIdsLazyQuery({
        fetchPolicy: 'no-cache',
        onCompleted: data => {
            const entrypoint = view.entrypoint as IEntrypointLink;
            const values = data.records.list.map(({id}) => ({
                attribute: linkAttributeId,
                idValue: null,
                value: id
            }));

            saveValues(
                {
                    id: entrypoint.parentRecordId,
                    library: {
                        id: entrypoint.parentLibraryId
                    }
                },
                values
            );
        }
    });

    const _addLinkMassAction: IMassActions = useMemo(
        () => ({
            label: t('explorer.massAction.add-link'),
            icon: <FaTrash />,
            callback: massSelectionFilter => {
                fetch({
                    variables: {
                        libraryId,
                        filters: massSelectionFilter
                    }
                });
            }
        }),
        [t, fetch, view.massSelection, dispatch, libraryId]
    );

    return {
        addLinkMassAction: isEnabled ? _addLinkMassAction : null
    };
};
