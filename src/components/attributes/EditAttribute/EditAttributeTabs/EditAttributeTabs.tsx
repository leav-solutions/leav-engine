import {History, Location} from 'history';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Tab, TabProps} from 'semantic-ui-react';
import useLang from '../../../../hooks/useLang';
import {localizedLabel} from '../../../../utils/utils';
import {GET_ATTRIBUTES_attributes_list} from '../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeType} from '../../../../_gqlTypes/globalTypes';
import {onAttributePostSaveFunc} from '../EditAttribute';
import ActionsListTab from './ActionsListTab';
import EmbeddedFieldsTab from './EmbeddedFieldsTab';
import InfosTab from './InfosTab';
import MetadataTab from './MetadataTab';
import PermissionsTab from './PermissionsTab';
import ValuesListTab from './ValuesListTab';

interface IEditAttributeTabsProps {
    attribute?: GET_ATTRIBUTES_attributes_list;
    onPostSave?: onAttributePostSaveFunc;
    forcedType?: AttributeType;
    history?: History;
    location?: Location;
}

function EditAttributeTabs({
    attribute,
    onPostSave,
    forcedType,
    history,
    location
}: IEditAttributeTabsProps): JSX.Element {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const headerLabel =
        !!attribute && attribute.label ? localizedLabel(attribute.label, availableLanguages) : t('attributes.new');

    const panes = [
        {
            key: 'infos',
            menuItem: t('attributes.informations'),
            render: () => (
                <Tab.Pane key="infos" className="grow">
                    <InfosTab attribute={attribute} onPostSave={onPostSave} forcedType={forcedType} history={history} />
                </Tab.Pane>
            )
        }
    ];

    if (!!attribute) {
        const isMetadataAllowed = [AttributeType.advanced, AttributeType.advanced_link, AttributeType.tree].includes(
            attribute.type
        );

        const isFormatExtended = attribute.format === 'extended';

        panes.push(
            {
                key: 'values_list',
                menuItem: t('attributes.values_list'),
                render: () => {
                    return (
                        <Tab.Pane key="values_list" className="grow flex-col height100">
                            <ValuesListTab attributeId={attribute.id} />
                        </Tab.Pane>
                    );
                }
            },
            {
                key: 'permissions',
                menuItem: t('attributes.permissions'),
                render: () => {
                    return (
                        <Tab.Pane key="permissions" className="grow flex-col height100">
                            <PermissionsTab attribute={attribute} readonly={false} />
                        </Tab.Pane>
                    );
                }
            },
            {
                key: 'actions_list',
                menuItem: t('attributes.action_list'),
                render: () => {
                    return (
                        <Tab.Pane key="actions_list" className="grow flex-col height100">
                            <ActionsListTab attribute={attribute} />
                        </Tab.Pane>
                    );
                }
            }
        );

        if (isMetadataAllowed) {
            panes.push({
                key: 'metadata',
                menuItem: t('attributes.metadata'),
                render: () => {
                    return (
                        <Tab.Pane key="metadata" className="grow flex-col">
                            <MetadataTab attribute={attribute} readonly={false} />
                        </Tab.Pane>
                    );
                }
            });
        }

        if (isFormatExtended) {
            panes.push({
                key: 'embeddedFields',
                menuItem: t('attributes.embedded_fields'),
                render: () => {
                    return (
                        <Tab.Pane key="EmbeddedFields" className="grow flex-col">
                            <EmbeddedFieldsTab attribute={attribute} />
                        </Tab.Pane>
                    );
                }
            });
        }
    }

    const tabName = location ? location.hash.replace('#', '') : undefined;
    const [activeIndex, setActiveIndex] = useState<number | undefined>(
        tabName ? panes.findIndex(p => tabName === p.key) : 0
    );

    const _handleOnTabChange = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: TabProps) => {
        if (data.panes && data.activeIndex !== undefined) {
            setActiveIndex(Number(data.activeIndex.toString()));
            history?.push(`#${data.panes[data.activeIndex].key}`);
        }
    };

    return (
        <>
            <Header className="no-grow">{headerLabel}</Header>
            <Tab
                onTabChange={_handleOnTabChange}
                menu={{secondary: true, pointing: true}}
                panes={panes}
                className="grow flex-col height100"
                activeIndex={activeIndex}
            />
        </>
    );
}

export default EditAttributeTabs;
