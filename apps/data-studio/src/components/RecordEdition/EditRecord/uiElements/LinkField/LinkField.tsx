// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AntdThemeToken, RecordCard, themeVars, useLang} from '@leav/ui';
import {AnyPrimitive, ICommonFieldsSettings, IFormLinkFieldSettings} from '@leav/utils';
import {Popover, Skeleton, Switch, Table, theme} from 'antd';
import {ColumnsType} from 'antd/lib/table';
import {GlobalToken} from 'antd/lib/theme/interface';
import Paragraph from 'antd/lib/typography/Paragraph';
import CreationErrorContext from 'components/RecordEdition/EditRecordModal/creationErrorContext';
import {EditRecordReducerActionsTypes} from 'components/RecordEdition/editRecordModalReducer/editRecordModalReducer';
import {useEditRecordModalReducer} from 'components/RecordEdition/editRecordModalReducer/useEditRecordModalReducer';
import Dimmer from 'components/shared/Dimmer';
import ErrorMessage from 'components/shared/ErrorMessage';
import {
    IRecordColumnValueLink,
    IRecordColumnValueStandard,
    IRecordColumnValueTree,
    RecordColumnValue
} from 'graphQL/queries/records/getRecordColumnsValues';
import {IRecordPropertyLink, RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {RecordFormElementsValueLinkValue} from 'hooks/useGetRecordForm/useGetRecordForm';
import {useGetRecordValuesQuery} from 'hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import {useRefreshFieldValues} from 'hooks/useRefreshFieldValues';
import {Reducer, useContext, useEffect, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {arrayValueVersionToObject, localizedTranslation} from 'utils';
import {RecordIdentity, RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {RECORD_FORM_recordForm_elements_attribute_LinkAttribute} from '_gqlTypes/RECORD_FORM';
import {SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue} from '_gqlTypes/SAVE_VALUE_BATCH';
import {IRecordIdentityWhoAmI, PreviewSize} from '_types/types';
import getActiveFieldValues from '../../helpers/getActiveFieldValues';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';
import linkFieldReducer from '../../reducers/linkFieldReducer';
import {
    computeInitialState,
    ILinkFieldState,
    LinkFieldReducerActions,
    LinkFieldReducerActionsType
} from '../../reducers/linkFieldReducer/linkFieldReducer';
import AddValueBtn from '../../shared/AddValueBtn';
import DeleteAllValuesBtn from '../../shared/DeleteAllValuesBtn';
import FieldFooter from '../../shared/FieldFooter';
import InheritedFieldLabel from '../../shared/InheritedFieldLabel';
import NoValue from '../../shared/NoValue';
import UpdatedFieldIcon from '../../shared/UpdatedFieldIcon';
import ValueDetailsBtn from '../../shared/ValueDetailsBtn';
import ValuesVersionBtn from '../../shared/ValuesVersionBtn';
import ValuesVersionIndicator from '../../shared/ValuesVersionIndicator';
import {APICallStatus, FieldScope, IFormElementProps} from '../../_types';
import FloatingMenuHandler from './FloatingMenuHandler';
import ValuesAdd from './ValuesAdd';

const TableWrapper = styled.div<{isValuesAddVisible: boolean; $themeToken: AntdThemeToken}>`
    position: relative;
    z-index: ${p => (p.isValuesAddVisible ? 1 : 'auto')};
    border: 1px solid ${themeVars.borderColor};
    margin-bottom: 1.5em;
    border-radius: ${p => p.$themeToken.borderRadius}px;

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

    &&& .ant-table-header {
        border-radius: 0;
    }

    &&& .ant-table-footer {
        padding: 0;
    }
`;

const FieldLabel = styled(Paragraph)<{$themeToken: GlobalToken}>`
    && {
        top: calc(50% - 0.9em);
        font-size: 0.9em;
        background: ${themeVars.lightBg};
        padding: 0 0.5em;
        color: ${themeVars.secondaryTextColor};
        z-index: 1;
        margin-bottom: 0;
        border-top-left-radius: ${p => p.$themeToken.borderRadius}px;
        border-top-right-radius: ${p => p.$themeToken.borderRadius}px;
    }
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
    value: RecordFormElementsValueLinkValue;
    [columnName: string]: unknown;
}

type LinkFieldReducerState = ILinkFieldState<RecordFormElementsValueLinkValue>;
type LinkFieldReducerAction = LinkFieldReducerActions<RecordFormElementsValueLinkValue>;

function LinkField({
    element,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues
}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {token} = theme.useToken();

    const {readOnly: isRecordReadOnly, record} = useRecordEditionContext();
    const {state: editRecordModalState, dispatch: editRecordModalDispatch} = useEditRecordModalReducer();
    const creationErrors = useContext(CreationErrorContext);
    const isInCreationMode = record === null;

    const [state, dispatch] = useReducer<Reducer<LinkFieldReducerState, LinkFieldReducerAction>>(
        linkFieldReducer,
        computeInitialState({
            element,
            formVersion: editRecordModalState.valuesVersion,
            isRecordReadOnly,
            record
        })
    );

    const {fetchValues} = useRefreshFieldValues(record?.library?.id, state.attribute.id, record?.id);

    const attribute = state.attribute as RECORD_FORM_recordForm_elements_attribute_LinkAttribute;
    const settings = state.formElement.settings as IFormLinkFieldSettings;
    const linkedRecordsColumns = settings?.columns ?? [];
    const activeValues = getActiveFieldValues(state);
    const activeVersion = state.values[state.activeScope].version;

    const {loading: recordColumnsLoading, data: recordColumnsData, refetch} = useGetRecordValuesQuery(
        attribute?.linked_library?.gqlNames.query,
        linkedRecordsColumns.map(c => c.id),
        activeValues.map(r => r.linkValue?.id)
    );

    // Cancel value editing if value details panel is closed
    useEffect(() => {
        if (editRecordModalState.activeValue === null && state.isValuesAddVisible) {
            _handleCloseValuesAdd();
        }
    }, [editRecordModalState.activeValue]);

    useEffect(() => {
        if (creationErrors[attribute.id]) {
            dispatch({
                type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
                errorMessage: creationErrors[attribute.id].map(err => err.message).join(' ')
            });
        }
    }, [creationErrors, attribute.id]);

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
        editRecordModalDispatch({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            value: {
                attribute,
                value: null
            }
        });

        dispatch({
            type: LinkFieldReducerActionsType.SET_IS_VALUES_ADD_VISIBLE,
            isValuesAddVisible: true
        });
    };

    const _handleCloseValuesAdd = () => {
        dispatch({
            type: LinkFieldReducerActionsType.SET_IS_VALUES_ADD_VISIBLE,
            isValuesAddVisible: false
        });

        editRecordModalDispatch({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            value: null
        });
    };

    const _handleDeleteValue = async (value: IRecordPropertyLink) => {
        const deleteRes = await onValueDelete({value: value.linkValue.id, id_value: value.id_value}, attribute.id);

        if (deleteRes.status === APICallStatus.SUCCESS) {
            dispatch({
                type: LinkFieldReducerActionsType.DELETE_VALUE,
                idValue: value.id_value
            });

            if (!isInCreationMode) {
                const freshValues = await fetchValues(state.values[state.activeScope].version);

                dispatch({
                    type: LinkFieldReducerActionsType.REFRESH_VALUES,
                    formVersion: editRecordModalState.valuesVersion,
                    values: freshValues as RecordFormElementsValueLinkValue[]
                });
            }

            return;
        }
    };

    const _handleAddValueSubmit = async (values: RecordIdentity[]) => {
        const valuesToSave = values.map(value => ({
            attribute,
            idValue: null,
            value
        }));

        const res = await onValueSubmit(valuesToSave, activeVersion);

        if (res.status === APICallStatus.ERROR) {
            dispatch({
                type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
                errorMessage: res.error
            });
        } else if (res.values) {
            const formattedValues: RecordFormElementsValueLinkValue[] = (res.values as SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue[]).map(
                v => ({
                    ...v,
                    version: arrayValueVersionToObject(v.version)
                })
            );

            dispatch({
                type: LinkFieldReducerActionsType.ADD_VALUES,
                values: formattedValues
            });

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
            dispatch({
                type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
                errorMessage: errorsMessage
            });
        } else {
            dispatch({
                type: LinkFieldReducerActionsType.SET_IS_VALUES_ADD_VISIBLE,
                isValuesAddVisible: false
            });
        }
    };

    const _handleDeleteAllValues = async () => {
        const deleteRes = await onDeleteMultipleValues(
            attribute.id,
            getActiveFieldValues(state),
            state.values[state.activeScope].version
        );

        if (deleteRes.status === APICallStatus.SUCCESS) {
            dispatch({
                type: LinkFieldReducerActionsType.DELETE_ALL_VALUES
            });

            if (!isInCreationMode) {
                const freshValues = await fetchValues(state.values[state.activeScope].version);

                dispatch({
                    type: LinkFieldReducerActionsType.REFRESH_VALUES,
                    formVersion: editRecordModalState.valuesVersion,
                    values: freshValues as RecordFormElementsValueLinkValue[]
                });
            }
        }

        if (deleteRes?.errors?.length) {
            dispatch({
                type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
                errorMessage: deleteRes.errors.map(err => err.message)
            });
        }
    };

    const _handleScopeChange = (scope: FieldScope) => {
        dispatch({
            type: LinkFieldReducerActionsType.CHANGE_ACTIVE_SCOPE,
            scope
        });
    };

    const isReadOnly = element.attribute?.readonly || isRecordReadOnly || !attribute.permissions.edit_value;

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

            const cell = (
                <>
                    {!index && attribute.versions_conf?.versionable && (
                        <ValuesVersionIndicator activeScope={state.activeScope} />
                    )}
                    {valueRender}
                </>
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
                    {cell}
                </FloatingMenuHandler>
            ) : (
                cell
            );
        }
    }));

    const data: IRowData[] = activeValues.map(val => ({
        key: val.id_value + val.linkValue?.id,
        value: val,
        whoAmI: val.linkValue?.whoAmI,
        ..._getLinkedRecordColumnsValues(val.linkValue?.id)
    }));

    const canAddValue = !isReadOnly && (attribute.multiple_values || !activeValues.length);

    const versions = {
        [FieldScope.CURRENT]: state.values[FieldScope.CURRENT]?.version ?? null,
        [FieldScope.INHERITED]: state.values[FieldScope.INHERITED]?.version ?? null
    };
    const tableFooter = () => {
        return (
            <FieldFooter style={{borderRadius: 0}}>
                <div>
                    {attribute?.versions_conf?.versionable && (
                        <ValuesVersionBtn
                            versions={versions}
                            activeScope={state.activeScope}
                            onScopeChange={_handleScopeChange}
                            basic
                        />
                    )}
                    {!isReadOnly && !!activeValues.length && <DeleteAllValuesBtn onDelete={_handleDeleteAllValues} />}
                    <ValueDetailsBtn attribute={attribute} value={null} size="small" basic />
                </div>
                {!!activeValues.length && canAddValue && (
                    <AddValueBtn
                        activeScope={state.activeScope}
                        onClick={_handleAddValue}
                        disabled={state.isValuesAddVisible}
                        linkField
                    />
                )}
            </FieldFooter>
        );
    };

    const _handleCloseError = () => {
        dispatch({
            type: LinkFieldReducerActionsType.CLEAR_ERROR_MESSAGE
        });
    };

    return (
        <>
            {state.isValuesAddVisible && <Dimmer onClick={_handleCloseValuesAdd} />}
            <TableWrapper isValuesAddVisible={state.isValuesAddVisible} $themeToken={token}>
                <FieldLabel ellipsis={{rows: 1, tooltip: true}} $themeToken={token}>
                    {element.settings.label}
                    {editRecordModalState.externalUpdate.updatedValues[attribute?.id] && <UpdatedFieldIcon />}
                    {state.activeScope === FieldScope.INHERITED && (
                        <InheritedFieldLabel version={state.values[FieldScope.INHERITED].version} />
                    )}
                </FieldLabel>
                <Table
                    columns={cols}
                    dataSource={data}
                    size="small"
                    pagination={false}
                    locale={{
                        emptyText: <NoValue canAddValue={canAddValue} onAddValue={_handleAddValue} linkField />
                    }}
                    data-testid="linked-field-values"
                    footer={tableFooter}
                    scroll={{y: 280}}
                />
                {state.isValuesAddVisible && canAddValue && (
                    <ValuesAdd onAdd={_handleAddValueSubmit} attribute={attribute} onClose={_handleCloseValuesAdd} />
                )}
            </TableWrapper>
            {state.errorMessage && (
                <Popover
                    placement="bottomLeft"
                    open={!!state.errorMessage}
                    content={<ErrorMessage error={state.errorMessage} onClose={_handleCloseError} />}
                ></Popover>
            )}
        </>
    );
}

export default LinkField;
