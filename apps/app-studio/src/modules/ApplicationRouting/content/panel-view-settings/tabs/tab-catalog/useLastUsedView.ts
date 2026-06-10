import {useParams} from 'react-router-dom';
import {useGetUserDataQuery, useSaveUserDataMutation} from '_ui/_gqlTypes';
import {APP_ENDPOINT} from '../../../../../../constants';

const LAST_USED_VIEW_KEY_PREFIX = 'last_used_view';

export const useLastUsedView = () => {
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();
    const currentPanelId = recordPanelId ?? panelId;
    const userDataKey = `${LAST_USED_VIEW_KEY_PREFIX}_${APP_ENDPOINT}_${currentPanelId}`;

    const [saveUserDataMutation] = useSaveUserDataMutation();

    const {data} = useGetUserDataQuery({
        variables: {keys: [userDataKey]},
    });

    const lastUsedViewId: string | undefined = data?.userData?.data?.[userDataKey] ?? undefined;

    return {
        lastUsedViewId,
        saveLastUsedView: (viewId: string) =>
            saveUserDataMutation({
                variables: {
                    key: userDataKey,
                    value: viewId,
                    global: false,
                },
            }),
    };
};
