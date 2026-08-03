import {useParams} from 'react-router-dom';
import {GetUserDataDocument, useGetUserDataQuery, useSaveUserDataMutation} from '_ui/_gqlTypes';
import {APP_ENDPOINT} from '../../../../../../constants';
import {useApplicationSettingsContext} from '../../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {retrievePanelDetails} from '../../../../utils/retrievePanelDetails';

const LAST_USED_VIEW_KEY_PREFIX = 'last_used_view';

export const useLastUsedView = () => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();
    const currentPanelId = recordPanelId ?? panelId;
    // Scope the memory by the DISPLAYED library too: the same panel id can host explorers of different
    // libraries (a record-panel link explorer is keyed by recordPanelId but shows a linked library), so
    // keying by panel alone could resurface a view id belonging to another library.
    const {displayedLibraryId} = retrievePanelDetails({application, recordPanelId, panelId});
    const userDataKey = `${LAST_USED_VIEW_KEY_PREFIX}_${APP_ENDPOINT}_${displayedLibraryId}_${currentPanelId}`;

    const [saveUserDataMutation] = useSaveUserDataMutation();

    const {data, loading} = useGetUserDataQuery({
        variables: {keys: [userDataKey]},
    });

    const lastUsedViewId: string | undefined = data?.userData?.data?.[userDataKey] ?? undefined;

    return {
        lastUsedViewId,
        // Exposed so the view store can tell "no last-used view yet" (query in flight) from "no
        // last-used view at all" (settled) — the former must not fall back to the default view.
        loading,
        saveLastUsedView: (viewId: string) =>
            saveUserDataMutation({
                variables: {
                    key: userDataKey,
                    value: viewId,
                    global: false,
                },
                update: (cache, {data: updatedData}) => {
                    if (!updatedData?.saveUserData) {
                        return;
                    }

                    cache.writeQuery({
                        query: GetUserDataDocument,
                        // Must match the read's variables exactly, or this writes a separate cache entry.
                        variables: {keys: [userDataKey]},
                        data: {userData: updatedData.saveUserData},
                    });
                },
            }),
    };
};
