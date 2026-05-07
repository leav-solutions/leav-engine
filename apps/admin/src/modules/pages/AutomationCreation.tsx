// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useNavigate} from 'react-router-dom';
import {AdminAbsolutePaths} from '../routes/paths';
import {type AutomationFormValues} from '../automation/types';
import {AutomationForm} from '../automation/generate-automation-form/AutomationForm';
import {useCreateAutomationRule} from '../automation/create-automation-rule/useCreateAutomationRule';
import {AutomationRuleJsonSchemaFormType} from '../../_gqlTypes';

export const AutomationCreation = () => {
    const navigate = useNavigate();
    const {createAutomationRule, loading} = useCreateAutomationRule();

    const handleBack = () => navigate(AdminAbsolutePaths.automation);

    const handleSubmit = async (values: AutomationFormValues) => {
        createAutomationRule(values, handleBack);
    };

    return (
        <AutomationForm
            initialValues={null}
            mutationLoading={loading}
            formType={AutomationRuleJsonSchemaFormType.creation}
            onSubmit={handleSubmit}
            onCancel={handleBack}
        />
    );
};
