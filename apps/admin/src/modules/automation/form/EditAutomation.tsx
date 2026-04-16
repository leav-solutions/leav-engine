// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitLoader} from 'aristid-ds';
import {Navigate, useNavigate, useParams} from 'react-router-dom';
import {AdminAbsolutePaths} from '../../routes/paths';
import {type AutomationFormValues} from './types';
import {AutomationForm} from './AutomationForm';
import {useGetAutomationRuleDetails} from './get-automation-rule-details/useGetAutomationRuleDetails';
import {useEditAutomationRule} from './edit-automation-rule/useEditAutomationRule';

export const EditAutomation = () => {
    const navigate = useNavigate();
    const {id} = useParams<{id: string}>();
    const {data, loading: dataLoading} = useGetAutomationRuleDetails({id});
    const {editAutomationRule, loading} = useEditAutomationRule();

    const handleBack = () => navigate(AdminAbsolutePaths.automation);

    const handleSubmit = async (values: AutomationFormValues) => {
        editAutomationRule(id!, values, handleBack);
    };

    if (dataLoading) {
        return <KitLoader />;
    }

    if (!data) {
        return <Navigate to={AdminAbsolutePaths.notFound} />;
    }

    return (
        <AutomationForm
            initialValues={data}
            loading={loading}
            formType="edition"
            onSubmit={handleSubmit}
            onCancel={handleBack}
        />
    );
};
