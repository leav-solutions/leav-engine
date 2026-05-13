import {KitButton, KitGrid, KitIdCard, KitLoader, KitSpace} from 'aristid-ds';
import {useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {BackButton} from '../../ui/button/BackButton';
import {PageContainer} from '../../ui/page/PageContainer';
import {PageHeader} from '../../ui/page/PageHeader';
import {type AutomationFormValues} from '../types';
import {COL_RESPONSIVE_CONFIG} from './constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faSave} from '@fortawesome/free-solid-svg-icons';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import {AutomationRuleJsonSchemaFormType} from '../../../_gqlTypes';
import {useGetAutomationRuleForm} from './get-automation-rule-form/useGetAutomationRuleForm';
import {TextWidget} from './widgets/TextWidget';
import {SelectWidget} from './widgets/SelectWidget';
import {CheckboxWidget} from './widgets/CheckboxWidget';
import {ObjectFieldTemplate} from './templates/ObjectFieldTemplate';
import {FieldTemplate} from './templates/FieldTemplate';
import {ArrayFieldTemplate} from './templates/ArrayFieldTemplate';
import {ArrayFieldItemTemplate} from './templates/ArrayFieldItemTemplate';
import {useAutomationFormData} from './utils/useAutomationFormData';
import {useAutomationFormNavigation} from './utils/useAutomationFormNavigation';
import {makeTransformErrors} from './utils/transformErrors';

type AutomationFormProps = {
    initialValues: AutomationFormValues | null;
    mutationLoading: boolean;
    formType: AutomationRuleJsonSchemaFormType;
    onSubmit: (values: AutomationFormValues) => Promise<void>;
    onCancel: () => void;
};

export const AutomationForm = ({initialValues, mutationLoading, formType, onSubmit, onCancel}: AutomationFormProps) => {
    const {t} = useTranslation();
    const formRef = useRef(null);
    const isCreationForm = formType === AutomationRuleJsonSchemaFormType.creation;

    const {formSchema, uiSchema, loading: schemaLoading} = useGetAutomationRuleForm({formType});

    const {formData, hasUnsavedChanges, handleChange, handleFormSubmit, addPipelineStep} = useAutomationFormData({
        initialValues,
        isCreationForm,
        formSchema,
        onSubmit,
    });

    const {handleCancel} = useAutomationFormNavigation({hasUnsavedChanges, onCancel});

    const handleSubmitClick = () => {
        formRef.current?.submit();
    };

    return (
        <KitGrid.KitRow>
            <KitGrid.KitCol
                xs={{span: COL_RESPONSIVE_CONFIG.xs.span, push: COL_RESPONSIVE_CONFIG.xs.push}}
                sm={{span: COL_RESPONSIVE_CONFIG.sm.span, push: COL_RESPONSIVE_CONFIG.sm.push}}
                md={{span: COL_RESPONSIVE_CONFIG.md.span, push: COL_RESPONSIVE_CONFIG.md.push}}
                xl={{span: COL_RESPONSIVE_CONFIG.xl.span, push: COL_RESPONSIVE_CONFIG.xl.push}}
                xxl={{span: COL_RESPONSIVE_CONFIG.xxl.span, push: COL_RESPONSIVE_CONFIG.xxl.push}}
            >
                <PageContainer>
                    <PageHeader
                        extraAlignLeft={
                            <KitSpace direction="horizontal" size="xs">
                                <BackButton onClick={handleCancel} />
                                <KitIdCard
                                    title={
                                        isCreationForm
                                            ? t('automation.form.create.title')
                                            : t('automation.form.edit.title')
                                    }
                                    size="s"
                                />
                            </KitSpace>
                        }
                        extraAlignRight={
                            <KitSpace direction="horizontal" size="xs">
                                <KitButton size="m" onClick={handleCancel}>
                                    {t('admin.cancel')}
                                </KitButton>
                                <KitButton
                                    size="m"
                                    type="primary"
                                    onClick={handleSubmitClick}
                                    loading={mutationLoading}
                                    disabled={!hasUnsavedChanges || mutationLoading || schemaLoading}
                                    icon={<FontAwesomeIcon icon={isCreationForm ? faPlus : faSave} />}
                                >
                                    {isCreationForm ? t('admin.create') : t('admin.save')}
                                </KitButton>
                            </KitSpace>
                        }
                    />
                    {schemaLoading && <KitLoader />}
                    {!schemaLoading && formSchema && uiSchema && (
                        <Form<AutomationFormValues>
                            ref={formRef}
                            schema={formSchema}
                            uiSchema={uiSchema}
                            formData={formData}
                            validator={validator}
                            formContext={{
                                addPipelineStep,
                                pipelineStepsData: formData?.pipeline?.steps,
                            }}
                            widgets={{
                                TextWidget,
                                SelectWidget,
                                CheckboxWidget,
                            }}
                            templates={{
                                ObjectFieldTemplate,
                                FieldTemplate,
                                ArrayFieldTemplate,
                                ArrayFieldItemTemplate,
                            }}
                            onChange={handleChange}
                            onSubmit={handleFormSubmit}
                            transformErrors={makeTransformErrors(t)}
                            noHtml5Validate
                            showErrorList={false}
                        />
                    )}
                </PageContainer>
            </KitGrid.KitCol>
        </KitGrid.KitRow>
    );
};
