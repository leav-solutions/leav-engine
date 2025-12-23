// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type GET_LIB_BY_ID_libraries_list} from '_gqlTypes/GET_LIB_BY_ID';
import useLang from 'hooks/useLang';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Icon, Popup, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {localizedLabel} from 'utils';
import SimplisticButton from '../../../../../shared/SimplisticButton';
import DependenciesAttributeSelector from './DependenciesAttributeSelector';
import {type GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_dependent_values} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {type TreePermissionsDependentValuesConfInput} from '_gqlTypes';

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

export type ITreePermissionsDependentValuesConf =
    GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_dependent_values;

interface IPermissionsSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
    library?: GET_LIB_BY_ID_libraries_list;
    dependenciesSettings: ITreePermissionsDependentValuesConf;
    onChangeSettings: (settings: TreePermissionsDependentValuesConfInput) => void;
}

function DependenciesSettings({
    dependenciesSettings,
    onChangeSettings,
    library,
    ...elementProps
}: IPermissionsSettingsProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const dependentAttributes = dependenciesSettings?.dependenciesTreeAttributes ?? [];

    const PopupTrigger = (
        <Trigger {...elementProps}>
            <Icon name="cog" />
            {t('attributes.dependencies.settings.title')}
        </Trigger>
    );

    const _handleAttributeSelected = (selectedAttribute: string) => {
        onChangeSettings({
            dependenciesTreeAttributes: [...dependentAttributes.map(a => a.id), selectedAttribute],
        });
    };

    const _handleRemoveAttribute = (removedAttributeId: string) => () => {
        onChangeSettings({
            dependenciesTreeAttributes: dependentAttributes
                .map(a => a.id)
                .filter(attributeId => attributeId !== removedAttributeId),
        });
    };

    return (
        <Popup trigger={PopupTrigger} on="click" closeOnEscape position="bottom left" style={{maxWidth: 'none'}}>
            <PopContent>
                <div>
                    <h5>{t('attributes.dependencies.settings.dependent_attributes')}</h5>
                    <Table compact>
                        <Table.Body>
                            {dependentAttributes.map(a => (
                                <Table.Row key={a.id}>
                                    <Table.Cell>{localizedLabel(a.label, lang)}</Table.Cell>
                                    <Table.Cell width={3}>
                                        <SimplisticButton
                                            aria-label="remove"
                                            icon="trash alternate outline"
                                            onClick={_handleRemoveAttribute(a.id)}
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                        <Table.Footer>
                            <Table.Row>
                                <FooterCell colSpan={2} $hasAttributes={!!dependentAttributes.length}>
                                    <DependenciesAttributeSelector
                                        library={library}
                                        onSelectAttribute={_handleAttributeSelected}
                                        selectedAttributes={dependentAttributes.map(a => a.id)}
                                    />
                                </FooterCell>
                            </Table.Row>
                        </Table.Footer>
                    </Table>
                </div>
            </PopContent>
        </Popup>
    );
}

export default DependenciesSettings;
