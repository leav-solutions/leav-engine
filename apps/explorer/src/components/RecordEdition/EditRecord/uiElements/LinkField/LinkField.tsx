// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive, ICommonFieldsSettings, IFormLinkFieldSettings} from '@leav/utils';
import {Popover, Skeleton, Switch, Table} from 'antd';
import {ColumnsType} from 'antd/lib/table';
import Paragraph from 'antd/lib/typography/Paragraph';
import Dimmer from 'components/shared/Dimmer';
import ErrorMessage from 'components/shared/ErrorMessage';
import RecordCard from 'components/shared/RecordCard';
import {
    IRecordColumnValueLink,
    IRecordColumnValueStandard,
    IRecordColumnValueTree,
    RecordColumnValue
} from 'graphQL/queries/records/getRecordColumnsValues';
import {IRecordPropertyLink, RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import {useGetRecordColumnsValuesQuery} from 'hooks/useGetRecordColumnsValuesQuery/useGetRecordColumnsValuesQuery';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {localizedTranslation} from 'utils';
import {RecordIdentity, RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {
    RECORD_FORM_recordForm_elements_attribute_LinkAttribute,
    RECORD_FORM_recordForm_elements_values_LinkValue
} from '_gqlTypes/RECORD_FORM';
import {SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue} from '_gqlTypes/SAVE_VALUE_BATCH';
import {IRecordIdentityWhoAmI, PreviewSize} from '_types/types';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';
import AddValueBtn from '../../shared/AddValueBtn';
import NoValue from '../../shared/NoValue';
import {APICallStatus, IFormElementProps} from '../../_types';
import FloatingMenuHandler from './FloatingMenuHandler';
import ValuesAdd from './ValuesAdd';

const TableWrapper = styled.div<{isValuesAddVisible: boolean}>`
    position: relative;
    z-index: ${p => (p.isValuesAddVisible ? 1 : 'auto')};
    border: 1px solid ${themingVar['@border-color-base']};
    margin-bottom: 1.5em;
    border-radius: ${themingVar['@border-radius-base']};

    tr:not(:hover) .floating-menu {
        display: none;
    }

    td {
        height: 2.5rem; // In case we have no value on the whole row
    }

    // Disable some unwanted antd styles
    && table > thead > tr:first-child {
        th:first-child,
        th:last-child {
            border-radius: 0;
        }
    }

    &&& .ant-table-footer {
        padding: 0;
    }
`;

const FieldLabel = styled(Paragraph)`
    && {
        top: calc(50% - 0.9em);
        font-size: 0.9em;
        background: ${themingVar['@background-color-light']};
        padding: 0 0.5em;
        color: ${themingVar['@leav-secondary-font-color']};
        z-index: 1;
        margin-bottom: 0;
    }
`;

const FooterWrapper = styled.div`
    text-align: left;
`;

const _isStandardValue = (value: RecordColumnValue): value is IRecordColumnValueStandard =>
    (value as IRecordColumnValueStandard).value !== undefined;

const _isLinkValue = (value: RecordColumnValue): value is IRecordColumnValueLink =>
    (value as IRecordColumnValueLink).linkValue !== undefined;

const _isTreeValue = (value: RecordColumnValue): value is IRecordColumnValueTree =>
    (value as IRecordColumnValueTree).treeValue !== undefined;

export interface IRowData {
    key: string;
    whoAmI: IRecordIdentityWhoAmI;
    value: IRecordPropertyLink;
    [columnName: string]: unknown;
}

function LinkField({
    record,
    element,
    onValueSubmit,
    onValueDelete
}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const {readOnly: isRecordReadOnly} = useRecordEditionContext();
    const recordValues = (element.values as RECORD_FORM_recordForm_elements_values_LinkValue[]) ?? [];

    const attribute = element.attribute as RECORD_FORM_recordForm_elements_attribute_LinkAttribute;
    const settings = element.settings as IFormLinkFieldSettings;
    const linkedRecordsColumns = settings?.columns ?? [];

    const [errorMessage, setErrorMessage] = useState<string | string[]>();
    const [isValuesAddVisible, setIsValuesAddVisible] = useState<boolean>();
    const [fieldValues, setFieldValues] = useState<RECORD_FORM_recordForm_elements_values_LinkValue[]>(recordValues);
    const {loading: recordColumnsLoading, data: recordColumnsData, refetch} = useGetRecordColumnsValuesQuery(
        record?.library.gqlNames.query,
        linkedRecordsColumns.map(c => c.id),
        recordValues.map(r => r.linkValue.id)
    );

    const _getLinkedRecordColumnsValues = (recordId: string) =>
        linkedRecordsColumns.reduce((allCols: {[col: string]: string}, col) => {
            allCols[col.id] = (recordColumnsData?.[recordId]?.[col.id] ?? [])
                .map(v => {
                    if (_isStandardValue(v)) {
                        return v.value;
                    }

                    if (_isLinkValue(v)) {
                        return v.linkValue.whoAmI.label ?? v.linkValue.id;
                    }

                    if (_isTreeValue(v)) {
                        return v.treeValue.record.whoAmI.label ?? v.treeValue.record.id;
                    }

                    return '';
                })
                .join(', ');
            return allCols;
        }, {});

    const _handleAddValue = () => {
        setIsValuesAddVisible(true);
    };

    const _handleCloseValuesAdd = () => setIsValuesAddVisible(false);

    const _handleDeleteValue = async (value: IRecordPropertyLink) => {
        const deleteRes = await onValueDelete({value: value.linkValue.id}, attribute.id);

        if (deleteRes.status === APICallStatus.SUCCESS) {
            setFieldValues(
                fieldValues.filter(val => val.id_value !== value.id_value || val.linkValue.id !== value.linkValue.id)
            );
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

            if (record) {
                // Fetch columns values for new records
                refetch(valuesToSave.map(v => v.value.id));
            }
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

    const isReadOnly = element.attribute?.system || isRecordReadOnly || !attribute.permissions.edit_value;

    // If no column is selected, force whoAmI column
    let colsToDisplay = [];
    if (settings.displayRecordIdentity || !settings?.columns?.length) {
        colsToDisplay.push({
            title: t('record_edition.whoAmI'),
            key: 'whoAmI'
        });
    }

    // Additional columns
    colsToDisplay = [
        ...colsToDisplay,
        ...linkedRecordsColumns.map(c => ({
            title: localizedTranslation(c.label, lang),
            key: c.id
        }))
    ];

    // Convert selected columns to format required by Table component
    const cols: ColumnsType<IRowData> = colsToDisplay.map((col, index) => ({
        title: col.title,
        dataIndex: col.key,
        render: (colData: IRecordIdentityWhoAmI | AnyPrimitive, rowData: IRowData) => {
            const _handleDelete = () => _handleDeleteValue(rowData.value);

            const valueRender =
                col.key === 'whoAmI' ? (
                    <RecordCard record={colData as RecordIdentity_whoAmI} size={PreviewSize.small} />
                ) : recordColumnsLoading ? (
                    <Skeleton title paragraph={false} active />
                ) : (
                    <span>
                        {typeof colData === 'boolean' ? <Switch checked={colData} disabled /> : String(colData ?? '')}
                    </span>
                );

            // Add floating menu (edit, delete...) on the last column to display it at the end of the row
            return index === colsToDisplay.length - 1 ? (
                <FloatingMenuHandler
                    record={rowData.whoAmI}
                    onDelete={_handleDelete}
                    value={rowData.value as RecordProperty}
                    attribute={attribute}
                    isReadOnly={isReadOnly}
                >
                    {valueRender}
                </FloatingMenuHandler>
            ) : (
                valueRender
            );
        }
    }));

    const data: IRowData[] = fieldValues.map(val => ({
        key: val.id_value + val.linkValue.id,
        value: val,
        whoAmI: val.linkValue.whoAmI,
        ..._getLinkedRecordColumnsValues(val.linkValue.id)
    }));

    const canAddValue = !isReadOnly && (attribute.multiple_values || !fieldValues.length);

    const tableFooter = () => {
        return fieldValues.length && canAddValue ? (
            <FooterWrapper>
                <AddValueBtn onClick={_handleAddValue} disabled={isValuesAddVisible} />
            </FooterWrapper>
        ) : null;
    };

    const _handleCloseError = () => {
        setErrorMessage('');
    };

    return (
        <>
            {isValuesAddVisible && <Dimmer onClick={_handleCloseValuesAdd} />}
            <TableWrapper isValuesAddVisible={isValuesAddVisible}>
                <FieldLabel ellipsis={{rows: 1, tooltip: true}}>{element.settings.label}</FieldLabel>
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
