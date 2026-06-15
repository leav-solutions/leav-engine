import {useTranslation} from 'react-i18next';
import {KitAlert} from 'aristid-ds';
import {useLang, useConfirmModal} from '@leav/ui';
import {ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
import {GetViewListDocument, useCreateViewV2Mutation, useUpdateViewV2Mutation} from '../../../../../__generated__';
import {IDENTITY_COLUMN_ID} from '../tabs/tab-display/_constants';
import {type CurrentView} from '../store-current-view/_types';
import {useCurrentView} from '../store-current-view/useCurrentView';

type ViewDisplay = NonNullable<CurrentView>['display'];

const mapDisplay = (display: ViewDisplay) => ({
    type: display.type,
    attributes: display.attributes
        .filter(({attribute}) => attribute.id !== IDENTITY_COLUMN_ID)
        .map(({attribute, visible}) => ({attributeId: attribute.id, visible})),
});

export const useCurrentViewActions = () => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {view, setShared, dispatch} = useCurrentView();
    const {openConfirmModal} = useConfirmModal();

    const [updateView, {loading: saveLoading}] = useUpdateViewV2Mutation();
    const [shareView, {loading: shareLoading}] = useUpdateViewV2Mutation();
    const [createView, {loading: forkLoading}] = useCreateViewV2Mutation();

    const notifyError = () =>
        KitAlert.error({
            message: t('view_settings.current-view.action-error'),
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
                variables: {view: {id: view.id, label: view.label, display: mapDisplay(view.display)}},
                refetchQueries: refetchCatalog(view.library),
            });

            if (data?.updateViewV2) {
                // Echo the server state so isDirty drops back to false.
                dispatch({type: 'LOAD_VIEW', payload: data.updateViewV2});
                notifySuccess(t('view_settings.current-view.save-success'));
                return true;
            }

            return false;
        } catch {
            notifyError();
            return false;
        }
    };

    const fork = async (name: string) => {
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
                        // The fork modal captures a single name, but `label` is a SystemTranslation
                        // expected to carry a value per language. We replicate the entered name across
                        // every active language so no language ends up with an empty label.
                        label: Object.fromEntries(lang.map(language => [language, name])),
                        shared: false,
                        display: mapDisplay(view.display),
                        filters: [],
                        sorts: [],
                    },
                },
                refetchQueries: refetchCatalog(view.library),
            });

            if (data?.createViewV2) {
                dispatch({type: 'LOAD_VIEW', payload: data.createViewV2});
                notifySuccess(t('view_settings.current-view.clone-success'));
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
                t(shared ? 'view_settings.current-view.share-success' : 'view_settings.current-view.unshare-success'),
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
            title: t('view_settings.current-view.unshare-confirm-title'),
            content: t('view_settings.current-view.unshare-confirm-content'),
            dangerConfirm: true,
            onOk: () => applyShared(false),
        });
    };

    return {save, saveLoading, fork, forkLoading, toggleShared, shareLoading};
};
