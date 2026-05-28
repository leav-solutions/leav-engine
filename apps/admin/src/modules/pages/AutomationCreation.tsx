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

    const handleSubmit = async (values: AutomationFormValues): Promise<boolean> => {
        const newId = await createAutomationRule(values);

        if (newId === null) {
            return false;
        }

        navigate(`${AdminAbsolutePaths.automation}/edit/${newId}`);
        return true;
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
