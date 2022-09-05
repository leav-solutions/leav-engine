// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useLang from 'hooks/useLang';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Popup, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {localizedLabel} from 'utils';
import {GET_ATTRIBUTESVariables} from '_gqlTypes/GET_ATTRIBUTES';
import {GET_LIB_BY_ID_libraries_list, GET_LIB_BY_ID_libraries_list_permissions_conf} from '_gqlTypes/GET_LIB_BY_ID';
import {AttributeType, PermissionsRelation, Treepermissions_confInput} from '_gqlTypes/globalTypes';
import SimplisticButton from '../SimplisticButton';
import PermissionsAttributeSelector from './PermissionsAttributeSelector';

const PopContent = styled.div`
    display: flex;
    gap: 1rem;
    flex-direction: column;
    min-width: 225px;
    max-width: 90vw;
    font-size: 1rem;
`;

const Trigger = styled.div`
    cursor: pointer;
`;

const FooterCell = styled(Table.Cell)<{$hasAttributes: boolean}>`
    &&& {
        ${props => !props.$hasAttributes && 'border-top: none;'}
    }
`;

const defaultRelation = PermissionsRelation.and;

interface IPermissionsSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
    library?: GET_LIB_BY_ID_libraries_list;
    permissionsSettings: GET_LIB_BY_ID_libraries_list_permissions_conf;
    onChangeSettings: (settings: Treepermissions_confInput) => void;
    readonly: boolean;
}

function PermissionsSettings({
    permissionsSettings,
    onChangeSettings,
    library,
    readonly,
    ...elementProps
}: IPermissionsSettingsProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const [activeOperator, setActiveOperator] = React.useState<PermissionsRelation>(
        permissionsSettings?.relation ?? PermissionsRelation.and
    );
    const permissionsAttributes = permissionsSettings?.permissionTreeAttributes ?? [];

    const PopupTrigger = (
        <Trigger {...elementProps}>
            <Icon name="cog" />
            {t('permissions_settings.title')}
        </Trigger>
    );

    const operators = Object.values(PermissionsRelation);

    const _handleOperatorChange = (operator: PermissionsRelation) => () => {
        setActiveOperator(operator);
        onChangeSettings({
            permissionTreeAttributes: permissionsSettings.permissionTreeAttributes.map(attr => attr.id),
            relation: operator
        });
    };

    const _handleAttributeSelected = (selectedAttribute: string) => {
        const newSettings = {
            permissionTreeAttributes: [...permissionsAttributes.map(a => a.id), selectedAttribute],
            relation: permissionsSettings?.relation ?? defaultRelation
        };

        onChangeSettings(newSettings);
    };

    const _handleRemoveAttribute = (removedAttributeId: string) => () => {
        onChangeSettings({
            permissionTreeAttributes: permissionsAttributes
                .map(a => a.id)
                .filter(attributeId => attributeId !== removedAttributeId),
            relation: permissionsSettings?.relation ?? defaultRelation
        });
    };

    const attributeSelectionFilters: GET_ATTRIBUTESVariables = {
        type: [AttributeType.tree]
    };

    if (library) {
        attributeSelectionFilters.libraries = [library.id];
    }

    return (
        <Popup trigger={PopupTrigger} on="click" closeOnEscape position="bottom left" style={{maxWidth: 'none'}}>
            <PopContent>
                <div>
                    <h5>{t('permissions_settings.permissions_attributes')}</h5>
                    <Table compact>
                        <Table.Body>
                            {permissionsAttributes.map(a => (
                                <Table.Row key={a.id}>
                                    <Table.Cell>{localizedLabel(a.label, lang)}</Table.Cell>
                                    <Table.Cell width={3}>
                                        {!readonly && (
                                            <SimplisticButton
                                                aria-label="remove"
                                                icon="trash alternate outline"
                                                onClick={_handleRemoveAttribute(a.id)}
                                            />
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                        {!readonly && (
                            <Table.Footer>
                                <Table.Row>
                                    <FooterCell colSpan={2} $hasAttributes={!!permissionsAttributes.length}>
                                        <PermissionsAttributeSelector
                                            library={library}
                                            onSelectAttribute={_handleAttributeSelected}
                                            selectedAttributes={permissionsAttributes.map(a => a.id)}
                                        />
                                    </FooterCell>
                                </Table.Row>
                            </Table.Footer>
                        )}
                    </Table>
                </div>
                {permissionsAttributes.length > 1 && (
                    <div>
                        <h5>{t('permissions_settings.operator')}</h5>
                        <Button.Group basic>
                            {operators.map(operator => (
                                <Button
                                    key={operator}
                                    disabled={readonly}
                                    compact
                                    onClick={_handleOperatorChange(operator)}
                                    active={activeOperator === operator}
                                >
                                    {t(`permissions_settings.operator_${operator}`)}
                                </Button>
                            ))}
                        </Button.Group>
                    </div>
                )}
            </PopContent>
        </Popup>
    );
}

export default PermissionsSettings;
