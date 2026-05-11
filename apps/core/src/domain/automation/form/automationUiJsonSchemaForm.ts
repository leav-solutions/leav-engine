// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type i18n} from 'i18next';
import {ZodObject, type ZodType} from 'zod';
import {type UiSchema} from '@rjsf/utils';
import {AutomationRuleJsonSchemaFormType, type AutomationRulesEventTopic} from '../../../_types/automation';
import {type ZodMetaUISchema} from '../../../_types/jsonSchemaForm';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IAutomationTriggersRegistry} from '../triggers/automationTriggersRegistry';

export interface IAutomationUiJsonSchemaFormDomain {
    getAutomationRuleUiJsonSchemaForm({
        formType,
        ctx,
    }: {
        formType: AutomationRuleJsonSchemaFormType;
        ctx: IQueryInfos;
    }): Promise<UiSchema>;
}

interface IAutomationUiJsonSchemaFormDomainDeps {
    translator: i18n;
    'core.domain.automation.triggers.registry': IAutomationTriggersRegistry;
}

export default function ({
    translator,
    'core.domain.automation.triggers.registry': automationTriggersRegistry,
}: IAutomationUiJsonSchemaFormDomainDeps): IAutomationUiJsonSchemaFormDomain {
    const _buildEventTopicUiSchema = (
        topicSchema: ZodType<Partial<AutomationRulesEventTopic>>,
        lng: string,
    ): UiSchema => {
        if (!(topicSchema instanceof ZodObject)) {
            return {};
        }

        const result: UiSchema = {};

        for (const [fieldName, fieldSchema] of Object.entries(topicSchema.shape)) {
            const meta = (fieldSchema as ZodType).meta?.() as ZodMetaUISchema | undefined;
            if (!meta) {
                continue;
            }

            const fieldUi: UiSchema = {};

            if (meta.ui?.title) {
                fieldUi['ui:title'] = translator.t(meta.ui.title, {lng});
            }

            if (meta.ui?.placeholder) {
                fieldUi['ui:placeholder'] = translator.t(meta.ui.placeholder, {lng});
            }

            if (Object.keys(fieldUi).length > 0) {
                result[fieldName] = fieldUi;
            }
        }

        return result;
    };

    return {
        async getAutomationRuleUiJsonSchemaForm({formType, ctx}) {
            const isEdition = formType === AutomationRuleJsonSchemaFormType.EDITION;
            const lng = ctx.lang;

            const triggers = automationTriggersRegistry.listTriggers();

            const mergedEventTopicUiSchema = triggers.reduce(
                (acc, trigger) => ({...acc, ..._buildEventTopicUiSchema(trigger.topicSchema, lng)}),
                {} as UiSchema,
            );

            return {
                'ui:options': {
                    groups: [
                        {
                            title: translator.t('automation.form.sections.info', {lng}),
                            step: '1',
                            fields: isEdition ? ['active', 'label', 'description'] : ['label', 'description'],
                            defaultOpen: true,
                        },
                        {
                            title: translator.t('automation.form.sections.trigger', {lng}),
                            description: translator.t('automation.form.sections.trigger_description', {lng}),
                            step: '2',
                            fields: ['trigger'],
                            defaultOpen: true,
                        },
                    ],
                },
                ...(isEdition
                    ? {
                          active: {
                              'ui:title': translator.t('automation.form.fields.active', {lng}),
                          },
                      }
                    : {}),
                label: {
                    'ui:title': translator.t('automation.form.fields.label', {lng}),
                    'ui:placeholder': translator.t('automation.form.fields.label_placeholder', {lng}),
                },
                description: {
                    'ui:title': translator.t('automation.form.fields.description', {lng}),
                    'ui:placeholder': translator.t('automation.form.fields.description_placeholder', {lng}),
                },
                trigger: {
                    eventAction: {
                        'ui:title': translator.t('automation.form.fields.trigger_event_action', {lng}),
                        'ui:placeholder': translator.t('automation.form.fields.trigger_event_action_placeholder', {
                            lng,
                        }),
                    },
                    eventTopic: mergedEventTopicUiSchema,
                    synchronous: {
                        'ui:title': translator.t('automation.form.fields.synchronous', {lng}),
                    },
                },
            };
        },
    };
}
