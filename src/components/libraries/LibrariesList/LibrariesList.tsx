import React from 'react';
import {useTranslation} from 'react-i18next';
import {Checkbox, Icon, Input, Table} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import Loading from '../../shared/Loading';
import DeleteLibrary from '../DeleteLibrary';

interface ILibrariesListProps {
    libraries: GET_LIBRARIES_libraries_list[] | null;
    onRowClick: (library: GET_LIBRARIES_libraries_list) => void;
    onFiltersUpdate?: (filters: any) => void;
    loading?: boolean;
    filters?: any;
}

/* tslint:disable-next-line:variable-name */
const LibrariesList = ({
    libraries,
    onRowClick,
    onFiltersUpdate,
    loading,
    filters
}: ILibrariesListProps): JSX.Element => {
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
        <>
            <Table selectable striped>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={1} />
                        <Table.HeaderCell width={7}>{t('libraries.label')}</Table.HeaderCell>
                        <Table.HeaderCell width={6}>{t('libraries.ID')}</Table.HeaderCell>
                        <Table.HeaderCell width={1}>{t('libraries.isSystem')}</Table.HeaderCell>
                        <Table.HeaderCell width={1} />
                    </Table.Row>
                    <Table.Row className="filters">
                        <Table.HeaderCell />
                        <Table.HeaderCell>
                            <Input
                                size="small"
                                fluid
                                placeholder={t('libraries.label') + '...'}
                                name="label"
                                value={filters.label || ''}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Input
                                size="small"
                                fluid
                                placeholder={t('libraries.ID') + '...'}
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
                        libraries &&
                        libraries.map(l => {
                            const libLabel = localizedLabel(l.label, availableLanguages);
                            const onClick = () => onRowClick(l);
                            return (
                                <Table.Row key={l.id} onClick={onClick}>
                                    <Table.Cell>
                                        <Icon name="book" size="large" />
                                    </Table.Cell>
                                    <Table.Cell>{libLabel}</Table.Cell>
                                    <Table.Cell>{l.id}</Table.Cell>
                                    <Table.Cell>
                                        <Checkbox readOnly checked={!!l.system} />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <DeleteLibrary library={l} filters={filters} />
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })
                    )}
                </Table.Body>
            </Table>
        </>
    );
};

LibrariesList.defaultProps = {
    loading: false,
    libraries: [],
    filters: {}
};

export default LibrariesList;
