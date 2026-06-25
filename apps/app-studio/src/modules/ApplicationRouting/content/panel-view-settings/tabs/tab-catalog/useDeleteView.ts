import {useTranslation} from 'react-i18next';
import {KitAlert} from 'aristid-ds';
import {ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
import {GetViewListDocument, useDeleteViewV2Mutation} from '../../../../../../__generated__';

interface IUseDeleteViewResult {
    deleteView: (viewId: string, libraryId: string) => Promise<boolean>;
    deleteLoading: boolean;
}

export const useDeleteView = (): IUseDeleteViewResult => {
    const {t} = useTranslation();
    const [executeDelete, {loading: deleteLoading}] = useDeleteViewV2Mutation();

    const deleteView = async (viewId: string, libraryId: string): Promise<boolean> => {
        try {
            const {data} = await executeDelete({
                variables: {viewId},
                refetchQueries: [{query: GetViewListDocument, variables: {libraryId}}],
            });

            if (data?.deleteViewV2) {
                KitAlert.success({
                    message: t('view_settings.delete_view_success'),
                    duration: SUCCESS_NOTIFICATION_DURATION,
                    showIcon: true,
                });
                return true;
            }

            return false;
        } catch {
            KitAlert.error({
                message: t('view_settings.current_view.action_error'),
                duration: ERROR_NOTIFICATION_DURATION,
                closable: true,
                showIcon: true,
            });
            return false;
        }
    };

    return {deleteView, deleteLoading};
};
