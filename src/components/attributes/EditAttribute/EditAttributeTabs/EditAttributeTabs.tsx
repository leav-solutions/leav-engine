import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import useLang from '../../../../hooks/useLang';
import {localizedLabel} from '../../../../utils/utils';
import {GET_ATTRIBUTES_attributes_list} from '../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeType} from '../../../../_gqlTypes/globalTypes';
import {onAttributePostSaveFunc} from '../EditAttribute';
import ActionsListTab from './ActionsListTab';
import InfosTab from './InfosTab';
import MetadataTab from './MetadataTab';
import PermissionsTab from './PermissionsTab';
import {History} from 'history';

interface IEditAttributeTabsProps {
    attribute?: GET_ATTRIBUTES_attributes_list;
    onPostSave?: onAttributePostSaveFunc;
    forcedType?: AttributeType;
    history?: History;
}

function EditAttributeTabs({attribute, onPostSave, forcedType, history}: IEditAttributeTabsProps): JSX.Element {
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

        panes.push(
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
    }

    return (
        <>
            <Header className="no-grow">{headerLabel}</Header>
            <Tab menu={{secondary: true, pointing: true}} panes={panes} className="grow flex-col height100" />
        </>
    );
}

export default EditAttributeTabs;
