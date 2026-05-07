// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
