import React from 'react';
import {useTranslation} from 'react-i18next';
import {Icon, Table} from 'semantic-ui-react';
import {GET_ALL_PLUGINS_plugins} from '../../../_gqlTypes/GET_ALL_PLUGINS';
import Loading from '../../shared/Loading';

interface IPluginsListProps {
    plugins: GET_ALL_PLUGINS_plugins[] | null;
    loading?: boolean;
}

const PluginsList = ({plugins, loading}: IPluginsListProps): JSX.Element => {
    const {t} = useTranslation();

    return (
        <>
            <Table selectable striped>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={1} />
                        <Table.HeaderCell width={4}>{t('plugins.label')}</Table.HeaderCell>
                        <Table.HeaderCell width={4}>{t('plugins.description')}</Table.HeaderCell>
                        <Table.HeaderCell width={4}>{t('plugins.version')}</Table.HeaderCell>
                        <Table.HeaderCell width={4}>{t('plugins.author')}</Table.HeaderCell>
                        <Table.HeaderCell width={1} />
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
                        plugins &&
                        plugins.map(p => {
                            return (
                                <Table.Row key={p.name}>
                                    <Table.Cell>
                                        <Icon name="book" size="large" />
                                    </Table.Cell>
                                    <Table.Cell>{p.name}</Table.Cell>
                                    <Table.Cell>{p.description}</Table.Cell>
                                    <Table.Cell>{p.version}</Table.Cell>
                                    <Table.Cell>{p.author}</Table.Cell>
                                    <Table.Cell />
                                </Table.Row>
                            );
                        })
                    )}
                </Table.Body>
            </Table>
        </>
    );
};

PluginsList.defaultProps = {
    loading: false,
    plugins: []
};

export default PluginsList;
