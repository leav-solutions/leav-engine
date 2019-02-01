import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Accordion, Form, Icon, Tab} from 'semantic-ui-react';
import DefineLibPermissionsView from 'src/components/permissions/DefineLibPermissionsView';
import DefineTreePermissionsView from 'src/components/permissions/DefineTreePermissionsView';
import {localizedLabel} from 'src/utils/utils';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';
import {AttributeType, PermissionsRelation, PermissionTypes} from 'src/_gqlTypes/globalTypes';
import styled from 'styled-components';

interface IEditLibraryPermissionsProps extends WithNamespaces {
    library: GET_LIBRARIES_libraries;
    onSubmitSettings: (formData: any) => void;
}

interface IEditLibraryPermissionsState {
    permissionTreeAttributes: string[];
    relation: PermissionsRelation;
}

/* tslint:disable-next-line:variable-name */
const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

/* tslint:disable-next-line:variable-name */
const AccordionWithMargin = styled(Accordion)`
    margin-bottom: 1em;
`;

function EditLibraryPermissions({library, onSubmitSettings, t, i18n}: IEditLibraryPermissionsProps): JSX.Element {
    const defaultPermsConf = {permissionTreeAttributes: [], relation: PermissionsRelation.and};
    const [settingsExpanded, setSettingsExpanded] = React.useState(false);
    const [libPermsConf, setlibPermsConf] = React.useState<IEditLibraryPermissionsState>(
        library.permissionsConf
            ? {
                  permissionTreeAttributes: library.permissionsConf.permissionTreeAttributes.map(a => a.id),
                  relation: library.permissionsConf.relation
              }
            : {permissionTreeAttributes: [], relation: PermissionsRelation.and}
    );
    const onClickToggle = () => setSettingsExpanded(!settingsExpanded);

    const _handleSubmit = (formData: any) => {
        onSubmitSettings({id: library.id, permissionsConf: libPermsConf});
    };

    const libTreeAttributesOptions = library.attributes
        ? library.attributes
              .filter(a => a.type === AttributeType.tree)
              .map(a => ({
                  key: a.id,
                  value: a.id,
                  text: localizedLabel(a.label, i18n)
              }))
        : [];

    const _handleChange = (e: React.SyntheticEvent, data: any) => {
        setlibPermsConf({...libPermsConf, [data.name]: data.value});
    };

    const permsConf = library.permissionsConf || defaultPermsConf;
    const panes = permsConf.permissionTreeAttributes.map(a => ({
        key: a.id,
        menuItem: localizedLabel(a.label, i18n),
        render: () => (
            <Tab.Pane key={a.id} className="grow flex-col height100">
                {a.linked_tree ? (
                    <DefineTreePermissionsView
                        key={a.id}
                        treeAttribute={a}
                        permissionType={PermissionTypes.record}
                        applyTo={library.id}
                    />
                ) : (
                    <p>Missing tree ID</p>
                )}
            </Tab.Pane>
        )
    }));

    panes.unshift({
        key: 'libPermissions',
        menuItem: t('permissions.library_tab_name'),
        render: () => (
            <Tab.Pane key="libPermissions" className="grow flex-col height100">
                {<DefineLibPermissionsView key="libPermissions" applyTo={library.id} />}
            </Tab.Pane>
        )
    });

    return (
        <div className="flex-col height100">
            <AccordionWithMargin fluid styled>
                <Accordion.Title index={0} active={settingsExpanded} onClick={onClickToggle}>
                    <Icon name="dropdown" />
                    {t('libraries.permissions_settings_title')}
                </Accordion.Title>
                <Accordion.Content index={0} active={settingsExpanded}>
                    <Form onSubmit={_handleSubmit}>
                        <Form.Group grouped>
                            <Form.Field inline>
                                <Form.Dropdown
                                    search
                                    selection
                                    multiple
                                    options={libTreeAttributesOptions}
                                    name="permissionTreeAttributes"
                                    label={t('trees.title')}
                                    value={libPermsConf.permissionTreeAttributes}
                                    onChange={_handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        {libPermsConf.permissionTreeAttributes.length > 1 && (
                            <Form.Group inline>
                                <label>{t('libraries.permissions_relation')}</label>
                                <Form.Field inline>
                                    <Form.Radio
                                        name="relation"
                                        label={t('libraries.permissions_relation_and')}
                                        value={PermissionsRelation.and}
                                        checked={libPermsConf.relation === PermissionsRelation.and}
                                        onChange={_handleChange}
                                    />
                                </Form.Field>
                                <Form.Field inline>
                                    <Form.Radio
                                        name="relation"
                                        label={t('libraries.permissions_relation_or')}
                                        value={PermissionsRelation.or}
                                        checked={libPermsConf.relation === PermissionsRelation.or}
                                        onChange={_handleChange}
                                    />
                                </Form.Field>
                            </Form.Group>
                        )}
                        <FormGroupWithMargin>
                            <Form.Button>{t('admin.submit')}</Form.Button>
                        </FormGroupWithMargin>
                    </Form>
                </Accordion.Content>
            </AccordionWithMargin>
            <Tab panes={panes} className="grow flex-col height100" />
        </div>
    );
}
export default withNamespaces()(EditLibraryPermissions);
