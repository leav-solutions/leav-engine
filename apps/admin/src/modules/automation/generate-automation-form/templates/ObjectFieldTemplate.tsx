import {KitSpace} from 'aristid-ds';
import {getUiOptions, type ObjectFieldTemplateProps} from '@rjsf/utils';
import {ObjectFieldGroups} from './components/ObjectFieldGroups';

export type GroupConfig = {
    title: string;
    description?: string;
    step: string;
    fields: string[];
    defaultOpen?: boolean;
};

export const ObjectFieldTemplate = ({properties, uiSchema, schema, registry}: ObjectFieldTemplateProps) => {
    const groups = getUiOptions(uiSchema).groups as GroupConfig[] | undefined;

    // Root form object: renders fields grouped into collapsible sections (e.g. Info, Actions)
    if (groups) {
        return (
            <ObjectFieldGroups
                groups={groups}
                properties={properties}
                schema={schema}
                uiSchema={uiSchema}
                registry={registry}
            />
        );
    }

    // Nested objects (trigger, eventTopic…): renders fields as a flat vertical list
    return (
        <KitSpace direction="vertical" size="s" style={{width: '100%'}}>
            {properties
                .filter(p => !p.hidden)
                .map(p => (
                    <div key={p.name}>{p.content}</div>
                ))}
        </KitSpace>
    );
};
