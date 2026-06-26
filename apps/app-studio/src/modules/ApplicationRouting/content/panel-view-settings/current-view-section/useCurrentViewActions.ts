import {useTranslation} from 'react-i18next';
import {KitAlert} from 'aristid-ds';
import {useApolloClient} from '@apollo/client';
import {useLang, useConfirmModal, usePanelEventHandlers} from '@leav/ui';
import {ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
import {
    GetViewListDocument,
    GetViewV2Document,
    useCreateViewV2Mutation,
    useUpdateViewV2Mutation,
} from '../../../../../__generated__';
import {IDENTITY_COLUMN_ID} from '../tabs/tab-display/_constants';
import {type CurrentView} from '../store-current-view/_types';
import {useCurrentView} from '../store-current-view/useCurrentView';
import {type AppStudioInternalEvent} from '../../../types';

type ViewDisplay = NonNullable<CurrentView>['display'];
type ViewSorts = NonNullable<CurrentView>['sorts'];

const mapDisplay = (display: ViewDisplay) => ({
    type: display.type,
    attributes: display.attributes
        .filter(({attribute}) => attribute.id !== IDENTITY_COLUMN_ID)
        .map(({attribute, visible}) => ({attributeId: attribute.id, visible})),
});

// `ViewV2SortInput` carries the descent path as bare attribute ids (the labels live server-side).
const mapSorts = (sorts: ViewSorts) =>
    sorts.map(sort => ({
        attributes: sort.attributes.map(attribute => attribute.id),
        order: sort.order,
        pinned: sort.pinned,
    }));

export const useCurrentViewActions = () => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {view, setShared, dispatch} = useCurrentView();
    const {openConfirmModal} = useConfirmModal();
    const client = useApolloClient();
    const {dispatch: dispatchPanelEvent} = usePanelEventHandlers<AppStudioInternalEvent>();

    const [updateView, {loading: saveLoading}] = useUpdateViewV2Mutation();
    const [shareView, {loading: shareLoading}] = useUpdateViewV2Mutation();
    const [createView, {loading: saveAsLoading}] = useCreateViewV2Mutation();

    const notifyError = () =>
        KitAlert.error({
            message: t('view_settings.current_view.action_error'),
            duration: ERROR_NOTIFICATION_DURATION,
            closable: true,
            showIcon: true,
        });

    const notifySuccess = (message: string) =>
        KitAlert.success({message, duration: SUCCESS_NOTIFICATION_DURATION, showIcon: true});

    const refetchCatalog = (library: string) => [{query: GetViewListDocument, variables: {libraryId: library}}];

    const save = async (): Promise<boolean> => {
        if (!view) {
            return false;
        }

        try {
            const {data} = await updateView({
                variables: {
                    view: {
                        id: view.id,
                        label: view.label,
                        display: mapDisplay(view.display),
                        sorts: mapSorts(view.sorts),
                        shortcuts: view.shortcuts,
                    },
                },
                refetchQueries: refetchCatalog(view.library),
            });

            if (data?.updateViewV2) {
                // Echo the server state so isDirty drops back to false.
                dispatch({type: 'LOAD_VIEW', payload: data.updateViewV2});
                notifySuccess(t('view_settings.current_view.save_success'));
                return true;
            }

            return false;
        } catch {
            notifyError();
            return false;
        }
    };

    const saveAs = async (name: string) => {
        if (!view) {
            return;
        }

        try {
            // Capture the current in-memory state (unsaved edits included); only the label is replaced by the entered name.
            const {data} = await createView({
                variables: {
                    view: {
                        library: view.library,
                        // TODO: We might need to change the label type to string as SystemTranslation doesn't seem necessary
                        // The save-as modal captures a single name, but `label` is a SystemTranslation
                        // expected to carry a value per language. We replicate the entered name across
                        // every active language so no language ends up with an empty label.
                        label: Object.fromEntries(lang.map(language => [language, name])),
                        shared: false,
                        display: mapDisplay(view.display),
                        filters: [],
                        sorts: mapSorts(view.sorts),
                        shortcuts: view.shortcuts,
                    },
                },
                refetchQueries: refetchCatalog(view.library),
            });

            if (data?.createViewV2) {
                client.writeQuery({
                    query: GetViewV2Document,
                    variables: {viewId: data.createViewV2.id},
                    data: {viewV2: data.createViewV2},
                });
                dispatchPanelEvent({type: 'view-settings-select-view', data: {viewId: data.createViewV2.id}});
                notifySuccess(t('view_settings.current_view.save_as_success'));
            }
        } catch {
            notifyError();
        }
    };

    const applyShared = async (shared: boolean) => {
        if (!view) {
            return;
        }

        try {
            await shareView({
                variables: {view: {id: view.id, shared}},
                refetchQueries: refetchCatalog(view.library),
            });

            setShared(shared);
            notifySuccess(
                t(shared ? 'view_settings.current_view.share_success' : 'view_settings.current_view.unshare_success'),
            );
        } catch {
            notifyError();
        }
    };

    const toggleShared = (shared: boolean) => {
        if (shared) {
            return applyShared(true);
        }

        openConfirmModal({
            title: t('view_settings.current_view.unshare_confirm_title'),
            content: t('view_settings.current_view.unshare_confirm_content'),
            dangerConfirm: true,
            onOk: () => applyShared(false),
        });
    };

    return {save, saveLoading, saveAs, saveAsLoading, toggleShared, shareLoading};
};
