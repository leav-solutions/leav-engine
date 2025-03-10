// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorTypes, ICommonFieldsSettings, localizedTranslation} from '@leav/utils';
import {FunctionComponent, useEffect, useState} from 'react';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFilterInput} from '_ui/_gqlTypes';
import {ILinkFieldState} from '../../reducers/linkFieldReducer/linkFieldReducer';
import {APICallStatus, IFormElementProps, ISubmitMultipleResult} from '../../_types';
import {AntForm, KitInputWrapper} from 'aristid-ds';
import {useLang} from '_ui/hooks';
import styled from 'styled-components';
import {DeleteAllValuesButton} from '../shared/DeleteAllValuesButton';
import {IItemData, MassSelection} from '_ui/components/Explorer/_types';
import {LINK_FIELD_ID_PREFIX} from '_ui/constants';
import {computeCalculatedFlags, computeInheritedFlags} from '../shared/calculatedInheritedFlags';
import {ComputeIndicator} from '../shared/ComputeIndicator';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {useOutsideInteractionDetector} from '../shared/useOutsideInteractionDetector';
import LinkRecordsInCreation from './LinkRecordsInCreation';
import LinkRecordsInEdition from './LinkRecordsInEdition';

export type LinkFieldReducerState = ILinkFieldState<RecordFormElementsValueLinkValue>;

const Wrapper = styled.div<{$metadataEdit: boolean}>`
    margin-bottom: ${props => (props.$metadataEdit ? 0 : '1.5em')};
`;

const KitInputExtraAlignLeft = styled.div`
    margin-right: auto;
    line-height: 12px;
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

    .ant-empty-image,
    .ant-empty-description {
        display: none;
    }
`;

//---------------------
//TODO: Test
// - Creation:
//   - TODO
// - Edition:

//TODO: test -> on a bien recréer les boutons (vérifier disabled et callback ??)
//TODO: Vérifier la création (required)

type LinkFieldProps = IFormElementProps<
    ICommonFieldsSettings & {
        columns?: Array<{
            id: string;
            label: Record<string, string>;
        }>;
    }
>;

const LinkField: FunctionComponent<LinkFieldProps> = ({
    element,
    readonly,
    formIdToLoad,
    onDeleteMultipleValues,
    metadataEdit = false
}) => {
    const {t} = useSharedTranslation();
    const {state, dispatch} = useEditRecordReducer();
    const {lang} = useLang();
    const {attribute, settings} = element;
    const [backendValues, setBackendValues] = useState<RecordFormElementsValueLinkValue[]>(element.values);

    const calculatedFlags = computeCalculatedFlags(backendValues);
    const inheritedFlags = computeInheritedFlags(backendValues);
    const form = AntForm.useFormInstance();
    const label = localizedTranslation(settings.label, lang);
    const fieldErrors = form.getFieldError(attribute.id);

    const columnsToDisplay = settings.columns?.map(({id}) => id);
    const isReadOnly = attribute.readonly || readonly;
    const canDeleteAllValues = backendValues.length > 1 && attribute.multiple_values && !attribute.required;
    const isFieldInError = fieldErrors.length > 0;

    useOutsideInteractionDetector({
        attribute,
        activeAttribute: state.activeAttribute,
        attributePrefix: LINK_FIELD_ID_PREFIX,
        dispatch,
        backendValues,
        allowedSelectors: ['div[role="status"]:has(.kit-snackbar-message)', '.kit-modal-wrapper']
    });

    useEffect(() => {
        if (state.activeAttribute?.attribute.id === attribute.id) {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                values: backendValues
            });
        }

        //TODO: Voir comment gérer pour la création
        if (formIdToLoad !== 'creation' && backendValues.length === 0 && attribute.required) {
            form.setFields([
                {
                    name: attribute.id,
                    errors: [t('errors.standard_field_required')]
                }
            ]);
        }
    }, [backendValues]);

    //TODO: If not needed, move the following functions to LinkRecordInEdition
    const _removeValues = (filterFn?: (id: string) => boolean) => {
        if (!filterFn) {
            setBackendValues([]);
            form.setFieldValue(attribute.id, []);
            return;
        }

        const newBackendValues = backendValues.filter(backendValue => filterFn(backendValue.linkValue.id));
        setBackendValues(newBackendValues);

        const newFieldValue = form.getFieldValue(attribute.id).filter(filterFn);
        form.setFieldValue(attribute.id, newFieldValue);
    };

    const _handleDeleteAllValues = async () => {
        const deleteRes = await onDeleteMultipleValues(
            attribute.id,
            backendValues.filter(backendValue => backendValue.id_value),
            null
        );

        if (deleteRes.status === APICallStatus.SUCCESS) {
            _removeValues();
        }
    };

    const _handleExplorerRemoveValue = (item: IItemData) => {
        _removeValues(id => id !== item.itemId);
    };

    const _handleExplorerMassDeactivateValues = (
        _massSelectedFilter: RecordFilterInput[],
        massSelection: MassSelection
    ) => {
        _removeValues(id => !massSelection.includes(id));
    };

    const _handleExplorerLinkValue = (saveValuesResult: ISubmitMultipleResult) => {
        if (saveValuesResult.status === APICallStatus.SUCCESS) {
            const saveLinkValues = saveValuesResult.values as unknown as RecordFormElementsValueLinkValue[];

            form.setFieldValue(attribute.id, [
                ...backendValues.map(({linkValue}) => linkValue.id),
                ...saveLinkValues.map(({linkValue}) => linkValue.id)
            ]);

            setBackendValues([...backendValues, ...saveLinkValues]);
        }

        if (saveValuesResult.status === APICallStatus.ERROR && saveValuesResult.errors) {
            const attributeError = saveValuesResult.errors.filter(err => err.attribute === attribute.id)?.[0];

            if (attributeError) {
                const errorMessage =
                    attributeError.type === ErrorTypes.VALIDATION_ERROR
                        ? attributeError.message
                        : t(`errors.${attributeError.type}`);

                form.setFields([
                    {
                        name: attribute.id,
                        errors: [errorMessage]
                    }
                ]);
            }
        }
    };

    const _handleExplorerCreateValue = ({
        recordIdCreated,
        saveValuesResultOnLink
    }: {
        recordIdCreated: string;
        saveValuesResultOnLink?: ISubmitMultipleResult;
    }) => {
        if (saveValuesResultOnLink) {
            _handleExplorerLinkValue(saveValuesResultOnLink);
        }
    };

    console.log({
        state,
        attribute: attribute.id,
        backendValues,
        // calculatedFlags,
        // inheritedFlags,
        form: form.getFieldsValue(),
        formIdToLoad
        // explorerActions
    });

    return (
        <Wrapper $metadataEdit={metadataEdit}>
            <AntForm.Item name={attribute.id} noStyle>
                <KitInputWrapperStyled
                    id={LINK_FIELD_ID_PREFIX + attribute.id}
                    label={label}
                    required={attribute.required}
                    bordered
                    disabled={isReadOnly}
                    status={isFieldInError ? 'error' : undefined}
                    helper={isFieldInError ? String(fieldErrors[0]) : undefined}
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
                    {formIdToLoad === 'creation' ? (
                        <LinkRecordsInCreation
                            libraryId={state.libraryId}
                            isReadOnly={isReadOnly}
                            isMultipleValues={attribute.multiple_values}
                            // hasNoValue={backendValues.length === 0} //TODO: Keep hasNoValue or use children based on selectedRecordIds.length ?
                        />
                    ) : (
                        <LinkRecordsInEdition
                            libraryId={state.libraryId}
                            recordId={state.record.id}
                            attributeId={attribute.id}
                            columnsToDisplay={columnsToDisplay}
                            explorerCallback={{
                                item: {
                                    remove: _handleExplorerRemoveValue
                                },
                                mass: {
                                    deactivate: _handleExplorerMassDeactivateValues
                                },
                                primary: {
                                    create: _handleExplorerCreateValue,
                                    link: _handleExplorerLinkValue
                                }
                            }}
                            isReadOnly={isReadOnly}
                            isMultipleValues={attribute.multiple_values}
                            hasNoValue={backendValues.length === 0}
                        />
                    )}
                </KitInputWrapperStyled>
            </AntForm.Item>
        </Wrapper>
    );
};

export default LinkField;
