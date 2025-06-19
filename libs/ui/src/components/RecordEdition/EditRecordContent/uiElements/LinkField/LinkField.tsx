// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {FunctionComponent, useEffect, useState} from 'react';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {JoinLibraryContextFragment, RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {ILinkFieldState} from '../../reducers/linkFieldReducer/linkFieldReducer';
import {IFormElementProps} from '../../_types';
import {AntForm, KitInputWrapper} from 'aristid-ds';
import {useLang} from '_ui/hooks';
import styled from 'styled-components';
import {LINK_FIELD_ID_PREFIX} from '_ui/constants';
import {computeCalculatedFlags, computeInheritedFlags} from '../shared/calculatedInheritedFlags';
import {ComputeIndicator} from '../shared/ComputeIndicator';
import {useOutsideInteractionDetector} from '../shared/useOutsideInteractionDetector';
import {useLinkRecordsInCreation} from './link-record-in-creation/useLinkRecordsInCreation';
import {useLinkRecordsInEdition} from './link-record-in-edition/useLinkRecordsInEdition';
import {
    CREATE_RECORD_MODAL_CLASSNAME,
    EDIT_RECORD_MODAL_CLASSNAME,
    LINK_RECORDS_MODAL_CLASSNAME
} from '_ui/components/Explorer/_constants';
import {IFormLinkFieldSettings} from '@leav/utils/src/types/forms';

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
    formIdToLoad,
    pendingValues,
    onDeleteMultipleValues,
    onValueSubmit,
    onValueDelete,
    metadataEdit = false
}) => {
    const {state, dispatch} = useEditRecordReducer();
    const {lang} = useLang();
    const {
        settings,
        attribute,
        joinLibraryContext
    }: {
        settings: typeof element.settings;
        attribute?: RecordFormAttributeLinkAttributeFragment;
        joinLibraryContext?: JoinLibraryContextFragment;
    } = element;

    const attributesPendingDefaultValues = pendingValues?.[attribute.id]
        ? (Object.values(pendingValues?.[attribute.id]) as unknown as RecordFormElementsValueLinkValue[])
        : [];

    const [attributePendingValues, setAttributePendingValues] =
        useState<RecordFormElementsValueLinkValue[]>(attributesPendingDefaultValues);
    const [backendValues, setBackendValues] = useState<RecordFormElementsValueLinkValue[]>(element.values);

    const calculatedFlags = computeCalculatedFlags(backendValues);
    const inheritedFlags = computeInheritedFlags(backendValues);
    const form = AntForm.useFormInstance();
    const label = localizedTranslation(settings.label, lang);
    const fieldErrors = form.getFieldError(attribute.id);

    const columnsToDisplay = settings.columns?.map(({id}) => id);
    const isReadOnly = attribute.readonly || readonly;
    const isFieldInError = fieldErrors.length > 0;

    useEffect(() => {
        setAttributePendingValues(
            pendingValues?.[attribute.id]
                ? (Object.values(pendingValues?.[attribute.id]) as unknown as RecordFormElementsValueLinkValue[])
                : []
        );
    }, [pendingValues, attribute.id]);

    useOutsideInteractionDetector({
        attribute,
        activeAttribute: state.activeAttribute,
        attributePrefix: LINK_FIELD_ID_PREFIX,
        dispatch,
        formIdToLoad,
        backendValues,
        pendingValues: attributePendingValues,
        allowedSelectors: [
            'div[role="status"]:has(.kit-snackbar-message)',
            '.kit-modal-wrapper',
            `.${CREATE_RECORD_MODAL_CLASSNAME}`,
            `.${LINK_RECORDS_MODAL_CLASSNAME}`,
            `.${EDIT_RECORD_MODAL_CLASSNAME}`
        ]
    });

    const {UnlinkAllRecordsInCreation, LinkRecordsInCreation} = useLinkRecordsInCreation({
        attribute,
        libraryId: attribute.linked_library.id,
        pendingValues: attributePendingValues,
        activeAttribute: state.activeAttribute,
        dispatch,
        isHookUsed: formIdToLoad === 'creation',
        isReadOnly,
        isFieldInError,
        onValueSubmit,
        onValueDelete
    });

    const {UnlinkAllRecordsInEdition, LinkRecordsInEditionExplorer} = useLinkRecordsInEdition({
        libraryId: state.libraryId,
        recordId: state.record?.id,
        attribute,
        joinLibraryContext,
        columnsToDisplay,
        backendValues,
        setBackendValues,
        activeAttribute: state.activeAttribute,
        dispatch,
        isHookUsed: formIdToLoad !== 'creation',
        isReadOnly,
        isFieldInError,
        tagDisplayMode: settings.tagDisplayMode,
        hasNoValue: backendValues.length === 0,
        onDeleteMultipleValues
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
                            {formIdToLoad === 'creation' ? UnlinkAllRecordsInCreation : UnlinkAllRecordsInEdition}
                        </>
                    }
                >
                    {formIdToLoad === 'creation' ? LinkRecordsInCreation : LinkRecordsInEditionExplorer}
                </KitInputWrapperStyled>
            </AntForm.Item>
        </Wrapper>
    );
};

export default LinkField;
