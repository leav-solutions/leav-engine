import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Checkbox, Dropdown, Input, Table} from 'semantic-ui-react';
import Loading from 'src/components/shared/Loading';
import {localizedLabel} from 'src/utils/utils';
import {AttributeDetails} from 'src/_gqlTypes/AttributeDetails';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';

interface IAttributesListProps extends WithNamespaces {
    attributes: AttributeDetails[] | null;
    onRowClick: (attribute: GET_ATTRIBUTES_attributes) => void;
    onFiltersUpdate?: (filters: any) => void;
    loading: boolean;
    withFilters?: boolean;
    filters?: any;
}

class AttributesList extends React.Component<IAttributesListProps> {
    public static defaultProps = {
        attributes: [],
        loading: false,
        withFilters: true,
        filters: {}
    };

    constructor(props: IAttributesListProps) {
        super(props);
    }

    public render = () => {
        const {attributes, t, onRowClick, children, loading, filters, withFilters, i18n: i18next} = this.props;
        const childrenList: React.ReactNode[] = children ? (!Array.isArray(children) ? [children] : children) : [];
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
                                    onChange={this._handleFilterChange}
                                />
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                <Input
                                    size="small"
                                    fluid
                                    placeholder={t('attributes.ID') + '...'}
                                    name="id"
                                    value={filters.id || ''}
                                    onChange={this._handleFilterChange}
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
                                    onChange={this._handleFilterChange}
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
                                    onChange={this._handleFilterChange}
                                />
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                <Checkbox
                                    indeterminate={typeof filters.system === 'undefined'}
                                    name="system"
                                    checked={filters.system}
                                    onChange={this._handleFilterChange}
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
                            const attrLabel = localizedLabel(a.label, i18next);
                            const onClick = () => onRowClick(a);
                            return (
                                <Table.Row key={a.id} onClick={onClick}>
                                    <Table.Cell>{attrLabel}</Table.Cell>
                                    <Table.Cell>{a.id}</Table.Cell>
                                    <Table.Cell>{t('attributes.types.' + a.type)}</Table.Cell>
                                    <Table.Cell>{a.format ? t('attributes.formats.' + a.format) : ''}</Table.Cell>
                                    <Table.Cell width={1}>
                                        <Checkbox readOnly checked={a.system} />
                                    </Table.Cell>
                                    <Table.Cell textAlign="right" width={1} className="actions">
                                        {childrenList.map(child =>
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
    }

    private _handleFilterChange = (e: React.SyntheticEvent, d: any) => {
        // If a checkbox was not checked and is clicked, go back to indeterminate state
        if (d.type === 'checkbox' && this.props.filters.system === false && d.checked) {
            d.indeterminate = true;
            d.checked = false;
        }

        if (this.props.onFiltersUpdate) {
            this.props.onFiltersUpdate(d);
        }
    }
}

export default withNamespaces()(AttributesList);
