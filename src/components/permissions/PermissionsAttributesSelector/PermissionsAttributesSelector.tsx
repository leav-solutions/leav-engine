// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Accordion, Form, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils';
import {PermissionsRelation, Treepermissions_confInput} from '../../../_gqlTypes/globalTypes';

interface IPermissionsAttributesSelectorProps {
    attributes: Array<{id: string; label: SystemTranslation | null}>;
    permissionsConf: Treepermissions_confInput | null;
    readonly: boolean;
    onSubmitSettings: (conf: Treepermissions_confInput) => void;
}

const AccordionWithMargin = styled(Accordion)`
    margin-bottom: 1em;
`;

const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

function PermissionsAttributesSelector({
    permissionsConf,
    attributes,
    onSubmitSettings,
    readonly
}: IPermissionsAttributesSelectorProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const defaultPermsConf: Treepermissions_confInput = {
        permissionTreeAttributes: [],
        relation: PermissionsRelation.and
    };
    const [settingsExpanded, setSettingsExpanded] = React.useState(false);

    const [permsConf, setPermsConf] = React.useState<Treepermissions_confInput>({
        ...defaultPermsConf,
        ...permissionsConf
    });
    const onClickToggle = () => setSettingsExpanded(!settingsExpanded);

    const treeAttributesOptions = attributes.map(a => ({
        key: a.id,
        value: a.id,
        text: localizedLabel(a.label, lang)
    }));

    const _handleSubmit = (formData: any) => {
        onSubmitSettings(permsConf);
    };

    const _handleChange = (e: React.SyntheticEvent, data: any) => {
        setPermsConf({...permsConf, [data.name]: data.value});
    };

    return (
        <AccordionWithMargin fluid styled>
            <Accordion.Title index={0} active={settingsExpanded} onClick={onClickToggle} data-testid="dropdown-toggle">
                <Icon name="dropdown" />
                {t('libraries.permissions_settings_title')}
            </Accordion.Title>
            <Accordion.Content index={0} active={settingsExpanded} data-testid="content-permissions-conf">
                <Form onSubmit={_handleSubmit} name="permissions-conf-form">
                    <Form.Group grouped>
                        <Form.Field inline>
                            <Form.Dropdown
                                search
                                selection
                                multiple
                                options={treeAttributesOptions}
                                name="permissionTreeAttributes"
                                disabled={readonly}
                                label={t('trees.title')}
                                value={permsConf.permissionTreeAttributes}
                                onChange={_handleChange}
                            />
                        </Form.Field>
                    </Form.Group>
                    {permsConf.permissionTreeAttributes.length > 1 && (
                        <Form.Group inline>
                            <label>{t('libraries.permissions_relation')}</label>
                            <Form.Field inline>
                                <Form.Radio
                                    name="relation"
                                    disabled={readonly}
                                    label={t('libraries.permissions_relation_and')}
                                    value={PermissionsRelation.and}
                                    checked={permsConf.relation === PermissionsRelation.and}
                                    onChange={_handleChange}
                                    data-test-id="relation-and"
                                />
                            </Form.Field>
                            <Form.Field inline>
                                <Form.Radio
                                    name="relation"
                                    disabled={readonly}
                                    label={t('libraries.permissions_relation_or')}
                                    value={PermissionsRelation.or}
                                    checked={permsConf.relation === PermissionsRelation.or}
                                    onChange={_handleChange}
                                    data-test-id="relation-or"
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
    );
}

export default PermissionsAttributesSelector;
