// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileAddOutlined} from '@ant-design/icons';
import {ICommonFieldsSettings, IFormLinkFieldSettings} from '@leav/types';
import {Button, Popover, Switch, Table} from 'antd';
import SearchModal from 'components/SearchModal';
import ErrorMessage from 'components/shared/ErrorMessage';
import {IRecordPropertyLink, RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {localizedLabel} from 'utils';
import {GET_FORM_forms_list_elements_elements_attribute_LinkAttribute} from '_gqlTypes/GET_FORM';
import {IRecordIdentityWhoAmI, ISharedStateSelectionSearch} from '_types/types';
import useDeleteValueMutation from '../../hooks/useDeleteValueMutation';
import useSaveValueBatchMutation from '../../hooks/useSaveValueBatchMutation';
import useSaveValueMutation from '../../hooks/useSaveValueMutation';
import NoValue from '../../shared/NoValue';
import {APICallStatus, IFormElementProps} from '../../_types';
import RecordIdentityCell from './RecordIdentityCell';

const TableWrapper = styled.div`
    position: relative;
    border: 1px solid ${themingVar['@border-color-base']};
    margin-bottom: 1.5em;
    border-radius: ${themingVar['@border-radius-base']};
`;

const FieldLabel = styled.div`
    position: absolute;
    left: 5px;
    top: -0.85em;
    font-size: 1.1em;
    background: ${themingVar['@default-bg']};
    padding: 0 0.5em;
    color: rgba(0, 0, 0, 0.5);
    z-index: 1;
`;

const FooterWrapper = styled.div`
    text-align: right;
`;

interface IRowData {
    key: string;
    whoAmI: IRecordIdentityWhoAmI;
    value: IRecordPropertyLink;
    [columnName: string]: unknown;
}

function LinkField({element, recordValues, record}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();

    const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);

    const attribute = element.attribute as GET_FORM_forms_list_elements_elements_attribute_LinkAttribute;

    useSaveValueMutation(record, attribute.id);
    const {saveValues} = useSaveValueBatchMutation(record, attribute.id);
    const {deleteValue} = useDeleteValueMutation(record, attribute.id);
    const [errorMessage, setErrorMessage] = useState<string | string[]>();

    const fieldValues = (recordValues[element.settings.attribute] as IRecordPropertyLink[]) ?? [];

    const _handleAddValue = () => {
        setIsSearchModalVisible(true);
    };

    const _handleDeleteValue = async (value: IRecordPropertyLink) => {
        const deleteRes = await deleteValue(value.id_value);

        if (deleteRes.status === APICallStatus.SUCCESS) {
            return;
        }
    };

    const _handleSearchModalSubmit = async ({selected}: ISharedStateSelectionSearch) => {
        if (!selected.length) {
            return;
        }

        const selectedRecordToSave = attribute.multiple_values ? selected : [selected[0]];
        const valuesToSave = selectedRecordToSave.map(selectedRecord => ({
            idValue: null,
            value: selectedRecord.id
        }));

        const res = await saveValues(valuesToSave);

        if (res.status === APICallStatus.ERROR) {
            setErrorMessage(res.error);
        }

        if (res?.errors?.length) {
            const selectedRecordsById = selected.reduce((acc, cur) => ({...acc, [cur.id]: cur}), {});

            const errorsMessage = res.errors.map(err => {
                const linkedRecordLabel = selectedRecordsById[err.input].label || selectedRecordsById[err.input].id;

                return `${linkedRecordLabel}: ${err.message}`;
            });
            setErrorMessage(errorsMessage);
        }
    };

    const cols = [
        {
            title: t('record_edition.whoAmI'),
            dataIndex: 'whoAmI',
            render: (whoAmI: IRecordIdentityWhoAmI, rowData: IRowData) => {
                const _handleDelete = () => _handleDeleteValue(rowData.value);
                return (
                    <RecordIdentityCell
                        record={whoAmI}
                        onDelete={_handleDelete}
                        value={rowData.value as RecordProperty}
                        attribute={attribute}
                    />
                );
            }
        },
        ...(Array.isArray((element.settings as IFormLinkFieldSettings).columns)
            ? (element.settings as IFormLinkFieldSettings).columns.map(c => ({
                  title: localizedLabel(c.label, lang),
                  dataIndex: c.id
              }))
            : [])
    ];

    const data: IRowData[] = fieldValues.map(val => ({
        key: val.id_value,
        value: val,
        whoAmI: val.linkValue.whoAmI,
        ...(Array.isArray((element.settings as IFormLinkFieldSettings).columns)
            ? (element.settings as IFormLinkFieldSettings).columns.reduce((allCols, col) => {
                  const columnValue = val.linkValue[col.id];
                  return {
                      ...allCols,
                      [col.id]:
                          typeof columnValue === 'boolean' ? <Switch checked={columnValue} disabled /> : columnValue
                  };
              }, {})
            : {})
    }));

    const isReadOnly = element.attribute?.system;
    const canAddValue = !isReadOnly && (attribute.multiple_values || !fieldValues.length);

    const tableFooter = () => {
        return fieldValues.length && canAddValue ? (
            <FooterWrapper>
                <Button icon={<FileAddOutlined />} onClick={_handleAddValue}>
                    {t('record_edition.add_value')}
                </Button>
            </FooterWrapper>
        ) : null;
    };

    const _handleCloseError = () => {
        setErrorMessage('');
    };

    return (
        <>
            <TableWrapper>
                <FieldLabel>{element.settings.label}</FieldLabel>
                <Table
                    columns={cols}
                    dataSource={data}
                    size="small"
                    pagination={false}
                    locale={{
                        emptyText: <NoValue canAddValue={canAddValue} onAddValue={_handleAddValue} />
                    }}
                    data-testid="linked-field-values"
                    footer={tableFooter}
                    scroll={{y: 280}}
                />
            </TableWrapper>
            {errorMessage && (
                <Popover
                    placement="bottomLeft"
                    visible={!!errorMessage}
                    content={<ErrorMessage error={errorMessage} onClose={_handleCloseError} />}
                ></Popover>
            )}
            {canAddValue && (
                <SearchModal
                    libId={attribute.linked_library.id}
                    visible={isSearchModalVisible}
                    setVisible={setIsSearchModalVisible}
                    submitAction={_handleSearchModalSubmit}
                />
            )}
        </>
    );
}

export default LinkField;
