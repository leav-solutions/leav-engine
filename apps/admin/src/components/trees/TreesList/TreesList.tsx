// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Checkbox, Input, Table} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import Loading from '../../shared/Loading';
import DeleteTree from '../DeleteTree';

interface ITreesListProps {
    trees: GET_TREES_trees_list[] | null;
    loading?: boolean;
    onRowClick: (tree: GET_TREES_trees_list) => void;
    onFiltersUpdate?: (filters: any) => void;
    filters?: any;
}

const TreesList = ({trees, loading, filters, onFiltersUpdate, onRowClick}: ITreesListProps): JSX.Element => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
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
                        const treeLabel = localizedLabel(tree.label, availableLanguages);
                        const onClick = () => onRowClick(tree);
                        return (
                            <Table.Row key={tree.id} onClick={onClick}>
                                <Table.Cell>{treeLabel}</Table.Cell>
                                <Table.Cell>{tree.id}</Table.Cell>
                                <Table.Cell>
                                    <Checkbox readOnly checked={!!tree.system} />
                                </Table.Cell>
                                <Table.Cell>
                                    <DeleteTree tree={tree} filters={filters} />
                                </Table.Cell>
                            </Table.Row>
                        );
                    })
                )}
            </Table.Body>
        </Table>
    );
};

TreesList.defaultProps = {
    loading: false,
    trees: [],
    filters: {}
};

export default TreesList;
