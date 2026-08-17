import {KitLoader} from 'aristid-ds';
import {Navigate, useNavigate, useParams} from 'react-router-dom';
import {AdminAbsolutePaths} from '../routes/paths';
import {type AutomationFormValues} from '../automation/types';
import {AutomationForm} from '../automation/generate-automation-form/AutomationForm';
import {useGetAutomationRuleDetails} from '../automation/get-automation-rule-details/useGetAutomationRuleDetails';
import {useEditAutomationRule} from '../automation/edit-automation-rule/useEditAutomationRule';
import {AutomationRuleJsonSchemaFormType} from '../../_gqlTypes';

export const AutomationEdition = () => {
    const navigate = useNavigate();
    const {id} = useParams<{id: string}>();
    const {data, loading: dataLoading} = useGetAutomationRuleDetails({id});
    const {editAutomationRule, loading} = useEditAutomationRule();

    const handleBack = () => navigate(AdminAbsolutePaths.automation);

    const handleSubmit = async (values: AutomationFormValues): Promise<boolean> => editAutomationRule(id!, values);

    const handleDuplicated = (newRuleId: string) => navigate(`${AdminAbsolutePaths.automation}/edit/${newRuleId}`);

    if (dataLoading) {
        return <KitLoader />;
    }

    if (!data) {
        return <Navigate to={AdminAbsolutePaths.notFound} />;
    }

    return (
        <AutomationForm
            key={id} // force a remount on duplication redirect: same route, new record (see useAutomationFormData baseline sync)
            initialValues={data}
            mutationLoading={loading}
            formType={AutomationRuleJsonSchemaFormType.edition}
            onSubmit={handleSubmit}
            onCancel={handleBack}
            ruleId={id}
            onDuplicated={handleDuplicated}
        />
    );
};
