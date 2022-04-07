// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Accordion, Form, Icon, Tab} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import useLang from '../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../utils';
import {GET_ATTRIBUTES_attributes_list_TreeAttribute} from '../../../../../../_gqlTypes/GET_ATTRIBUTES';
import {GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute} from '../../../../../../_gqlTypes/GET_LIB_BY_ID';
import {PermissionsRelation, PermissionTypes, Treepermissions_confInput} from '../../../../../../_gqlTypes/globalTypes';
import DefinePermByUserGroupView from '../../../../../permissions/DefinePermByUserGroupView';
import DefineTreePermissionsView from '../../../../../permissions/DefineTreePermissionsView';

interface IPermissionsContentProps {
    attribute: GET_ATTRIBUTE_BY_ID_attributes_list;
    treeAttributes: GET_ATTRIBUTES_attributes_list_TreeAttribute[];
    onSubmitSettings: (conf: Treepermissions_confInput) => void;
    readonly: boolean;
}

const AccordionWithMargin = styled(Accordion)`
    margin-bottom: 1em;
`;

const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

function PermissionsContent({
    attribute,
    onSubmitSettings,
    treeAttributes,
    readonly
}: IPermissionsContentProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();

    const [permissionTreeAttributes, setPermissionTreeAttributes] = React.useState<string[]>(
        attribute.permissions_conf ? attribute.permissions_conf.permissionTreeAttributes.map(a => a.id) : []
    );
    const _handleTreesChange = (e, data) => setPermissionTreeAttributes(data.value);

    const [relation, setRelation] = React.useState<PermissionsRelation>(
        attribute.permissions_conf ? attribute.permissions_conf.relation : PermissionsRelation.and
    );
    const _handleRelationChange = (e, data) => setRelation(data.value);

    const [settingsExpanded, setSettingsExpanded] = React.useState<boolean>(false);
    const onClickToggle = () => setSettingsExpanded(!settingsExpanded);

    const _handleSubmit = () => {
        onSubmitSettings({permissionTreeAttributes, relation});
    };

    const treeAttributesOptions = useMemo(
        () =>
            treeAttributes.map(a => ({
                key: a.id,
                value: a.id,
                text: localizedLabel(a.label, lang)
            })),
        [treeAttributes, lang]
    );

    const panes = treeAttributes
        .filter(a => permissionTreeAttributes.indexOf(a.id) !== -1)
        .map(a => ({
            key: a.id,
            menuItem: localizedLabel(a.label, lang),
            render: () => (
                <Tab.Pane key={a.id} className="grow flex-col height100">
                    {((a as unknown) as GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute)
                        .linked_tree ? (
                        <DefineTreePermissionsView
                            key={a.id}
                            treeAttribute={a}
                            permissionType={PermissionTypes.record_attribute}
                            applyTo={attribute.id}
                            readOnly={readonly}
                        />
                    ) : (
                        <p>Missing tree ID</p>
                    )}
                </Tab.Pane>
            )
        }));

    panes.unshift({
        key: 'libPermissions',
        menuItem: t('permissions.attribute_tab_name'),
        render: () => (
            <Tab.Pane key="libPermissions" className="grow flex-col height100">
                {
                    <DefinePermByUserGroupView
                        type={PermissionTypes.attribute}
                        key="attrPermissions"
                        applyTo={attribute.id}
                        readOnly={readonly}
                    />
                }
            </Tab.Pane>
        )
    });

    return (
        <>
            <AccordionWithMargin fluid styled>
                <Accordion.Title index={0} active={settingsExpanded} onClick={onClickToggle}>
                    <Icon name="dropdown" />
                    {t('attributes.permissions_settings_title')}
                </Accordion.Title>
                <Accordion.Content index={0} active={settingsExpanded}>
                    <Form onSubmit={_handleSubmit}>
                        <Form.Group grouped>
                            <Form.Field inline>
                                <Form.Dropdown
                                    search
                                    selection
                                    multiple
                                    options={treeAttributesOptions}
                                    name="permissionTreeAttributes"
                                    label={t('trees.title')}
                                    value={permissionTreeAttributes}
                                    disabled={readonly}
                                    onChange={_handleTreesChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        {permissionTreeAttributes.length > 1 && (
                            <Form.Group inline>
                                <label>{t('libraries.permissions_relation')}</label>
                                <Form.Field inline>
                                    <Form.Radio
                                        name="relation"
                                        label={t('libraries.permissions_relation_and')}
                                        value={PermissionsRelation.and}
                                        checked={relation === PermissionsRelation.and}
                                        disabled={readonly}
                                        onChange={_handleRelationChange}
                                    />
                                </Form.Field>
                                <Form.Field inline>
                                    <Form.Radio
                                        name="relation"
                                        label={t('libraries.permissions_relation_or')}
                                        value={PermissionsRelation.or}
                                        checked={relation === PermissionsRelation.or}
                                        disabled={readonly}
                                        onChange={_handleRelationChange}
                                    />
                                </Form.Field>
                            </Form.Group>
                        )}
                        {!readonly && (
                            <FormGroupWithMargin>
                                <Form.Button>{t('admin.submit')}</Form.Button>
                            </FormGroupWithMargin>
                        )}
                    </Form>
                </Accordion.Content>
            </AccordionWithMargin>
            <Tab panes={panes} className="grow flex-col height100" />
        </>
    );
}

export default PermissionsContent;
