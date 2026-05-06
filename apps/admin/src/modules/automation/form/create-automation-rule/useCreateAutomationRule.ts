// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
import {AutomationRuleEventAction, useCreateAutomationRuleMutation} from '../../../../_gqlTypes';
import {KitAlert} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {type AutomationFormValues} from '../types';

export const useCreateAutomationRule = () => {
    const {t} = useTranslation();
    const [createAutomationRule, {loading, error}] = useCreateAutomationRuleMutation();

    const displaySuccessAlert = () => {
        KitAlert.success({
            showIcon: true,
            duration: SUCCESS_NOTIFICATION_DURATION,
            closable: true,
            message: t('automation.form.create.success'),
            description: null,
        });
    };

    const displayErrorAlert = () => {
        KitAlert.error({
            showIcon: true,
            duration: ERROR_NOTIFICATION_DURATION,
            closable: true,
            message: t('automation.form.create.error'),
            description: null,
        });
    };

    const handleCreateAutomation = async (rule: AutomationFormValues, onSuccess: () => void) => {
        try {
            await createAutomationRule({
                variables: {
                    rule: {
                        ...rule,
                        //TODO: Set a false trigger configuration for now. To replace with real values later.
                        active: rule.active ?? false,
                        trigger: {
                            synchronous: false,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                        },
                        pipeline: {
                            steps: [],
                        },
                        //TODO: Add pipeline configuration.
                    },
                },
            });

            if (error) {
                displayErrorAlert();
                return;
            }

            displaySuccessAlert();
            onSuccess();
        } catch {
            displayErrorAlert();
        }
    };

    return {createAutomationRule: handleCreateAutomation, loading};
};
