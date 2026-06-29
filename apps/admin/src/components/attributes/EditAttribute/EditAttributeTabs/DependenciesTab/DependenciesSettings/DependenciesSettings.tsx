import {type GET_LIB_BY_ID_libraries_list} from '../../../../../../_gqlTypes/GET_LIB_BY_ID';
import useLang from '../../../../../../hooks/useLang';
import {type HTMLAttributes} from 'react';
import {useTranslation} from 'react-i18next';
import {Checkbox, Icon, Popup, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {localizedLabel} from '../../../../../../utils';
import SimplisticButton from '../../../../../shared/SimplisticButton';
import DependenciesAttributeSelector from './DependenciesAttributeSelector';
import {type GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_dependent_values} from '../../../../../../_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {
    type AttributeDetailsTreeAttributeFragment,
    type TreePermissionsDependentValuesConfInput,
} from '../../../../../../_gqlTypes';

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

interface IPermissionsSettingsProps extends HTMLAttributes<HTMLDivElement> {
    attribute: AttributeDetailsTreeAttributeFragment;
    dependenciesSettings: ITreePermissionsDependentValuesConf;
    onChangeSettings: (settings: TreePermissionsDependentValuesConfInput) => void;
}

function DependenciesSettings({
    dependenciesSettings,
    onChangeSettings,
    attribute,
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
            allowByDefault: dependenciesSettings?.allowByDefault ?? false,
        });
    };

    const _handleRemoveAttribute = (removedAttributeId: string) => () => {
        onChangeSettings({
            dependenciesTreeAttributes: dependentAttributes
                .map(a => a.id)
                .filter(attributeId => attributeId !== removedAttributeId),
            allowByDefault: dependenciesSettings?.allowByDefault ?? false,
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
                                        attribute={attribute}
                                        onSelectAttribute={_handleAttributeSelected}
                                        selectedAttributes={dependentAttributes.map(a => a.id)}
                                    />
                                </FooterCell>
                            </Table.Row>
                        </Table.Footer>
                    </Table>
                    {dependentAttributes.length > 0 && (
                        <Checkbox
                            name="enable"
                            toggle
                            label={t('attributes.dependencies.settings.allow_by_default')}
                            checked={dependenciesSettings?.allowByDefault}
                            onChange={() => {
                                onChangeSettings({
                                    dependenciesTreeAttributes: dependentAttributes.map(a => a.id),
                                    allowByDefault: !dependenciesSettings?.allowByDefault,
                                });
                            }}
                        />
                    )}
                </div>
            </PopContent>
        </Popup>
    );
}

export default DependenciesSettings;
