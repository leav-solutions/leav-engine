// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileAddOutlined} from '@ant-design/icons';
import {ICommonFieldsSettings, IFormLinkFieldSettings} from '@leav/utils';
import {Button, Popover, Switch, Table} from 'antd';
import ErrorMessage from 'components/shared/ErrorMessage';
import {IRecordPropertyLink, RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {localizedTranslation} from 'utils';
import {GET_FORM_forms_list_elements_elements_attribute_LinkAttribute} from '_gqlTypes/GET_FORM';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import {SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue} from '_gqlTypes/SAVE_VALUE_BATCH';
import {IRecordIdentityWhoAmI} from '_types/types';
import NoValue from '../../shared/NoValue';
import {APICallStatus, IFormElementProps} from '../../_types';
import RecordIdentityCell from './RecordIdentityCell';
import ValuesAdd from './ValuesAdd';

const TableWrapper = styled.div`
    position: relative;
    border: 1px solid ${themingVar['@border-color-base']};
    margin-bottom: 1.5em;
    border-radius: ${themingVar['@border-radius-base']};
`;

const FieldLabel = styled.div`
    top: calc(50% - 0.9em);
    font-size: 0.9em;
    background: ${themingVar['@background-color-light']};
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

function LinkField({
    record,
    element,
    recordValues,
    onValueSubmit,
    onValueDelete
}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();

    const attribute = element.attribute as GET_FORM_forms_list_elements_elements_attribute_LinkAttribute;

    const [errorMessage, setErrorMessage] = useState<string | string[]>();
    const [isValuesAddVisible, setIsValuesAddVisible] = useState<boolean>();
    const [fieldValues, setFieldValues] = useState<IRecordPropertyLink[]>(
        (recordValues[element.settings.attribute] as IRecordPropertyLink[]) ?? []
    );

    useEffect(() => {
        if (record) {
            // Update values only for existing record. On creation, we handle everything here
            setFieldValues((recordValues[element.settings.attribute] as IRecordPropertyLink[]) ?? []);
        }
    }, [recordValues, element.settings.attribute, record]);

    const _handleAddValue = () => {
        setIsValuesAddVisible(true);
    };

    const _handleCloseValuesAdd = () => setIsValuesAddVisible(false);

    const _handleDeleteValue = async (value: IRecordPropertyLink) => {
        const deleteRes = await onValueDelete(value.id_value, attribute.id);

        if (deleteRes.status === APICallStatus.SUCCESS) {
            setFieldValues(fieldValues.filter(val => val.id_value !== value.id_value));
            return;
        }
    };

    const _handleAddValueSubmit = async (values: RecordIdentity[]) => {
        const valuesToSave = values.map(value => ({
            attribute,
            idValue: null,
            value
        }));

        const res = await onValueSubmit(valuesToSave);

        if (res.status === APICallStatus.ERROR) {
            setErrorMessage(res.error);
        } else if (res.values) {
            setFieldValues([...fieldValues, ...(res.values as SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue[])]);
        }

        if (res?.errors?.length) {
            const selectedRecordsById = values.reduce((acc, cur) => ({...acc, [cur.id]: cur}), {});

            const errorsMessage = res.errors.map(err => {
                const linkedRecordLabel = selectedRecordsById[err.input].label || selectedRecordsById[err.input].id;

                return `${linkedRecordLabel}: ${err.message}`;
            });
            setErrorMessage(errorsMessage);
        } else {
            setIsValuesAddVisible(false);
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
                  title: localizedTranslation(c.label, lang),
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
                {isValuesAddVisible && canAddValue && (
                    <ValuesAdd onAdd={_handleAddValueSubmit} attribute={attribute} onClose={_handleCloseValuesAdd} />
                )}
            </TableWrapper>
            {errorMessage && (
                <Popover
                    placement="bottomLeft"
                    visible={!!errorMessage}
                    content={<ErrorMessage error={errorMessage} onClose={_handleCloseError} />}
                ></Popover>
            )}
        </>
    );
}

export default LinkField;
