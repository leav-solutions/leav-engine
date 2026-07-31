import {ERROR_NOTIFICATION_DURATION} from '_ui/constants';
import {KitAlert} from 'aristid-ds';

/**
 * Shared by the save hooks of the display tab: each of them persists its own piece of the attribute,
 * with the same error feedback.
 */
export const displaySaveErrorAlert = (message: string, description?: string) => {
    KitAlert.error({
        showIcon: true,
        duration: ERROR_NOTIFICATION_DURATION,
        closable: true,
        message,
        description: description ?? null,
    });
};
