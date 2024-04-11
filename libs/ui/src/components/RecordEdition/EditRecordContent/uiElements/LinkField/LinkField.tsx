// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive, ICommonFieldsSettings, IFormLinkFieldSettings, localizedTranslation} from '@leav/utils';
import {Popover, Skeleton, Switch, Table, theme} from 'antd';
import {ColumnsType} from 'antd/lib/table';
import {GlobalToken} from 'antd/lib/theme/interface';
import Paragraph from 'antd/lib/typography/Paragraph';
import {Reducer, useContext, useEffect, useReducer} from 'react';
import styled from 'styled-components';
import {AntdThemeToken, themeVars} from '_ui/antdTheme';
import {RecordCard} from '_ui/components';
import Dimmer from '_ui/components/Dimmer';
import ErrorMessage from '_ui/components/ErrorMessage';
import CreationErrorContext from '_ui/components/RecordEdition/EditRecord/creationErrorContext';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {PreviewSize} from '_ui/constants';
import {useLang} from '_ui/hooks';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {useGetRecordValuesQuery} from '_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import {useRefreshFieldValues} from '_ui/hooks/useRefreshFieldValues';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IRecordIdentity, IRecordIdentityWhoAmI} from '_ui/types/records';
import {RecordFormAttributeLinkAttributeFragment, ValueDetailsLinkValueFragment} from '_ui/_gqlTypes';
import {
    IRecordColumnValueLink,
    IRecordColumnValueStandard,
    IRecordColumnValueTree,
    RecordColumnValue
} from '_ui/_queries/records/getRecordColumnsValues';
import {IRecordPropertyLink, RecordProperty} from '_ui/_queries/records/getRecordPropertiesQuery';
import {arrayValueVersionToObject} from '_ui/_utils';
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
import {MonoValueSelect} from '_ui/components/RecordEdition/EditRecordContent/uiElements/LinkField/MonoValueSelect/MonoValueSelect';
import {AntForm} from 'aristid-ds';

const TableWrapper = styled.div<{$isValuesAddVisible: boolean; $themeToken: AntdThemeToken}>`
    position: relative;
    z-index: ${p => (p.$isValuesAddVisible ? 1 : 'auto')};
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

export type LinkFieldReducerState = ILinkFieldState<RecordFormElementsValueLinkValue>;
type LinkFieldReducerAction = LinkFieldReducerActions<RecordFormElementsValueLinkValue>;

function LinkField({
    element,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues
}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const {token} = theme.useToken();

    const {readOnly: isRecordReadOnly, record} = useRecordEditionContext();
    const {state: editRecordState, dispatch: editRecordDispatch} = useEditRecordReducer();
    const creationErrors = useContext(CreationErrorContext);
    const isInCreationMode = record === null;

    const [state, dispatch] = useReducer<Reducer<LinkFieldReducerState, LinkFieldReducerAction>>(
        linkFieldReducer,
        computeInitialState({
            element,
            formVersion: editRecordState.valuesVersion,
            isRecordReadOnly,
            record
        })
    );

    const {fetchValues} = useRefreshFieldValues(record?.library?.id, state.attribute.id, record?.id);

    const attribute = state.attribute as RecordFormAttributeLinkAttributeFragment;
    const settings = state.formElement.settings as IFormLinkFieldSettings;
    const linkedRecordsColumns = settings?.columns ?? [];
    const activeValues = getActiveFieldValues(state);
    const activeVersion = state.values[state.activeScope].version;

    const {loading: recordColumnsLoading, data: recordColumnsData, refetch} = useGetRecordValuesQuery(
        attribute?.linked_library?.id,
        linkedRecordsColumns.map(c => c.id),
        activeValues.map(r => r.linkValue?.id)
    );

    // Cancel value editing if value details panel is closed
    useEffect(() => {
        if (editRecordState.activeValue === null && state.isValuesAddVisible) {
            _handleCloseValuesAdd();
        }
    }, [editRecordState.activeValue]);

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
        editRecordDispatch({
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

        editRecordDispatch({
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
                    formVersion: editRecordState.valuesVersion,
                    values: freshValues as RecordFormElementsValueLinkValue[]
                });
            }

            return;
        }
    };

    const _handleAddValueSubmit = async (values: IRecordIdentity[]) => {
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
            const formattedValues: RecordFormElementsValueLinkValue[] = (res.values as ValueDetailsLinkValueFragment[]).map(
                v => ({
                    ...v,
                    version: arrayValueVersionToObject(v.version),
                    metadata: v.metadata?.map(metadata => ({
                        ...metadata,
                        value: {
                            ...metadata.value,
                            version: arrayValueVersionToObject(metadata.value.version ?? [])
                        }
                    }))
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
                    formVersion: editRecordState.valuesVersion,
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

    const isReadOnly = element.attribute?.readonly || isRecordReadOnly || !attribute?.permissions?.edit_value;

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
                    <RecordCard record={colData as IRecordIdentityWhoAmI} size={PreviewSize.small} />
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
            {attribute.multiple_values ? (
                <>
                    {state.isValuesAddVisible && <Dimmer onClick={_handleCloseValuesAdd} />}
                    <TableWrapper $isValuesAddVisible={state.isValuesAddVisible} $themeToken={token}>
                        <FieldLabel ellipsis={{rows: 1, tooltip: true}} $themeToken={token}>
                            {element.settings.label}
                            {editRecordState.externalUpdate.updatedValues[attribute?.id] && <UpdatedFieldIcon />}
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
                            <ValuesAdd
                                onAdd={_handleAddValueSubmit}
                                attribute={attribute}
                                onClose={_handleCloseValuesAdd}
                            />
                        )}
                    </TableWrapper>
                    {state.errorMessage && (
                        <Popover
                            placement="bottomLeft"
                            open={!!state.errorMessage}
                            content={<ErrorMessage error={state.errorMessage} onClose={_handleCloseError} />}
                        />
                    )}
                </>
            ) : (
                <AntForm.Item
                    name={attribute.id}
                    rules={[
                        {
                            required: state.formElement.settings.required,
                            message: t('errors.standard_field_required')
                        }
                    ]}
                >
                    <MonoValueSelect
                        activeValue={activeValues[0]}
                        attribute={attribute}
                        label={state.formElement.settings.label}
                        required={state.formElement.settings.required}
                        onSelectClear={onValueDelete}
                        onSelectChange={onValueSubmit}
                    />
                </AntForm.Item>
            )}
        </>
    );
}

export default LinkField;
