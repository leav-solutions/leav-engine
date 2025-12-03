// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {type FunctionComponent, useEffect, useState} from 'react';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {type RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {type JoinLibraryContextFragment, type RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {type ILinkFieldState} from '../../reducers/linkFieldReducer/linkFieldReducer';
import {type IFormElementProps} from '../../_types';
import {AntForm, KitInputWrapper} from 'aristid-ds';
import {useLang} from '_ui/hooks';
import styled, {css} from 'styled-components';
import {LINK_FIELD_ID_PREFIX} from '_ui/constants';
import {computeCalculatedFlags, computeInheritedFlags} from '../shared/calculatedInheritedFlags';
import {ComputeIndicator} from '../shared/ComputeIndicator';
import {useOutsideInteractionDetector} from '../shared/useOutsideInteractionDetector';
import {useLinkRecords} from './link-record/useLinkRecords';
import {
    CREATE_RECORD_MODAL_CLASSNAME,
    EDIT_RECORD_MODAL_CLASSNAME,
    LINK_RECORDS_MODAL_CLASSNAME,
} from '_ui/components/Explorer/_constants';
import {type IFormLinkFieldSettings} from '@leav/utils/src/types/forms';

export type LinkFieldReducerState = ILinkFieldState<RecordFormElementsValueLinkValue>;

const Wrapper = styled.div<{$metadataEdit: boolean}>`
    margin-bottom: ${props => (props.$metadataEdit ? 0 : '1.5em')};
`;

const KitInputExtraAlignLeft = styled.div`
    margin-right: auto;
    line-height: 12px;
`;

const KitInputWrapperStyled = styled(KitInputWrapper)<{$readonlyBackground: boolean}>`
    ${props =>
        props.$readonlyBackground &&
        css`
            .kit-input-wrapper-content {
                background-color: var(--general-utilities-neutral-light);
            }
        `}

    &.disabled {
        .kit-input-wrapper-content {
            background-color: var(--general-utilities-neutral-light);
        }
    }

    &.error:not(.disabled) {
        .kit-input-wrapper-content {
            background-color: var(--general-utilities-error-light);
        }
    }

    .ant-empty-image,
    .ant-empty-description {
        display: none;
    }
`;

type LinkFieldProps = IFormElementProps<
    IFormLinkFieldSettings & {
        columns?: Array<{
            id: string;
            label: Record<string, string>;
        }>;
    }
>;

const LinkField: FunctionComponent<LinkFieldProps> = ({
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

    const {UnlinkAllRecords, LinkRecordsExplorer} = useLinkRecords({
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

    return (
        <Wrapper $metadataEdit={metadataEdit}>
            <AntForm.Item name={attribute.id} noStyle>
                <KitInputWrapperStyled
                    id={LINK_FIELD_ID_PREFIX + attribute.id}
                    data-testid="link-field"
                    label={label}
                    required={attribute.required}
                    bordered
                    status={isFieldInError ? 'error' : undefined}
                    helper={isFieldInError ? String(fieldErrors[0]) : undefined}
                    extra={
                        <>
                            <KitInputExtraAlignLeft>
                                <ComputeIndicator calculatedFlags={calculatedFlags} inheritedFlags={inheritedFlags} />
                            </KitInputExtraAlignLeft>
                            {UnlinkAllRecords}
                        </>
                    }
                    $readonlyBackground={isReadOnly}
                >
                    {LinkRecordsExplorer}
                </KitInputWrapperStyled>
            </AntForm.Item>
        </Wrapper>
    );
};

export default LinkField;
