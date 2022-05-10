// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import Loading from 'components/shared/Loading';
import useLang from 'hooks/useLang';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Input, Table} from 'semantic-ui-react';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';

interface IApplicationsListProps {
    applications: GET_APPLICATIONS_applications_list[] | null;
    onRowClick: (application: GET_APPLICATIONS_applications_list) => void;
    onFiltersUpdate?: (filters: any) => void;
    loading: boolean;
    withFilters?: boolean;
    filters?: any;
    actions?: JSX.Element;
}

const ApplicationsList = ({
    applications = [],
    loading = false,
    withFilters = true,
    filters = {},
    onRowClick,
    actions,
    onFiltersUpdate
}: IApplicationsListProps): JSX.Element => {
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

    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const actionsList: React.ReactNode[] = actions ? (!Array.isArray(actions) ? [actions] : actions) : [];

    return (
        <Table selectable striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell width={4}>{t('admin.label')}</Table.HeaderCell>
                    <Table.HeaderCell width={4}>{t('admin.id')}</Table.HeaderCell>
                    <Table.HeaderCell width={1}>{t('applications.endpoint')}</Table.HeaderCell>
                    <Table.HeaderCell width={1} />
                </Table.Row>
                {withFilters && (
                    <Table.Row className="filters">
                        <Table.HeaderCell>
                            <Input
                                size="small"
                                fluid
                                placeholder={t('admin.label') + '...'}
                                name="label"
                                aria-label="label"
                                value={filters.label || ''}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Input
                                size="small"
                                fluid
                                placeholder={t('admin.id') + '...'}
                                name="id"
                                aria-label="id"
                                value={filters.id || ''}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Input
                                size="small"
                                fluid
                                placeholder={t('applications.endpoint') + '...'}
                                name="endpoint"
                                aria-label="endpoint"
                                value={filters.endpoint || ''}
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
                    !!applications &&
                    applications.map(app => {
                        const onClick = () => onRowClick(app);
                        const appLabel = localizedTranslation(app.label, availableLanguages);
                        return (
                            <Table.Row key={app.id} onClick={onClick}>
                                <Table.Cell>{appLabel}</Table.Cell>
                                <Table.Cell>{app.id}</Table.Cell>
                                <Table.Cell>{app.endpoint}</Table.Cell>
                                <Table.Cell textAlign="right" width={1} className="actions">
                                    {actionsList.map(child =>
                                        React.cloneElement(child as React.ReactElement<any>, {application: app})
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

export default ApplicationsList;
