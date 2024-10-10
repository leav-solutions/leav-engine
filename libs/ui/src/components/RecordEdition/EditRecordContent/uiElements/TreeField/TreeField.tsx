// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICommonFieldsSettings, localizedTranslation} from '@leav/utils';
import {List, Popover, theme} from 'antd';
import {GlobalToken} from 'antd/lib/theme/interface';
import Paragraph from 'antd/lib/typography/Paragraph';
import {Reducer, useContext, useEffect, useReducer} from 'react';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import Dimmer from '_ui/components/Dimmer';
import ErrorMessage from '_ui/components/ErrorMessage';
import CreationErrorContext from '_ui/components/RecordEdition/EditRecord/creationErrorContext';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {useRefreshFieldValues} from '_ui/hooks/useRefreshFieldValues';
import {ITreeNodeWithRecord} from '_ui/types/trees';
import {RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import {IRecordPropertyTree} from '_ui/_queries/records/getRecordPropertiesQuery';
import {arrayValueVersionToObject} from '_ui/_utils';
import getActiveFieldValues from '../../helpers/getActiveFieldValues';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';
import linkFieldReducer, {
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
import {APICallStatus, VersionFieldScope, IFormElementProps} from '../../_types';
import TreeFieldValue from './TreeFieldValue';
import ValuesAdd from './ValuesAdd';
import {useLang} from '_ui/hooks';

const Wrapper = styled.div<{$isValuesAddVisible: boolean; $themeToken: GlobalToken}>`
    position: relative;
    border: 1px solid ${themeVars.borderColor};
    margin-bottom: 1.5em;
    border-radius: ${p => p.$themeToken.borderRadius}px;
    background: ${themeVars.defaultBg};
    z-index: ${p => (p.$isValuesAddVisible ? 1 : 'auto')};

    .ant-list-items {
        max-height: 320px;
        overflow-y: auto;
    }

    .ant-list-footer {
        padding: 0;
        border-radius: ${p => p.$themeToken.borderRadius}px;
    }
`;

const FieldLabel = styled(Paragraph)`
    && {
        top: calc(50% - 0.9em);
        font-size: 0.9em;
        padding: 0 0.5em;
        color: ${themeVars.secondaryTextColor};
        z-index: 1;
        margin-bottom: 0;
    }
`;

type TreeFieldReducerState = ILinkFieldState<RecordFormElementsValueTreeValue>;
type TreeFieldReducerAction = LinkFieldReducerActions<RecordFormElementsValueTreeValue>;

function TreeField({
    element,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues
}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {token} = theme.useToken();
    const {lang: availableLangs} = useLang();
    const {state: editRecordState, dispatch: editRecordDispatch} = useEditRecordReducer();
    const {readOnly: isRecordReadOnly, record} = useRecordEditionContext();

    const creationErrors = useContext(CreationErrorContext);
    const isInCreationMode = record === null;

    const [state, dispatch] = useReducer<Reducer<TreeFieldReducerState, TreeFieldReducerAction>>(
        linkFieldReducer,
        computeInitialState({
            element,
            formVersion: editRecordState.valuesVersion,
            isRecordReadOnly,
            record
        })
    );

    const {fetchValues} = useRefreshFieldValues(record?.library?.id, state.attribute.id, record?.id);

    const attribute = state.attribute as RecordFormAttributeTreeAttributeFragment;
    const isReadOnly = attribute?.readonly || isRecordReadOnly || !attribute.permissions.edit_value;
    const activeValues = getActiveFieldValues(state);
    const activeVersion = state.values[state.activeScope]?.version;

    const data = activeValues.map(val => ({
        ...val,
        key: val.id_value
    }));

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

    const renderItem = (value: IRecordPropertyTree) => {
        const _handleDelete = async () => {
            const deleteRes = await onValueDelete({id_value: value.id_value}, attribute.id);

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
                        values: freshValues as RecordFormElementsValueTreeValue[]
                    });
                }

                return;
            }
        };

        return (
            <>
                {attribute.versions_conf?.versionable && <ValuesVersionIndicator activeScope={state.activeScope} />}
                <TreeFieldValue value={value} attribute={attribute} onDelete={_handleDelete} isReadOnly={isReadOnly} />
            </>
        );
    };

    const canAddValue = !isReadOnly && (attribute.multiple_values || !activeValues.length);

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

    const _handleSubmitSelectTreeNodeModal = async (treeNodes: ITreeNodeWithRecord[]) => {
        const valuesToSave = treeNodes.map(node => ({
            attribute,
            idValue: null,
            value: node
        }));

        const res = await onValueSubmit(valuesToSave, activeVersion);

        if (res.status === APICallStatus.ERROR) {
            dispatch({
                type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
                errorMessage: res.error
            });
        } else if (res.values) {
            const formattedValues: RecordFormElementsValueTreeValue[] = res.values.map(v => ({
                ...v,
                version: arrayValueVersionToObject(v.version),
                metadata: v.metadata?.map(metadata => ({
                    ...metadata,
                    value: {
                        ...metadata.value,
                        version: arrayValueVersionToObject(metadata.value.version ?? [])
                    }
                }))
            }));

            dispatch({
                type: LinkFieldReducerActionsType.ADD_VALUES,
                values: formattedValues
            });
        }

        if (res?.errors?.length) {
            const selectedNodesById = treeNodes.reduce((acc, cur) => ({...acc, [cur.id]: cur}), {});

            const errorsMessage = res.errors.map(err => {
                const linkedRecordLabel = selectedNodesById[err.input].title || selectedNodesById[err.input].id;

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
        const deleteRes = await onDeleteMultipleValues(attribute.id, activeValues, activeVersion);

        if (deleteRes.status === APICallStatus.SUCCESS) {
            dispatch({
                type: LinkFieldReducerActionsType.DELETE_ALL_VALUES
            });

            if (!isInCreationMode) {
                const freshValues = await fetchValues(state.values[state.activeScope].version);

                dispatch({
                    type: LinkFieldReducerActionsType.REFRESH_VALUES,
                    formVersion: editRecordState.valuesVersion,
                    values: freshValues as RecordFormElementsValueTreeValue[]
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

    const _handleScopeChange = (scope: VersionFieldScope) => {
        dispatch({
            type: LinkFieldReducerActionsType.CHANGE_ACTIVE_SCOPE,
            scope
        });
    };

    const versions = {
        [VersionFieldScope.CURRENT]: state.values[VersionFieldScope.CURRENT]?.version ?? null,
        [VersionFieldScope.INHERITED]: state.values[VersionFieldScope.INHERITED]?.version ?? null
    };
    const ListFooter = (
        <FieldFooter>
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

    const _handleCloseError = () => {
        dispatch({
            type: LinkFieldReducerActionsType.CLEAR_ERROR_MESSAGE
        });
    };

    const label = localizedTranslation(attribute.label, availableLangs);

    return (
        <>
            {state.isValuesAddVisible && <Dimmer onClick={_handleCloseValuesAdd} />}
            <Wrapper $isValuesAddVisible={state.isValuesAddVisible} $themeToken={token}>
                <FieldLabel ellipsis={{rows: 1, tooltip: true}}>
                    {label}
                    {editRecordState.externalUpdate.updatedValues[attribute?.id] && <UpdatedFieldIcon />}
                    {state.activeScope === VersionFieldScope.INHERITED && (
                        <InheritedFieldLabel version={state.values[VersionFieldScope.INHERITED].version} />
                    )}
                </FieldLabel>
                <List
                    dataSource={data}
                    renderItem={renderItem}
                    split
                    locale={{
                        emptyText: <NoValue canAddValue={canAddValue} onAddValue={_handleAddValue} linkField />
                    }}
                    footer={ListFooter}
                />
                {state.isValuesAddVisible && (
                    <ValuesAdd
                        attribute={attribute}
                        onAdd={_handleSubmitSelectTreeNodeModal}
                        onClose={_handleCloseValuesAdd}
                    />
                )}
            </Wrapper>
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

export default TreeField;
