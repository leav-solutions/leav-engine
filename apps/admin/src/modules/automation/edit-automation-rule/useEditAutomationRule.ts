import {ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
import {useUpdateAutomationRuleMutation} from '../../../_gqlTypes';
import {KitAlert} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {type AutomationFormValues} from '../types';

export const useEditAutomationRule = () => {
    const {t} = useTranslation();
    const [updateAutomationRule, {loading}] = useUpdateAutomationRuleMutation({
        fetchPolicy: 'no-cache', // prevents a stale cached response from masking a submission error on retry
    });

    const displaySuccessAlert = () => {
        KitAlert.success({
            showIcon: true,
            duration: SUCCESS_NOTIFICATION_DURATION,
            closable: true,
            message: t('automation.form.edit.success'),
            description: null,
        });
    };

    const displayErrorAlert = (description?: string) => {
        KitAlert.error({
            showIcon: true,
            duration: ERROR_NOTIFICATION_DURATION,
            closable: true,
            message: t('automation.form.edit.error'),
            description: description ?? null,
        });
    };

    const handleEditAutomation = async (id: string, rule: AutomationFormValues): Promise<boolean> => {
        const {active, label, description, version, trigger, pipeline} = rule;

        try {
            const {errors} = await updateAutomationRule({
                variables: {
                    rule: {
                        id,
                        active,
                        label,
                        description,
                        version,
                        trigger,
                        pipeline,
                    },
                },
            });

            if (errors) {
                displayErrorAlert(errors[0].message);
                return false;
            }

            displaySuccessAlert();
            return true;
        } catch (error) {
            displayErrorAlert(error instanceof Error ? error.message : String(error));
            return false;
        }
    };

    return {editAutomationRule: handleEditAutomation, loading};
};
