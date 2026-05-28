import {ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
import {useCreateAutomationRuleMutation} from '../../../_gqlTypes';
import {KitAlert} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {type AutomationFormValues} from '../types';

const INACTIVE_RULE = false;
const EMPTY_PIPELINE = {steps: []};

export const useCreateAutomationRule = () => {
    const {t} = useTranslation();
    const [createAutomationRule, {loading}] = useCreateAutomationRuleMutation({
        fetchPolicy: 'no-cache', // prevents a stale cached response from masking a submission error on retry
    });

    const displaySuccessAlert = () => {
        KitAlert.success({
            showIcon: true,
            duration: SUCCESS_NOTIFICATION_DURATION,
            closable: true,
            message: t('automation.form.create.success'),
            description: null,
        });
    };

    const displayErrorAlert = (description?: string) => {
        KitAlert.error({
            showIcon: true,
            duration: ERROR_NOTIFICATION_DURATION,
            closable: true,
            message: t('automation.form.create.error'),
            description: description ?? null,
        });
    };

    const handleCreateAutomation = async (rule: AutomationFormValues): Promise<string | null> => {
        const {label, description, trigger, pipeline} = rule;

        try {
            const {data, errors} = await createAutomationRule({
                variables: {
                    rule: {
                        active: INACTIVE_RULE,
                        label,
                        description,
                        trigger,
                        pipeline: pipeline ?? EMPTY_PIPELINE,
                    },
                },
            });

            if (errors) {
                displayErrorAlert(errors[0].message);
                return null;
            }

            displaySuccessAlert();
            return data?.createAutomationRule?.id ?? null;
        } catch (error) {
            displayErrorAlert(error instanceof Error ? error.message : String(error));
            return null;
        }
    };

    return {createAutomationRule: handleCreateAutomation, loading};
};
