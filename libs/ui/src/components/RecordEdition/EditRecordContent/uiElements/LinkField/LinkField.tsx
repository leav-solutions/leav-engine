// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICommonFieldsSettings, localizedTranslation} from '@leav/utils';
import {FunctionComponent, Reducer, useContext, useEffect, useReducer, useRef, useState} from 'react';
import CreationErrorContext from '_ui/components/RecordEdition/EditRecord/creationErrorContext';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
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
import {AntForm, KitButton, KitInputWrapper, KitSpace, KitTooltip} from 'aristid-ds';
import {MultiValueSelect} from './MultiValueSelect/MultiValueSelect';
import {useLang} from '_ui/hooks';
import styled from 'styled-components';

//TODO: factoriser avec StandardField
import {ComputeIndicator} from '../StandardField/ComputeIndicator';
import {DeleteAllValuesButton} from '../StandardField/DeleteAllValuesButton';
import {IEntrypointLink, IPrimaryAction} from '_ui/components/Explorer/_types';
import {Explorer} from '_ui/components/Explorer';
import {FaList, FaPlus} from 'react-icons/fa';
import {LINK_FIELD_ID_PREFIX} from '_ui/constants';
import {ExplorerRef} from '_ui/components/Explorer/Explorer';

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
    // overflow-y: scroll;

    > div {
        max-height: 322px;
    }
`;

const LinkField: FunctionComponent<IFormElementProps<ICommonFieldsSettings>> = ({
    element,
    readonly,
    onValueSubmit,
    onValueDelete
}) => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const {readOnly: isRecordReadOnly, record} = useRecordEditionContext();
    const {state: editRecordState} = useEditRecordReducer();
    const creationErrors = useContext(CreationErrorContext);

    const [state, dispatch] = useReducer<Reducer<LinkFieldReducerState, LinkFieldReducerAction>>(
        linkFieldReducer,
        computeInitialState({
            element,
            formVersion: editRecordState.valuesVersion,
            isRecordReadOnly,
            record
        })
    );

    console.log({state});

    const attribute = state.attribute as RecordFormAttributeLinkAttributeFragment;
    const activeValues = getActiveFieldValues(state);
    const activeVersion = state.values[state.activeScope].version;

    useEffect(() => {
        if (creationErrors[attribute.id]) {
            dispatch({
                type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
                errorMessage: creationErrors[attribute.id].map(err => err.message).join(' ')
            });
        }
    }, [creationErrors, attribute.id]);

    const _handleDeleteValue = async (value: IRecordPropertyLink) => {
        const deleteRes = await onValueDelete({payload: value.linkValue.id, id_value: value.id_value}, attribute.id);

        if (deleteRes.status === APICallStatus.SUCCESS) {
            dispatch({
                type: LinkFieldReducerActionsType.DELETE_VALUE,
                idValue: value.id_value
            });
        }
    };

    const _handleUpdateValueSubmit = async (values: Array<{value: IRecordIdentity; idValue: string}>) => {
        const valuesToSave = values.map(value => ({
            attribute,
            idValue: value.idValue,
            value: value.value
        }));

        const res = await onValueSubmit(valuesToSave, activeVersion);

        if (res.status === APICallStatus.ERROR) {
            dispatch({
                type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
                errorMessage: res.error
            });
        } else if (res.values) {
            const formattedValues: RecordFormElementsValueLinkValue[] = (
                res.values as ValueDetailsLinkValueFragment[]
            ).map(v => ({
                ...v,
                version: arrayValueVersionToObject(v.version),
                metadata: v.metadata?.map(metadata => ({
                    ...metadata,
                    value: {
                        ...metadata.value,
                        version: arrayValueVersionToObject(metadata.value?.version ?? [])
                    }
                }))
            }));

            dispatch({
                type: LinkFieldReducerActionsType.ADD_VALUES,
                values: formattedValues
            });
        }

        if (res?.errors?.length) {
            const selectedRecordsById = values.reduce((acc, cur) => ({...acc, [cur.value.id]: cur.value}), {});

            const errorsMessage = res.errors.map(err => {
                const linkedRecordLabel = selectedRecordsById[err.input].label || selectedRecordsById[err.input].id;

                return `${linkedRecordLabel}: ${err.message}`;
            });
            dispatch({
                type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
                errorMessage: errorsMessage
            });
        }
    };

    const label = localizedTranslation(state.formElement.settings.label, lang);

    //-------
    //TODO: Supprimer le state et passer par element (cf StandardField)
    //TODO: handle computed values and flags 🥲
    const linkEntrypoint: IEntrypointLink = {
        type: 'link',
        parentLibraryId: editRecordState.libraryId,
        parentRecordId: editRecordState.record.id,
        linkAttributeId: attribute.id
    };

    const isReadOnly = attribute.readonly || readonly;

    const isMultipleValues = element.attribute.multiple_values;

    const isFieldInError = false;
    //TODO: check if field is in error (cf StandardField)

    const explorerRef = useRef<ExplorerRef>(null);
    const [explorerActions, setExplorerActions] = useState<{createAction: IPrimaryAction; linkAction: IPrimaryAction}>(
        null
    );

    useEffect(() => {
        if (explorerRef.current && !explorerActions) {
            setExplorerActions({
                createAction: explorerRef.current.createAction,
                linkAction: explorerRef.current.linkAction
            });
        }
    }, [explorerRef.current]);

    console.log({explorerRef, explorerActions});

    return (
        <AntForm.Item
            name={attribute.id}
            rules={[
                {
                    required: state.formElement.attribute.required,
                    message: t('errors.standard_field_required')
                }
            ]}
        >
            <KitInputWrapper
                id={LINK_FIELD_ID_PREFIX + attribute.id}
                label={label}
                required={attribute.required}
                bordered
                disabled={isReadOnly}
                status={isFieldInError ? 'error' : undefined}
                extra={
                    <>
                        <KitInputExtraAlignLeft>
                            {/* <ComputeIndicator calculatedFlags={calculatedFlags} inheritedFlags={inheritedFlags} /> */}
                        </KitInputExtraAlignLeft>
                        {true && <DeleteAllValuesButton handleDelete={null} />}
                    </>
                }
            >
                <>
                    <KitFieldsWrapper>
                        <Explorer
                            ref={explorerRef}
                            entrypoint={linkEntrypoint}
                            showTitle={false}
                            showSearch={false}
                            disableSelection={!isMultipleValues}
                            hidePrimaryActions
                            iconsOnlyItemActions
                            hideTableHeader
                        />
                    </KitFieldsWrapper>
                    <KitSpace size="xs">
                        <KitFooterButton
                            type="secondary"
                            size="m"
                            icon={<FaPlus />}
                            disabled={explorerActions?.createAction.disabled}
                            onClick={explorerActions?.createAction.callback}
                        >
                            {explorerActions?.createAction.label}
                        </KitFooterButton>
                        <KitFooterButton
                            type="secondary"
                            size="m"
                            icon={<FaList />}
                            disabled={explorerActions?.linkAction.disabled}
                            onClick={explorerActions?.linkAction.callback}
                        >
                            {explorerActions?.linkAction.label}
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
            </KitInputWrapper>
        </AntForm.Item>
    );
};

export default LinkField;
