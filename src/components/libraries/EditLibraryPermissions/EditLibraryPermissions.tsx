import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Accordion, Form, Icon} from 'semantic-ui-react';
import {localizedLabel} from 'src/utils/utils';
import {GET_LIBRARIES_libraries, GET_LIBRARIES_libraries_permissionsConf} from 'src/_gqlTypes/GET_LIBRARIES';
import {AttributeType, PermissionsRelation} from 'src/_gqlTypes/globalTypes';

interface IEditLibraryPermissionsProps extends WithNamespaces {
    library: GET_LIBRARIES_libraries;
    onSubmitSettings: (formData: any) => void;
}

function EditLibraryPermissions({library, onSubmitSettings, t, i18n}: IEditLibraryPermissionsProps): JSX.Element {
    const [settingsExpanded, setSettingsExpanded] = React.useState(false);
    const [libPermsConf, setlibPermsConf] = React.useState<GET_LIBRARIES_libraries_permissionsConf>(
        library.permissionsConf || {permissionTreeAttributes: [], relation: PermissionsRelation.and}
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

    return (
        <React.Fragment>
            <Accordion fluid styled>
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
                                    value={libPermsConf ? libPermsConf.permissionTreeAttributes : []}
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
                        <Form.Group style={{marginTop: 10}}>
                            <Form.Button>{t('admin.submit')}</Form.Button>
                        </Form.Group>
                    </Form>
                </Accordion.Content>
            </Accordion>
        </React.Fragment>
    );
}

export default withNamespaces()(EditLibraryPermissions);
