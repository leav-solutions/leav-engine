import * as React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {Checkbox, Input, Table} from 'semantic-ui-react';
import Loading from 'src/components/shared/Loading';
import {localizedLabel} from 'src/utils/utils';
import {GET_TREES_trees} from 'src/_gqlTypes/GET_TREES';
import DeleteTree from '../DeleteTree';

interface ITreesListProps extends WithNamespaces {
    trees: GET_TREES_trees[] | null;
    loading?: boolean;
    onRowClick: (tree: GET_TREES_trees) => void;
    onFiltersUpdate?: (filters: any) => void;
    filters?: any;
}

function TreesList({
    trees,
    t,
    i18n: i18next,
    loading,
    filters,
    onFiltersUpdate,
    onRowClick
}: ITreesListProps): JSX.Element {
    const _handleFilterChange = (e: React.SyntheticEvent, d: any) => {
        // If a checkbox was not checked and is clicked, go back to indeterminate state
        if (d.type === 'checkbox' && filters.system === false && d.checked) {
            d.indeterminate = true;
            d.checked = false;
        }

        if (onFiltersUpdate) {
            onFiltersUpdate(d);
        }
    };

    return (
        <Table selectable striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell width={8}>{t('trees.label')}</Table.HeaderCell>
                    <Table.HeaderCell width={6}>{t('trees.ID')}</Table.HeaderCell>
                    <Table.HeaderCell width={1}>{t('trees.isSystem')}</Table.HeaderCell>
                    <Table.HeaderCell width={1} />
                </Table.Row>
                <Table.Row className="filters">
                    <Table.HeaderCell>
                        <Input
                            size="small"
                            fluid
                            placeholder={t('trees.label') + '...'}
                            name="label"
                            value={filters.label || ''}
                            onChange={_handleFilterChange}
                        />
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                        <Input
                            size="small"
                            fluid
                            placeholder={t('trees.ID') + '...'}
                            name="id"
                            value={filters.id || ''}
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
            </Table.Header>
            <Table.Body>
                {loading ? (
                    <Table.Row>
                        <Table.Cell colSpan={6}>
                            <Loading />
                        </Table.Cell>
                    </Table.Row>
                ) : (
                    trees &&
                    trees.map(tree => {
                        const treeLabel = localizedLabel(tree.label, i18next);
                        const onClick = () => onRowClick(tree);
                        return (
                            <Table.Row key={tree.id} onClick={onClick}>
                                <Table.Cell>{treeLabel}</Table.Cell>
                                <Table.Cell>{tree.id}</Table.Cell>
                                <Table.Cell>
                                    <Checkbox readOnly checked={!!tree.system} />
                                </Table.Cell>
                                <Table.Cell>
                                    <DeleteTree tree={tree} />
                                </Table.Cell>
                            </Table.Row>
                        );
                    })
                )}
            </Table.Body>
        </Table>
    );
}

TreesList.defaultProps = {
    loading: false,
    trees: [],
    filters: {}
};

export default withNamespaces()(TreesList);
