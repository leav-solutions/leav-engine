// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICommonFieldsSettings} from '@leav/utils';
import {ReactNode, Reducer, useContext, useEffect, useReducer} from 'react';
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
import {AntForm} from 'aristid-ds';
import {MultiValueSelect} from './MultiValueSelect/MultiValueSelect';
import ValueDetailsBtn from '../../shared/ValueDetailsBtn';

export type LinkFieldReducerState = ILinkFieldState<RecordFormElementsValueLinkValue>;
type LinkFieldReducerAction = LinkFieldReducerActions<RecordFormElementsValueLinkValue>;

function LinkField({
    element,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues
}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useSharedTranslation();

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
        const deleteRes = await onValueDelete({value: value.linkValue.id, id_value: value.id_value}, attribute.id);

        if (deleteRes.status === APICallStatus.SUCCESS) {
            dispatch({
                type: LinkFieldReducerActionsType.DELETE_VALUE,
                idValue: value.id_value
            });
        }
    };

    const _handleAddValueSubmit = async (values: IRecordIdentity[]) => {
        const valuesToSave = values.map(value => ({
            attribute,
            idValue: element.attribute.multiple_values ? null : activeValues[0]?.id_value,
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
        }

        if (deleteRes?.errors?.length) {
            dispatch({
                type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
                errorMessage: deleteRes.errors.map(err => err.message)
            });
        }
    };

    const infoButton: ReactNode = editRecordState.withInfoButton ? (
        <ValueDetailsBtn value={null} attribute={attribute} size="small" shape="circle" />
    ) : null;

    return attribute.multiple_values === true ? (
        <AntForm.Item name={attribute.id}>
            <MultiValueSelect
                activeValues={activeValues}
                attribute={attribute}
                label={state.formElement.settings.label}
                onValueDeselect={_handleDeleteValue}
                onSelectClear={_handleDeleteAllValues}
                onSelectChange={_handleAddValueSubmit}
                infoButton={infoButton}
            />
        </AntForm.Item>
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
                onSelectClear={_handleDeleteValue}
                onSelectChange={_handleAddValueSubmit}
                infoButton={infoButton}
            />
        </AntForm.Item>
    );
}

export default LinkField;
