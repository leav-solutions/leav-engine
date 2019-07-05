import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Accordion, Form, Icon, Tab} from 'semantic-ui-react';
import styled from 'styled-components';
import {AttributesQuery, getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {localizedLabel} from '../../../utils/utils';
import {GET_ATTRIBUTES_attributes} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeType, PermissionsRelation, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import DefineTreePermissionsView from '../../permissions/DefineTreePermissionsView';
import Loading from '../../shared/Loading';

interface IEditAttributePermissionsProps extends WithNamespaces {
    attribute: GET_ATTRIBUTES_attributes;
    onSubmitSettings: (formData: any) => void;
    readOnly: boolean;
}

function EditAttributePermissions({
    attribute,
    onSubmitSettings,
    readOnly,
    i18n,
    t
}: IEditAttributePermissionsProps): JSX.Element {
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

    const _handleSubmit = (formData: any) => {
        onSubmitSettings({id: attribute.id, permissions_conf: {permissionTreeAttributes, relation}});
    };

    /* tslint:disable-next-line:variable-name */
    const FormGroupWithMargin = styled(Form.Group)`
        margin-top: 10px;
    `;

    /* tslint:disable-next-line:variable-name */
    const AccordionWithMargin = styled(Accordion)`
        margin-bottom: 1em;
    `;

    return (
        <AttributesQuery query={getAttributesQuery} variables={{type: [AttributeType.tree]}}>
            {({loading, error, data}) => {
                if (loading) {
                    return <Loading />;
                }

                if (typeof error !== 'undefined') {
                    return <p>Error: {error.message}</p>;
                }

                const treeAttributes = data && data.attributes ? data.attributes : [];

                const treeAttributesOptions = treeAttributes.map(a => ({
                    key: a.id,
                    value: a.id,
                    text: localizedLabel(a.label, i18n)
                }));

                const panes = treeAttributes
                    .filter(a => permissionTreeAttributes.indexOf(a.id) !== -1)
                    .map(a => ({
                        key: a.id,
                        menuItem: localizedLabel(a.label, i18n),
                        render: () => (
                            <Tab.Pane key={a.id} className="grow flex-col height100">
                                {a.linked_tree ? (
                                    <DefineTreePermissionsView
                                        key={a.id}
                                        treeAttribute={a}
                                        permissionType={PermissionTypes.attribute}
                                        applyTo={attribute.id}
                                        readOnly={readOnly}
                                    />
                                ) : (
                                    <p>Missing tree ID</p>
                                )}
                            </Tab.Pane>
                        )
                    }));

                return (
                    <div className="flex-col height100">
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
                                                disabled={readOnly}
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
                                                    disabled={readOnly}
                                                    onChange={_handleRelationChange}
                                                />
                                            </Form.Field>
                                            <Form.Field inline>
                                                <Form.Radio
                                                    name="relation"
                                                    label={t('libraries.permissions_relation_or')}
                                                    value={PermissionsRelation.or}
                                                    checked={relation === PermissionsRelation.or}
                                                    disabled={readOnly}
                                                    onChange={_handleRelationChange}
                                                />
                                            </Form.Field>
                                        </Form.Group>
                                    )}
                                    {!readOnly && (
                                        <FormGroupWithMargin>
                                            <Form.Button>{t('admin.submit')}</Form.Button>
                                        </FormGroupWithMargin>
                                    )}
                                </Form>
                            </Accordion.Content>
                        </AccordionWithMargin>
                        <Tab panes={panes} className="grow flex-col height100" />
                    </div>
                );
            }}
        </AttributesQuery>
    );
}

export default withNamespaces()(EditAttributePermissions);
