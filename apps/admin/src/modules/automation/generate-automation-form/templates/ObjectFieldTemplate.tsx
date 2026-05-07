// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitCollapse, KitIdCard, KitSpace} from 'aristid-ds';
import {getUiOptions, type ObjectFieldTemplateProps} from '@rjsf/utils';

type GroupConfig = {
    title: string;
    description?: string;
    step: string;
    fields: string[];
    defaultOpen?: boolean;
};

export const ObjectFieldTemplate = ({properties, uiSchema}: ObjectFieldTemplateProps) => {
    const options = getUiOptions(uiSchema);
    const groups = options.groups as GroupConfig[] | undefined;

    if (groups) {
        return (
            <KitSpace direction="vertical" size="xs" style={{width: '100%'}}>
                {groups.map(group => {
                    const groupProperties = properties.filter(p => group.fields.includes(p.name));
                    if (groupProperties.length === 0) {
                        return null;
                    }

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
    }

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
