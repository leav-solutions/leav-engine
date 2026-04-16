// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useNavigate} from 'react-router-dom';
import {AdminAbsolutePaths} from '../../routes/paths';
import {type AutomationFormValues} from './types';
import {AutomationForm} from './AutomationForm';
import {useCreateAutomationRule} from './create-automation-rule/useCreateAutomationRule';

const CREATION_FORM_INITIAL_VALUES: AutomationFormValues = {
    label: '',
    description: '',
};

export const CreateAutomation = () => {
    const navigate = useNavigate();
    const {createAutomationRule, loading} = useCreateAutomationRule();

    const handleBack = () => navigate(AdminAbsolutePaths.automation);

    const handleSubmit = async (values: AutomationFormValues) => {
        createAutomationRule(values, handleBack);
    };

    return (
        <AutomationForm
            initialValues={CREATION_FORM_INITIAL_VALUES}
            loading={loading}
            formType="creation"
            onSubmit={handleSubmit}
            onCancel={handleBack}
        />
    );
};
