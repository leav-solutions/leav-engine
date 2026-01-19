// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {type FunctionComponent, useState} from 'react';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {type RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {type JoinLibraryContextFragment, type RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {type ILinkFieldState} from '../../../reducers/linkFieldReducer/linkFieldReducer';
import {AntForm} from 'aristid-ds';
import {useLang} from '_ui/hooks';
import {LINK_FIELD_ID_PREFIX} from '_ui/constants';
import {computeCalculatedFlags, computeInheritedFlags} from '../../shared/calculatedInheritedFlags';
import {ComputeIndicator} from '../../shared/ComputeIndicator';
import {useOutsideInteractionDetector} from '../../shared/useOutsideInteractionDetector';
import {useLinkRecords} from './link-record/useLinkRecords';
import {
    CREATE_RECORD_MODAL_CLASSNAME,
    EDIT_RECORD_MODAL_CLASSNAME,
    LINK_RECORDS_MODAL_CLASSNAME,
} from '_ui/components/Explorer/_constants';
import {type LinkFieldProps} from '../_types';
import {useUnlinkAllRecords} from '../unlink-all-records/useUnlinkAllRecords';
import {Wrapper} from '../shared/Wrapper';
import {InputExtraAlignLeft} from '../shared/InputExtraAlignLeft';
import {InputWrapper} from '../shared/InputWrapper';

export type LinkFieldReducerState = ILinkFieldState<RecordFormElementsValueLinkValue>;

export const LinkFieldExplorer: FunctionComponent<LinkFieldProps> = ({
    element,
    readonly,
    isFormCreationMode,
    onDeleteMultipleValues,
    metadataEdit = false,
}) => {
    const {state, dispatch} = useEditRecordReducer();
    const {lang} = useLang();
    const {
        settings,
        attribute,
        joinLibraryContext,
    }: {
        settings: typeof element.settings;
        attribute?: RecordFormAttributeLinkAttributeFragment;
        joinLibraryContext?: JoinLibraryContextFragment;
    } = element;

    const [backendValues, setBackendValues] = useState<RecordFormElementsValueLinkValue[]>(element.values);

    const calculatedFlags = computeCalculatedFlags(backendValues);
    const inheritedFlags = computeInheritedFlags(backendValues);
    const form = AntForm.useFormInstance();
    const label = localizedTranslation(settings.label, lang);
    const fieldErrors = form.getFieldError(attribute.id);

    // TODO: Temporary const that should be removed (and all it's usages) when we will have a proper way to override multiple values
    const tmpCantOverrideValues =
        attribute.multiple_values &&
        (calculatedFlags.calculatedValues?.length > 1 || inheritedFlags.inheritedValues?.length > 1);

    const columnsToDisplay = settings.columns?.map(({id}) => id);
    const isReadOnly = attribute.readonly || !attribute.permissions.edit_value || readonly || tmpCantOverrideValues;
    const isFieldInError = fieldErrors.length > 0;

    useOutsideInteractionDetector({
        attribute,
        activeAttribute: state.activeAttribute,
        attributePrefix: LINK_FIELD_ID_PREFIX,
        dispatch,
        backendValues,
        allowedSelectors: [
            'div[role="status"]:has(.kit-snackbar-message)',
            '.kit-modal-wrapper',
            `.${CREATE_RECORD_MODAL_CLASSNAME}`,
            `.${LINK_RECORDS_MODAL_CLASSNAME}`,
            `.${EDIT_RECORD_MODAL_CLASSNAME}`,
            '.kit-select-dropdown-content',
        ],
    });

    const editionFormId = settings.editFormId ? settings.editFormId : 'edition';

    const {LinkRecordsExplorer} = useLinkRecords({
        libraryId: state.libraryId,
        recordId: state.record?.id,
        editionFormId,
        isFormCreationMode,
        attribute,
        joinLibraryContext,
        columnsToDisplay,
        backendValues,
        setBackendValues,
        isReadOnly,
        isFieldInError,
        hasNoValue: backendValues.length === 0,
        onDeleteMultipleValues,
    });

    const {UnlinkAllRecordsButton} = useUnlinkAllRecords({
        attribute,
        backendValues,
        setBackendValues,
        onDeleteMultipleValues,
        isReadOnly,
        isFieldInError,
    });

    return (
        <Wrapper $metadataEdit={metadataEdit}>
            <AntForm.Item name={attribute.id} noStyle>
                <InputWrapper
                    id={LINK_FIELD_ID_PREFIX + attribute.id}
                    label={label}
                    required={attribute.required}
                    bordered
                    status={isFieldInError ? 'error' : undefined}
                    helper={isFieldInError ? String(fieldErrors[0]) : undefined}
                    extra={
                        <>
                            <InputExtraAlignLeft>
                                <ComputeIndicator calculatedFlags={calculatedFlags} inheritedFlags={inheritedFlags} />
                            </InputExtraAlignLeft>
                            {UnlinkAllRecordsButton}
                        </>
                    }
                    $readonlyBackground={isReadOnly}
                >
                    {LinkRecordsExplorer}
                </InputWrapper>
            </AntForm.Item>
        </Wrapper>
    );
};
