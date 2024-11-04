// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Checkbox, Grid, Icon, Input, Table} from 'semantic-ui-react';
import useLang from '../../../../../../hooks/useLang';
import useUserData from '../../../../../../hooks/useUserData';
import {localizedLabel} from '../../../../../../utils';
import {GET_FORMS_LIST_forms_list} from '../../../../../../_gqlTypes/GET_FORMS_LIST';
import {IFormFilterOptions} from '../../../../../../_types/forms';
import ConfirmedButton from '../../../../../shared/ConfirmedButton';
import DeleteButton from '../../../../../shared/DeleteButton';
import Loading from '../../../../../shared/Loading';

interface IFormsListProps {
    loading: boolean;
    libraryId: string;
    forms: GET_FORMS_LIST_forms_list[];
    filters?: IFormFilterOptions;
    onFiltersChange: (filters: IFormFilterOptions) => void;
    onRowClick: (formId: string) => void;
    onDelete: (formId: string) => void;
    onCreate: () => void;
}

function FormsList({
    loading,
    forms,
    filters = {},
    onFiltersChange,
    onCreate,
    onRowClick,
    onDelete
}: IFormsListProps): JSX.Element {
    const {lang: availableLanguages} = useLang();
    const {t} = useTranslation();
    const {permissions} = useUserData();

    const _handleFilterChange = (e: React.SyntheticEvent, d: any) => {
        // If a checkbox was not checked and is clicked, go back to indeterminate state
        if (d.type === 'checkbox' && filters.system === false && d.checked) {
            d.indeterminate = true;
            d.checked = false;
        }

        if (onFiltersChange) {
            onFiltersChange(d);
        }
    };

    const _handleRowClick = (formId: string) => () => onRowClick(formId);
    const _handleDelete = (formId: string) => () => onDelete(formId);

    return (
        <>
            <Grid>
                <Grid.Column floated="right" width={4} textAlign="right" verticalAlign="middle">
                    <Button icon labelPosition="left" size="medium" onClick={onCreate} data-test-id="create-form-btn">
                        <Icon name="plus" />
                        {t('forms.new')}
                    </Button>
                </Grid.Column>
            </Grid>
            <Table selectable striped>
                <Table.Header>
                    <Table.Row key="titles">
                        <Table.HeaderCell width={7}>{t('admin.label')}</Table.HeaderCell>
                        <Table.HeaderCell width={7}>{t('admin.id')}</Table.HeaderCell>
                        <Table.HeaderCell width={1}>{t('admin.isSystem')}</Table.HeaderCell>
                        <Table.HeaderCell width={1} />
                    </Table.Row>
                    <Table.Row className="filters" key="filters">
                        <Table.HeaderCell key="label">
                            <Input
                                key="label"
                                size="small"
                                fluid
                                placeholder={t('admin.label') + '...'}
                                name="label"
                                value={filters.label || ''}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell key="id">
                            <Input
                                key="id"
                                size="small"
                                fluid
                                placeholder={t('admin.id') + '...'}
                                name="id"
                                value={filters.id || ''}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell key="system">
                            <Checkbox
                                key="system"
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
                        forms.map(f => {
                            const formLabel = localizedLabel(f.label, availableLanguages);
                            return (
                                <Table.Row key={f.id} data-test-id="form-list-row" onClick={_handleRowClick(f.id)}>
                                    <Table.Cell>{formLabel}</Table.Cell>
                                    <Table.Cell>{f.id}</Table.Cell>
                                    <Table.Cell width={1}>
                                        <Checkbox readOnly checked={f.system} />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <ConfirmedButton
                                            action={_handleDelete(f.id)}
                                            confirmMessage={t('forms.confirm_delete', {formLabel})}
                                        >
                                            <DeleteButton disabled={f.system} />
                                        </ConfirmedButton>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })
                    )}
                </Table.Body>
            </Table>
        </>
    );
}

export default FormsList;
