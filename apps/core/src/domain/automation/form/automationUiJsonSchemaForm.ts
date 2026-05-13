// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type i18n} from 'i18next';
import {ZodObject, type ZodType} from 'zod';
import {type UiSchema} from '@rjsf/utils';
import {AutomationRuleJsonSchemaFormType} from '../../../_types/automation';
import {type ZodMetaUISchema} from '../../../_types/jsonSchemaForm';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IAutomationTriggersRegistry} from '../triggers/automationTriggersRegistry';
import {type IAutomationActionsRegistry} from '../automationActionsRegistry';

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
    'core.domain.automation.actionsRegistry': IAutomationActionsRegistry;
}

export default function ({
    translator,
    'core.domain.automation.triggers.registry': automationTriggersRegistry,
    'core.domain.automation.actionsRegistry': actionsRegistry,
}: IAutomationUiJsonSchemaFormDomainDeps): IAutomationUiJsonSchemaFormDomain {
    const _buildObjectUiSchema = (schema: ZodType, lng: string): UiSchema => {
        if (!(schema instanceof ZodObject)) {
            return {};
        }

        const result: UiSchema = {};

        for (const [fieldName, fieldSchema] of Object.entries(schema.shape)) {
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
                (acc, trigger) => ({...acc, ..._buildObjectUiSchema(trigger.topicSchema, lng)}),
                {} as UiSchema,
            );

            const actions = actionsRegistry.listAvailableActions();
            const actionParamsUiSchema = actions.reduce(
                (acc, action) => ({...acc, [action.type]: _buildObjectUiSchema(action.paramsSchema, lng)}),
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
                        {
                            title: translator.t('automation.form.sections.pipeline', {lng}),
                            description: translator.t('automation.form.sections.pipeline_description', {lng}),
                            step: '3',
                            fields: ['pipeline'],
                            defaultOpen: true,
                        },
                    ],
                    submitButtonOptions: {
                        norender: true,
                    },
                },
                ...(isEdition
                    ? {
                          active: {
                              'ui:title': translator.t('automation.form.info.active', {lng}),
                          },
                      }
                    : {}),
                label: {
                    'ui:title': translator.t('automation.form.info.label', {lng}),
                    'ui:placeholder': translator.t('automation.form.info.label_placeholder', {lng}),
                },
                description: {
                    'ui:title': translator.t('automation.form.info.description', {lng}),
                    'ui:placeholder': translator.t('automation.form.info.description_placeholder', {lng}),
                },
                trigger: {
                    eventAction: {
                        'ui:title': translator.t('automation.form.trigger.event_action', {lng}),
                        'ui:placeholder': translator.t('automation.form.trigger.event_action_placeholder', {
                            lng,
                        }),
                    },
                    eventTopic: mergedEventTopicUiSchema,
                    synchronous: {
                        'ui:title': translator.t('automation.form.trigger.synchronous', {lng}),
                    },
                },
                pipeline: {
                    steps: {
                        'ui:options': {
                            addLabel: translator.t('automation.form.pipeline.add_action', {lng}),
                            moveUpLabel: translator.t('automation.form.pipeline.move_up', {lng}),
                            moveDownLabel: translator.t('automation.form.pipeline.move_down', {lng}),
                            deleteLabel: translator.t('automation.form.pipeline.delete_action', {lng}),
                            actionTypeLabels: actions.reduce(
                                (acc, action) => ({
                                    ...acc,
                                    [action.type]: translator.t(`automation.form.pipeline.types.${action.type}`, {lng}),
                                }),
                                {} as Record<string, string>,
                            ),
                        },
                        items: {
                            type: {'ui:widget': 'hidden'},
                            name: {
                                'ui:title': translator.t('automation.form.pipeline.action_name', {lng}),
                                'ui:placeholder': translator.t('automation.form.pipeline.action_name_placeholder', {
                                    lng,
                                }),
                            },
                            params: actionParamsUiSchema,
                        },
                    },
                },
            };
        },
    };
}
