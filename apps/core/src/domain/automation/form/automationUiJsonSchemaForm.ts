// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type i18n} from 'i18next';
import {type UiSchema} from '@rjsf/utils';
import {AutomationRuleJsonSchemaFormType} from '../../../_types/automation';
import {type IQueryInfos} from '../../../_types/queryInfos';

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
}

export default function ({translator}: IAutomationUiJsonSchemaFormDomainDeps): IAutomationUiJsonSchemaFormDomain {
    return {
        async getAutomationRuleUiJsonSchemaForm({formType, ctx}) {
            const isEdition = formType === AutomationRuleJsonSchemaFormType.EDITION;
            const lng = ctx.lang;

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
                    eventTopic: {
                        library: {
                            'ui:title': translator.t('automation.form.fields.event_topic_library', {lng}),
                            'ui:placeholder': translator.t('automation.form.fields.event_topic_library_placeholder', {
                                lng,
                            }),
                        },
                        attribute: {
                            'ui:title': translator.t('automation.form.fields.event_topic_attribute', {lng}),
                            'ui:placeholder': translator.t('automation.form.fields.event_topic_attribute_placeholder', {
                                lng,
                            }),
                        },
                    },
                    synchronous: {
                        'ui:title': translator.t('automation.form.fields.synchronous', {lng}),
                    },
                },
            };
        },
    };
}
