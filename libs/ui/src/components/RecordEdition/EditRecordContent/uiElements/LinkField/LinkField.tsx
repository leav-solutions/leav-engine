// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICommonFieldsSettings, localizedTranslation} from '@leav/utils';
import {FunctionComponent, Reducer, useContext, useEffect, useReducer, useState} from 'react';
import CreationErrorContext from '_ui/components/RecordEdition/EditRecord/creationErrorContext';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {
    RecordFormElementsValueLinkValue,
    RecordFormElementsValueStandardValue
} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IRecordIdentity} from '_ui/types/records';
import {RecordFormAttributeLinkAttributeFragment, ValueDetailsLinkValueFragment} from '_ui/_gqlTypes';
import {IRecordPropertyLink} from '_ui/_queries/records/getRecordPropertiesQuery';
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
import {APICallStatus, IFormElementProps} from '../../_types';
import {MonoValueSelect} from '_ui/components/RecordEdition/EditRecordContent/uiElements/LinkField/MonoValueSelect/MonoValueSelect';
import {AntForm, KitButton, KitInputWrapper, KitSpace} from 'aristid-ds';
import {MultiValueSelect} from './MultiValueSelect/MultiValueSelect';
import {useLang} from '_ui/hooks';
import styled from 'styled-components';

//TODO: factoriser avec StandardField
import {DeleteAllValuesButton} from '../shared/DeleteAllValuesButton';
import {IEntrypointLink, IPrimaryAction} from '_ui/components/Explorer/_types';
import {Explorer} from '_ui/components/Explorer';
import {FaList} from 'react-icons/fa';
import {LINK_FIELD_ID_PREFIX} from '_ui/constants';
import {IExplorerRef} from '_ui/components/Explorer/Explorer';
import {computeCalculatedFlags, computeInheritedFlags} from '../shared/calculatedInheritedFlags';
import {Form} from 'antd';
import {ComputeIndicator} from '../shared/ComputeIndicator';

export type LinkFieldReducerState = ILinkFieldState<RecordFormElementsValueLinkValue>;
type LinkFieldReducerAction = LinkFieldReducerActions<RecordFormElementsValueLinkValue>;

//TODO: factoriser avec StandardField
const KitInputExtraAlignLeft = styled.div`
    margin-right: auto;
    line-height: 12px;
`;

const KitFooterButton = styled(KitButton)`
    margin-top: calc((var(--general-spacing-xs)) * 1px);
`;

const KitFieldsWrapper = styled.div`
    max-height: 322px;

    > div {
        max-height: 322px;
    }
`;

const KitInputWrapperStyled = styled(KitInputWrapper)`
    &.disabled {
        .kit-input-wrapper-content {
            background-color: var(--general-utilities-neutral-light);
        }
    }

    &.error {
        .kit-input-wrapper-content {
            background-color: var(--general-utilities-error-light);
        }
    }
`;

const LinkField: FunctionComponent<IFormElementProps<ICommonFieldsSettings>> = ({
    element,
    readonly,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues
}) => {
    const {t} = useSharedTranslation();
    const {state} = useEditRecordReducer();
    const {lang} = useLang();
    const {attribute} = element;

    const [backendValues, setBackendValues] = useState<RecordFormElementsValueStandardValue[]>(element.values);
    const calculatedFlags = computeCalculatedFlags(backendValues);
    const inheritedFlags = computeInheritedFlags(backendValues);

    console.log({backendValues, calculatedFlags, inheritedFlags});

    // const {readOnly: isRecordReadOnly, record} = useRecordEditionContext();
    // const creationErrors = useContext(CreationErrorContext);

    //TODO: toujours utiles ?
    // const [state, dispatch] = useReducer<Reducer<LinkFieldReducerState, LinkFieldReducerAction>>(
    //     linkFieldReducer,
    //     computeInitialState({
    //         element,
    //         formVersion: editRecordState.valuesVersion,
    //         isRecordReadOnly,
    //         record
    //     })
    // );

    // const activeValues = getActiveFieldValues(state);
    // const activeVersion = state.values[state.activeScope].version;

    //TODO: toujours utiles ?
    // useEffect(() => {
    //     if (creationErrors[attribute.id]) {
    //         dispatch({
    //             type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
    //             errorMessage: creationErrors[attribute.id].map(err => err.message).join(' ')
    //         });
    //     }
    // }, [creationErrors, attribute.id]);

    //TODO: delete
    // const _handleDeleteValue = async (value: IRecordPropertyLink) => {
    //     const deleteRes = await onValueDelete({payload: value.linkValue.id, id_value: value.id_value}, attribute.id);

    //     if (deleteRes.status === APICallStatus.SUCCESS) {
    //         dispatch({
    //             type: LinkFieldReducerActionsType.DELETE_VALUE,
    //             idValue: value.id_value
    //         });
    //     }
    // };

    //TODO: delete
    // const _handleUpdateValueSubmit = async (values: Array<{value: IRecordIdentity; idValue: string}>) => {
    //     const valuesToSave = values.map(value => ({
    //         attribute,
    //         idValue: value.idValue,
    //         value: value.value
    //     }));

    //     const res = await onValueSubmit(valuesToSave, activeVersion);

    //     if (res.status === APICallStatus.ERROR) {
    //         dispatch({
    //             type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
    //             errorMessage: res.error
    //         });
    //     } else if (res.values) {
    //         const formattedValues: RecordFormElementsValueLinkValue[] = (
    //             res.values as ValueDetailsLinkValueFragment[]
    //         ).map(v => ({
    //             ...v,
    //             version: arrayValueVersionToObject(v.version),
    //             metadata: v.metadata?.map(metadata => ({
    //                 ...metadata,
    //                 value: {
    //                     ...metadata.value,
    //                     version: arrayValueVersionToObject(metadata.value?.version ?? [])
    //                 }
    //             }))
    //         }));

    //         dispatch({
    //             type: LinkFieldReducerActionsType.ADD_VALUES,
    //             values: formattedValues
    //         });
    //     }

    //     if (res?.errors?.length) {
    //         const selectedRecordsById = values.reduce((acc, cur) => ({...acc, [cur.value.id]: cur.value}), {});

    //         const errorsMessage = res.errors.map(err => {
    //             const linkedRecordLabel = selectedRecordsById[err.input].label || selectedRecordsById[err.input].id;

    //             return `${linkedRecordLabel}: ${err.message}`;
    //         });
    //         dispatch({
    //             type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
    //             errorMessage: errorsMessage
    //         });
    //     }
    // };

    //TODO: Fix bug: Ajout 2 éléments -> mtn 5 -> supprimer tout -> supprimer les 3 éléments précédemment ajoutés pas les 2 nouveaux
    const _handleDeleteAllValues = async () => {
        const deleteRes = await onDeleteMultipleValues(
            attribute.id,
            backendValues.filter(b => b.id_value),
            null
        );

        if (deleteRes.status === APICallStatus.SUCCESS) {
            // antdListFieldsRef.current.remove(antdListFieldsRef.current.indexes);
            // antdListFieldsRef.current.add(defaultValueToAddInAntdForm);
            setBackendValues(previousBackendValues =>
                previousBackendValues.filter(backendValue => !backendValue.id_value)
            );

            return;
        }
    };

    const label = localizedTranslation(element.settings.label, lang);

    //-------
    //TODO: test -> on a bien recréer les boutons (vérifier disabled et callback ??)
    //TODO: Supprimer MultiValueSelect et MonoValueSelect (ainsi que tous leurs fichiers + références diverses)

    //TODO: Supprimer le state et passer par element (cf StandardField)
    //TODO: handle computed values and flags 🥲
    const linkEntrypoint: IEntrypointLink = {
        type: 'link',
        parentLibraryId: state.libraryId,
        parentRecordId: state.record.id,
        linkAttributeId: attribute.id
    };

    const isReadOnly = attribute.readonly || readonly;
    // const isReadOnly = true;

    const isMultipleValues = element.attribute.multiple_values;

    //TODO: add more check
    const canDeleteAllValues = isMultipleValues && !attribute.required;

    const isFieldInError = false;
    //TODO: check if field is in error (cf StandardField)

    const [explorerActions, setExplorerActions] = useState<IExplorerRef | null>(null);

    const _handleExplorerRef = (ref: IExplorerRef) => {
        //TODO: Prendre en compte link action et totalCount
        if (ref?.createAction.disabled !== explorerActions?.createAction?.disabled) {
            setExplorerActions({
                createAction: ref?.createAction,
                linkAction: ref?.linkAction,
                totalCount: ref?.totalCount
            });
        }
    };

    //TODO: callback pour mettre à jour fields value ?????????????
    const form = AntForm.useFormInstance();
    console.log(form.getFieldsValue());

    return (
        <AntForm.Item
            name={attribute.id}
            rules={[
                {
                    required: attribute.required,
                    message: t('errors.standard_field_required')
                }
            ]}
        >
            <KitInputWrapperStyled
                id={LINK_FIELD_ID_PREFIX + attribute.id}
                label={label}
                required={attribute.required}
                bordered
                disabled={isReadOnly}
                status={isFieldInError ? 'error' : undefined}
                extra={
                    <>
                        <KitInputExtraAlignLeft>
                            <ComputeIndicator calculatedFlags={calculatedFlags} inheritedFlags={inheritedFlags} />
                        </KitInputExtraAlignLeft>
                        {canDeleteAllValues && (
                            <DeleteAllValuesButton
                                handleDelete={_handleDeleteAllValues}
                                disabled={isReadOnly}
                                danger={isFieldInError}
                            />
                        )}
                    </>
                }
            >
                <>
                    <KitFieldsWrapper>
                        <Explorer
                            ref={_handleExplorerRef}
                            entrypoint={linkEntrypoint}
                            showTitle={false}
                            showSearch={false}
                            disableSelection={isReadOnly || !isMultipleValues}
                            defaultActionsForItem={isReadOnly ? [] : undefined}
                            hidePrimaryActions
                            hideTableHeader
                            iconsOnlyItemActions
                        />
                    </KitFieldsWrapper>
                    <KitSpace size="xs">
                        <KitFooterButton
                            type="secondary"
                            size="m"
                            icon={explorerActions?.createAction?.icon}
                            disabled={isReadOnly || explorerActions?.createAction?.disabled}
                            onClick={explorerActions?.createAction?.callback}
                        >
                            {explorerActions?.createAction?.label}
                        </KitFooterButton>
                        <KitFooterButton
                            type="secondary"
                            size="m"
                            icon={<FaList />}
                            disabled={isReadOnly || explorerActions?.createAction?.disabled} //TODO: When linkAction.disabled will be fixed, replace by linkAction.disabled
                            onClick={explorerActions?.linkAction?.callback}
                        >
                            {explorerActions?.linkAction?.label}
                        </KitFooterButton>
                    </KitSpace>
                </>
                {/* {attribute.multiple_values === true ? (
                    <MultiValueSelect
                        activeValues={activeValues}
                        attribute={attribute}
                        label={label}
                        required={state.formElement.attribute.required}
                        onValueDeselect={_handleDeleteValue}
                        onSelectChange={_handleUpdateValueSubmit}
                    />
                ) : (
                    <MonoValueSelect
                        activeValue={activeValues[0]}
                        attribute={attribute}
                        label={label}
                        required={state.formElement.attribute.required}
                        onSelectClear={_handleDeleteValue}
                        onSelectChange={_handleUpdateValueSubmit}
                    />
                )} */}
            </KitInputWrapperStyled>
        </AntForm.Item>
    );
};

export default LinkField;
