import {KitCollapse, KitIdCard, KitSpace} from 'aristid-ds';
import {getUiOptions, type ObjectFieldTemplateProps} from '@rjsf/utils';
import {type GroupConfig} from '../ObjectFieldTemplate';
import {AddPipelineStepButton} from './AddPipelineStepButton';
import {type AutomationFormContext} from '../../../types';
import {type AutomationRuleActions} from '../../../../../_gqlTypes';
import {extractPipelineActionTypes} from '../../utils/extractPipelineActionTypes';

type ObjectFieldGroupsProps = {
    groups: GroupConfig[];
    properties: ObjectFieldTemplateProps['properties'];
    schema: ObjectFieldTemplateProps['schema'];
    uiSchema: ObjectFieldTemplateProps['uiSchema'];
    registry: ObjectFieldTemplateProps['registry'];
};

export const ObjectFieldGroups = ({groups, properties, schema, uiSchema, registry}: ObjectFieldGroupsProps) => {
    const ctx = registry.formContext as AutomationFormContext | undefined;

    const actionTypes = extractPipelineActionTypes(schema);

    const {addLabel, actionTypeLabels} = getUiOptions(uiSchema?.pipeline?.steps) as {
        addLabel?: string;
        actionTypeLabels?: Record<AutomationRuleActions, string>;
    };

    const actionTypeItems = actionTypes?.map(type => ({value: type, label: actionTypeLabels?.[type] ?? type}));

    return (
        <KitSpace direction="vertical" size="xs" style={{width: '100%'}}>
            {groups.map(group => {
                const groupProperties = properties.filter(p => group.fields.includes(p.name));
                if (groupProperties.length === 0) {
                    return null;
                }

                const shouldDisplayAddPipelineStepButton =
                    group.fields.includes('pipeline') && ctx?.addPipelineStep && actionTypeItems;

                return (
                    <KitCollapse
                        key={group.step}
                        defaultActiveKey={1}
                        items={[
                            {
                                key: 1,
                                label: (
                                    <KitIdCard
                                        avatarProps={{label: group.step, shape: 'square'}}
                                        title={group.title}
                                        description={group.description}
                                        size="m"
                                    />
                                ),
                                extra: shouldDisplayAddPipelineStepButton ? (
                                    <AddPipelineStepButton
                                        actionTypes={actionTypeItems}
                                        onAdd={ctx.addPipelineStep}
                                        addLabel={addLabel}
                                    />
                                ) : undefined,
                                children: (
                                    <KitSpace direction="vertical" size="s" style={{width: '100%'}}>
                                        {groupProperties.map(p => (
                                            <div key={p.name}>{p.content}</div>
                                        ))}
                                    </KitSpace>
                                ),
                            },
                        ]}
                    />
                );
            })}
        </KitSpace>
    );
};
