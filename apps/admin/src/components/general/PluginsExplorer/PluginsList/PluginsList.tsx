// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Table} from 'semantic-ui-react';
import {GET_ALL_PLUGINS_plugins} from '../../../../_gqlTypes/GET_ALL_PLUGINS';
import Loading from '../../../shared/Loading';

interface IPluginsListProps {
    plugins: GET_ALL_PLUGINS_plugins[] | null;
    loading?: boolean;
}

const PluginsList = ({plugins, loading}: IPluginsListProps): JSX.Element => {
    const {t} = useTranslation();

    return (
        <>
            <Table striped basic="very" size="small" compact>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={4}>{t('plugins.label')}</Table.HeaderCell>
                        <Table.HeaderCell width={6}>{t('plugins.description')}</Table.HeaderCell>
                        <Table.HeaderCell width={2}>{t('plugins.version')}</Table.HeaderCell>
                        <Table.HeaderCell width={5}>{t('plugins.author')}</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {loading && (
                        <Table.Row>
                            <Table.Cell colSpan={6}>
                                <Loading />
                            </Table.Cell>
                        </Table.Row>
                    )}
                    {plugins.length ? (
                        plugins.map(p => {
                            return (
                                <Table.Row key={p.name}>
                                    <Table.Cell>{p.name}</Table.Cell>
                                    <Table.Cell>{p.description}</Table.Cell>
                                    <Table.Cell>{p.version}</Table.Cell>
                                    <Table.Cell>{p.author}</Table.Cell>
                                </Table.Row>
                            );
                        })
                    ) : (
                        <Table.Row textAlign="center" disabled>
                            <Table.Cell colSpan={6}>{t('plugins.no_plugins')}</Table.Cell>
                        </Table.Row>
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
