// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Checkbox, Dropdown, Input, Table} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import {GET_ATTRIBUTES_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from '../../../_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';

interface IAttributesListProps {
    attributes: GET_ATTRIBUTES_attributes_list[] | null;
    onRowClick: (attribute: GET_ATTRIBUTES_attributes_list) => void;
    onFiltersUpdate?: (filters: any) => void;
    loading: boolean;
    withFilters?: boolean;
    filters?: any;
    actions?: JSX.Element;
}

const AttributesList = ({
    attributes = [],
    loading = false,
    withFilters = true,
    filters = {},
    onRowClick,
    actions,
    onFiltersUpdate
}: IAttributesListProps): JSX.Element => {
    const _handleFilterChange = (e: React.SyntheticEvent, d: any) => {
        // If a checkbox was not checked and is clicked, go back to indeterminate state
        if (d.type === 'checkbox' && filters[d.name] === false && d.checked) {
            d.indeterminate = true;
            d.checked = false;
        }

        if (onFiltersUpdate) {
            onFiltersUpdate(d);
        }
    };

    // const {onRowClick, children} = props;
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const actionsList: React.ReactNode[] = actions ? (!Array.isArray(actions) ? [actions] : actions) : [];
    const types = Object.keys(AttributeType).map(type => ({
        key: type,
        value: type,
        text: t('attributes.types.' + type)
    }));

    const formats = Object.keys(AttributeFormat).map(format => ({
        key: format,
        value: format,
        text: t('attributes.formats.' + format)
    }));

    return (
        <Table selectable striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell width={4}>{t('attributes.label')}</Table.HeaderCell>
                    <Table.HeaderCell width={4}>{t('attributes.ID')}</Table.HeaderCell>
                    <Table.HeaderCell width={3}>{t('attributes.type')}</Table.HeaderCell>
                    <Table.HeaderCell width={3}>{t('attributes.format')}</Table.HeaderCell>
                    <Table.HeaderCell width={1}>{t('attributes.multiple_values')}</Table.HeaderCell>
                    <Table.HeaderCell width={1}>{t('attributes.isSystem')}</Table.HeaderCell>
                    <Table.HeaderCell width={1} />
                </Table.Row>
                {withFilters && (
                    <Table.Row className="filters">
                        <Table.HeaderCell>
                            <Input
                                size="small"
                                fluid
                                placeholder={t('attributes.label') + '...'}
                                name="label"
                                value={filters.label || ''}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Input
                                size="small"
                                fluid
                                placeholder={t('attributes.ID') + '...'}
                                name="id"
                                value={filters.id || ''}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Dropdown
                                fluid
                                multiple
                                search
                                selection
                                options={types}
                                placeholder={t('attributes.type') + '...'}
                                name="type"
                                value={filters.type || []}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Dropdown
                                fluid
                                multiple
                                search
                                selection
                                options={formats}
                                placeholder={t('attributes.format') + '...'}
                                name="format"
                                value={filters.format || []}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Checkbox
                                indeterminate={typeof filters.multiple_values === 'undefined'}
                                name="multiple_values"
                                checked={filters.multiple_values}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Checkbox
                                indeterminate={typeof filters.system === 'undefined'}
                                name="system"
                                checked={filters.system}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell />
                    </Table.Row>
                )}
            </Table.Header>
            <Table.Body>
                {loading ? (
                    <Table.Row>
                        <Table.Cell colSpan={6}>
                            <Loading />
                        </Table.Cell>
                    </Table.Row>
                ) : (
                    !!attributes &&
                    attributes.map(a => {
                        const onClick = () => onRowClick(a);
                        const attrLabel = localizedLabel(a.label, availableLanguages);
                        return (
                            <Table.Row key={a.id} onClick={onClick}>
                                <Table.Cell>{attrLabel}</Table.Cell>
                                <Table.Cell>{a.id}</Table.Cell>
                                <Table.Cell>{t('attributes.types.' + a.type)}</Table.Cell>
                                <Table.Cell>{a.format ? t('attributes.formats.' + a.format) : ''}</Table.Cell>
                                <Table.Cell width={1}>
                                    <Checkbox readOnly checked={a.multiple_values} />
                                </Table.Cell>
                                <Table.Cell width={1}>
                                    <Checkbox readOnly checked={a.system} />
                                </Table.Cell>
                                <Table.Cell textAlign="right" width={1} className="actions">
                                    {actionsList.map(child =>
                                        React.cloneElement(child as React.ReactElement<any>, {attribute: a})
                                    )}
                                </Table.Cell>
                            </Table.Row>
                        );
                    })
                )}
            </Table.Body>
        </Table>
    );
};

export default AttributesList;
