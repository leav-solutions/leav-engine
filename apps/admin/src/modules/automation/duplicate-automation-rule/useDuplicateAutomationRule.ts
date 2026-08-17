import {ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
import {KitAlert} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {useDuplicateAutomationRuleMutation} from '../../../_gqlTypes';

export const useDuplicateAutomationRule = () => {
    const {t} = useTranslation();
    const [duplicateAutomationRule, {loading}] = useDuplicateAutomationRuleMutation({
        fetchPolicy: 'no-cache', // prevents a stale cached response from masking a submission error on retry
    });

    const displaySuccessAlert = () => {
        KitAlert.success({
            showIcon: true,
            duration: SUCCESS_NOTIFICATION_DURATION,
            closable: true,
            message: t('automation.duplicate.success'),
            description: null,
        });
    };

    const displayErrorAlert = (description?: string) => {
        KitAlert.error({
            showIcon: true,
            duration: ERROR_NOTIFICATION_DURATION,
            closable: true,
            message: t('automation.duplicate.error'),
            description: description ?? null,
        });
    };

    const handleDuplicateAutomationRule = async (ruleId: string, label: string): Promise<string | null> => {
        try {
            const {data, errors} = await duplicateAutomationRule({variables: {ruleId, label}});

            if (errors) {
                displayErrorAlert(errors[0].message);
                return null;
            }

            displaySuccessAlert();
            return data?.duplicateAutomationRule?.id ?? null;
        } catch (error) {
            displayErrorAlert(error instanceof Error ? error.message : String(error));
            return null;
        }
    };

    return {duplicateAutomationRule: handleDuplicateAutomationRule, loading};
};
