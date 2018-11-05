import {i18n, TranslationFunction} from 'i18next';
import * as React from 'react';
import {translate} from 'react-i18next';
import {Checkbox, Icon, Table} from 'semantic-ui-react';
import DeleteLibrary from 'src/containers/DeleteLibrary';
import {localizedLabel} from 'src/utils/utils';
import {GET_LIBRARIES_libraries} from '../../_gqlTypes/GET_LIBRARIES';

interface ILibrariesListProps {
    libraries: GET_LIBRARIES_libraries[] | null;
    t: TranslationFunction;
    i18n: i18n;
    onRowClick: (library: GET_LIBRARIES_libraries) => void;
}

function LibrariesList({libraries, onRowClick, t, i18n: i18next}: ILibrariesListProps): JSX.Element {
    return (
        <React.Fragment>
            <Table selectable striped>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={1} />
                        <Table.HeaderCell width={7}>{t('libraries.label')}</Table.HeaderCell>
                        <Table.HeaderCell width={6}>{t('libraries.ID')}</Table.HeaderCell>
                        <Table.HeaderCell width={1}>{t('libraries.isSystem')}</Table.HeaderCell>
                        <Table.HeaderCell width={1} />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {libraries &&
                        libraries.map(l => {
                            const libLabel = localizedLabel(l.label, i18next);
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
                                        <DeleteLibrary library={l} />
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })}
                </Table.Body>
            </Table>
        </React.Fragment>
    );
}

export default translate()(LibrariesList);
