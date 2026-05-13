import {type UiSchema, type RJSFSchema} from '@rjsf/utils';
import {type AutomationRuleJsonSchemaFormType, useGetAutomationRuleFormQuery} from '../../../../_gqlTypes';

export const useGetAutomationRuleForm = ({formType}: {formType: AutomationRuleJsonSchemaFormType}) => {
    const {data, loading, error} = useGetAutomationRuleFormQuery({
        variables: {formType},
    });

    if (loading || error || !data) {
        return {formSchema: null, uiSchema: null, loading, error};
    }

    return {
        formSchema: data.automationRuleForm.jsonSchema as RJSFSchema,
        uiSchema: data.automationRuleForm.uiSchema as UiSchema,
        loading,
        error,
    };
};
