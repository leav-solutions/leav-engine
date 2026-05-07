// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

    const handleEditAutomation = async (id: string, rule: AutomationFormValues, onSuccess: () => void) => {
        const {active, label, description, trigger} = rule;

        try {
            const {errors} = await updateAutomationRule({
                variables: {rule: {id, active, label, description, trigger, pipeline: {steps: []}}},
            });

            if (errors) {
                displayErrorAlert(errors[0].message);
                return;
            }

            displaySuccessAlert();
            onSuccess();
        } catch (error) {
            displayErrorAlert(error instanceof Error ? error.message : String(error));
        }
    };

    return {editAutomationRule: handleEditAutomation, loading};
};
