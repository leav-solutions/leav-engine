import {KitAlert} from 'aristid-ds';
import {GetAutomationRulesDataDocument, useDeleteAutomationRuleMutation} from '../../../_gqlTypes';
import {ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
import {useTranslation} from 'react-i18next';

export const useDeleteAutomationRule = () => {
    const {t} = useTranslation();
    const [deleteAutomationRule, {loading}] = useDeleteAutomationRuleMutation({
        refetchQueries: [GetAutomationRulesDataDocument],
    });

    const displaySuccessAlert = () => {
        KitAlert.success({
            showIcon: true,
            duration: SUCCESS_NOTIFICATION_DURATION,
            closable: true,
            message: t('automation.table.action.delete.success'),
            description: null,
        });
    };

    const displayErrorAlert = (description?: string) => {
        KitAlert.error({
            showIcon: true,
            duration: ERROR_NOTIFICATION_DURATION,
            closable: true,
            message: t('automation.table.action.delete.error'),
            description: description ?? null,
        });
    };

    const handleDeleteAutomationRule = async (ruleId: string) => {
        try {
            const {errors} = await deleteAutomationRule({variables: {ruleId}});

            if (errors) {
                displayErrorAlert(errors[0].message);
                return;
            }

            displaySuccessAlert();
        } catch (error) {
            displayErrorAlert(error instanceof Error ? error.message : String(error));
        }
    };

    return {
        deleteAutomationRule: handleDeleteAutomationRule,
        loading,
    };
};
